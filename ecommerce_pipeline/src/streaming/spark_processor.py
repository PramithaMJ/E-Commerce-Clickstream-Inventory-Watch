"""
Spark Structured Streaming Processor for E-Commerce Clickstream.

This module implements real-time stream processing using Spark Structured
Streaming with Event Time semantics and sliding window aggregations.

Event Time vs Processing Time:
    - Event Time: The timestamp when the event actually occurred (embedded in data)
    - Processing Time: The time when Spark processes the event

    This implementation uses EVENT TIME for accurate analytics as it reflects
    actual user behavior timing, not processing delays. Watermarking handles
    late-arriving events with a 2-minute tolerance.
"""

import logging
import sys
from typing import Generic, TypeVar

from pyspark.sql import SparkSession, DataFrame
from pyspark.sql.functions import (
    col,
    count,
    from_json,
    to_timestamp,
    when,
    window,
    lit,
    current_timestamp,
)
from pyspark.sql.types import (
    StructType,
    StructField,
    StringType,
    TimestampType,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Type variable for generic processor
T = TypeVar("T")


class ClickstreamSchema:
    """Schema definitions for clickstream events.

    This class provides the Spark schema for parsing JSON events
    from Kafka. The schema matches the ClickstreamEvent Pydantic model.
    """

    @staticmethod
    def get_schema() -> StructType:
        """Get the Spark schema for clickstream events.

        Returns:
            StructType: The Spark schema for event parsing.
        """
        return StructType([
            StructField("user_id", StringType(), nullable=False),
            StructField("product_id", StringType(), nullable=False),
            StructField("event_type", StringType(), nullable=False),
            StructField("timestamp", StringType(), nullable=False),
            StructField("category", StringType(), nullable=True),
            StructField("session_id", StringType(), nullable=True),
        ])


class SparkSessionFactory:
    """Factory for creating Spark sessions.

    Centralizes Spark session creation with proper Kafka configuration.
    Follows the Factory Pattern for consistent session initialization.
    """

    @staticmethod
    def create(
        app_name: str = "EcommerceClickstreamProcessor",
        master: str = "local[*]",
        kafka_packages: bool = True
    ) -> SparkSession:
        """Create a configured Spark session.

        Args:
            app_name: Name of the Spark application.
            master: Spark master URL.
            kafka_packages: Whether to include Kafka connector packages.

        Returns:
            SparkSession: Configured Spark session.
        """
        builder = SparkSession.builder \
            .appName(app_name) \
            .master(master)

        if kafka_packages:
            builder = builder.config(
                "spark.jars.packages",
                "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0"
            )

        # Memory and shuffle configuration
        builder = builder \
            .config("spark.sql.shuffle.partitions", "4") \
            .config("spark.driver.memory", "2g") \
            .config("spark.executor.memory", "2g") \
            .config("spark.sql.streaming.checkpointLocation", "/tmp/checkpoints")

        session = builder.getOrCreate()
        session.sparkContext.setLogLevel("WARN")

        logger.info(f"Spark session created: {app_name} on {master}")
        return session


class SparkStreamProcessor(Generic[T]):
    """Generic Spark Structured Streaming processor.

    This class provides a base implementation for processing streaming
    data from Kafka using Spark Structured Streaming with Event Time
    windowing.

    Type Parameters:
        T: The type of aggregated output.

    Attributes:
        spark: The Spark session.
        kafka_bootstrap_servers: Kafka broker addresses.
        kafka_topic: Source Kafka topic.
        window_duration: Window size for aggregations.
        slide_duration: Slide interval for windows.
        watermark_delay: Tolerance for late events.

    Example:
        >>> processor = SparkStreamProcessor(
        ...     spark=SparkSessionFactory.create(),
        ...     kafka_bootstrap_servers="localhost:9092",
        ...     kafka_topic="clickstream_events"
        ... )
        >>> processor.start_processing()
    """

    def __init__(
        self,
        spark: SparkSession,
        kafka_bootstrap_servers: str,
        kafka_topic: str,
        window_duration: str = "10 minutes",
        slide_duration: str = "5 minutes",
        watermark_delay: str = "2 minutes",
        checkpoint_location: str = "/tmp/spark-checkpoints"
    ) -> None:
        """Initialize the stream processor.

        Args:
            spark: Active Spark session.
            kafka_bootstrap_servers: Kafka broker addresses.
            kafka_topic: Kafka topic to consume.
            window_duration: Window size (e.g., "10 minutes").
            slide_duration: Slide interval (e.g., "5 minutes").
            watermark_delay: Late event tolerance (e.g., "2 minutes").
            checkpoint_location: Directory for checkpoints.
        """
        self.spark = spark
        self.kafka_bootstrap_servers = kafka_bootstrap_servers
        self.kafka_topic = kafka_topic
        self.window_duration = window_duration
        self.slide_duration = slide_duration
        self.watermark_delay = watermark_delay
        self.checkpoint_location = checkpoint_location
        self._schema = ClickstreamSchema.get_schema()

        logger.info(
            f"Stream processor initialized for topic '{kafka_topic}' "
            f"with {window_duration} window, {slide_duration} slide"
        )

    def _read_from_kafka(self) -> DataFrame:
        """Read streaming data from Kafka.

        Returns:
            DataFrame: Raw streaming DataFrame from Kafka.

        Note:
            Uses 'earliest' offset to not miss any historical data.
            In production, consider 'latest' for real-time only processing.
        """
        return self.spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", self.kafka_bootstrap_servers) \
            .option("subscribe", self.kafka_topic) \
            .option("startingOffsets", "earliest") \
            .option("failOnDataLoss", "false") \
            .load()

    def _parse_events(self, kafka_df: DataFrame) -> DataFrame:
        """Parse JSON events from Kafka messages.

        Args:
            kafka_df: Raw Kafka DataFrame.

        Returns:
            DataFrame: Parsed events with proper types.

        Note:
            This is where we convert the string timestamp to a proper
            TimestampType for Event Time processing.
        """
        return kafka_df \
            .select(
                from_json(
                    col("value").cast("string"),
                    self._schema
                ).alias("data")
            ) \
            .select("data.*") \
            .withColumn(
                "event_timestamp",
                to_timestamp(col("timestamp"))
            )

    def _apply_watermark(self, parsed_df: DataFrame) -> DataFrame:
        """Apply watermark for handling late events.

        The watermark tells Spark how long to wait for late events
        before considering a window complete.

        Args:
            parsed_df: DataFrame with event_timestamp column.

        Returns:
            DataFrame: DataFrame with watermark applied.

        Event Time Handling:
            - The 'event_timestamp' column contains the EVENT TIME
              (when the user action actually occurred)
            - The watermark allows events arriving up to 2 minutes late
              to still be included in their correct time windows
        """
        return parsed_df.withWatermark("event_timestamp", self.watermark_delay)

    def _aggregate_by_window(self, watermarked_df: DataFrame) -> DataFrame:
        """Aggregate events by time window and product.

        Creates sliding windows based on EVENT TIME and counts
        views and purchases per product within each window.

        Args:
            watermarked_df: DataFrame with watermark applied.

        Returns:
            DataFrame: Aggregated counts per window and product.

        Window Semantics:
            - 10-minute windows with 5-minute slides means:
              * Events at 10:00 appear in windows [09:55-10:05] and [10:00-10:10]
              * This provides overlapping coverage for trend detection
        """
        return watermarked_df.groupBy(
            window(
                col("event_timestamp"),
                self.window_duration,
                self.slide_duration
            ),
            col("product_id"),
            col("category")
        ).agg(
            count(
                when(col("event_type") == "view", 1)
            ).alias("view_count"),
            count(
                when(col("event_type") == "add_to_cart", 1)
            ).alias("cart_count"),
            count(
                when(col("event_type") == "purchase", 1)
            ).alias("purchase_count"),
            count("*").alias("total_events")
        )

    def create_aggregation_stream(self) -> DataFrame:
        """Create the complete aggregation stream pipeline.

        Returns:
            DataFrame: Streaming DataFrame with windowed aggregations.
        """
        kafka_df = self._read_from_kafka()
        parsed_df = self._parse_events(kafka_df)
        watermarked_df = self._apply_watermark(parsed_df)
        aggregated_df = self._aggregate_by_window(watermarked_df)

        return aggregated_df

    def write_to_console(
        self,
        df: DataFrame,
        output_mode: str = "update",
        trigger_interval: str = "30 seconds"
    ):
        """Write streaming results to console for debugging.

        Args:
            df: Streaming DataFrame to output.
            output_mode: Output mode ('append', 'update', 'complete').
            trigger_interval: How often to trigger output.

        Returns:
            StreamingQuery: The running query handle.
        """
        return df.writeStream \
            .outputMode(output_mode) \
            .format("console") \
            .option("truncate", "false") \
            .trigger(processingTime=trigger_interval) \
            .start()

    def write_to_parquet(
        self,
        output_path: str,
        checkpoint_location: str | None = None
    ):
        """Write raw events to Parquet for batch layer.

        This archives all events to Parquet files for the batch layer
        (user segmentation job) to process later.

        Args:
            output_path: Directory for Parquet files.
            checkpoint_location: Checkpoint directory.

        Returns:
            StreamingQuery: The running query handle.
        """
        kafka_df = self._read_from_kafka()
        parsed_df = self._parse_events(kafka_df)

        checkpoint_loc = checkpoint_location or f"{self.checkpoint_location}/parquet"

        return parsed_df.writeStream \
            .outputMode("append") \
            .format("parquet") \
            .option("path", output_path) \
            .option("checkpointLocation", checkpoint_loc) \
            .partitionBy("category") \
            .trigger(processingTime="1 minute") \
            .start()


class ClickstreamProcessor(SparkStreamProcessor):
    """Specialized processor for clickstream data with alert detection.

    Extends the base processor with flash sale alert detection logic.

    Attributes:
        min_views_threshold: Minimum views for "high interest".
        max_purchases_threshold: Maximum purchases for "low conversion".
    """

    def __init__(
        self,
        spark: SparkSession,
        kafka_bootstrap_servers: str,
        kafka_topic: str,
        min_views_threshold: int = 100,
        max_purchases_threshold: int = 5,
        **kwargs
    ) -> None:
        """Initialize the clickstream processor.

        Args:
            spark: Active Spark session.
            kafka_bootstrap_servers: Kafka broker addresses.
            kafka_topic: Source Kafka topic.
            min_views_threshold: Minimum views for alert.
            max_purchases_threshold: Maximum purchases for alert.
            **kwargs: Additional arguments for base class.
        """
        super().__init__(
            spark=spark,
            kafka_bootstrap_servers=kafka_bootstrap_servers,
            kafka_topic=kafka_topic,
            **kwargs
        )
        self.min_views_threshold = min_views_threshold
        self.max_purchases_threshold = max_purchases_threshold

        logger.info(
            f"Alert thresholds: views > {min_views_threshold}, "
            f"purchases < {max_purchases_threshold}"
        )

    def detect_flash_sale_candidates(
        self,
        aggregated_df: DataFrame
    ) -> DataFrame:
        """Filter for products that are flash sale candidates.

        A product is a "Flash Sale" candidate when it has high interest
        (many views) but low conversion (few purchases).

        Args:
            aggregated_df: Windowed aggregation results.

        Returns:
            DataFrame: Products meeting flash sale criteria.

        Business Logic:
            - IF views > 100 AND purchases < 5
            - THEN suggest "Flash Sale" or discount
        """
        return aggregated_df.filter(
            (col("view_count") > self.min_views_threshold) &
            (col("purchase_count") < self.max_purchases_threshold)
        ).withColumn(
            "alert_type",
            lit("FLASH_SALE_CANDIDATE")
        ).withColumn(
            "alert_message",
            lit("High Interest, Low Conversion - Consider Flash Sale!")
        ).withColumn(
            "alert_timestamp",
            current_timestamp()
        )


def main() -> None:
    """Main entry point for the stream processor.

    Starts the Spark Structured Streaming job with:
    1. Windowed aggregation with console output
    2. Raw event archival to Parquet
    3. Flash sale alert detection
    """
    # Try to load settings, fall back to defaults
    sys.path.insert(0, "/opt/spark-apps")
    try:
        from config.settings import get_settings
        settings = get_settings()
        kafka_servers = settings.kafka.bootstrap_servers
        kafka_topic = settings.kafka.clickstream_topic
        spark_master = settings.spark.master_url
        window_duration = f"{settings.spark.window_duration} minutes"
        slide_duration = f"{settings.spark.slide_duration} minutes"
        watermark_delay = settings.spark.watermark_delay
        parquet_path = settings.spark.parquet_output_path
        checkpoint_path = settings.spark.checkpoint_location
        min_views = settings.alert.min_views_threshold
        max_purchases = settings.alert.max_purchases_threshold
    except ImportError:
        logger.warning("Settings not found, using defaults")
        kafka_servers = "broker:29092"
        kafka_topic = "clickstream_events"
        spark_master = "spark://spark-master:7077"
        window_duration = "10 minutes"
        slide_duration = "5 minutes"
        watermark_delay = "2 minutes"
        parquet_path = "/opt/spark-data/parquet"
        checkpoint_path = "/opt/spark-data/checkpoints"
        min_views = 100
        max_purchases = 5

    # Create Spark session
    spark = SparkSessionFactory.create(
        app_name="EcommerceClickstreamProcessor",
        master=spark_master,
        kafka_packages=False  # JARs already in classpath via Docker
    )

    # Create processor
    processor = ClickstreamProcessor(
        spark=spark,
        kafka_bootstrap_servers=kafka_servers,
        kafka_topic=kafka_topic,
        window_duration=window_duration,
        slide_duration=slide_duration,
        watermark_delay=watermark_delay,
        checkpoint_location=checkpoint_path,
        min_views_threshold=min_views,
        max_purchases_threshold=max_purchases
    )

    # Start aggregation stream
    aggregated_df = processor.create_aggregation_stream()

    # Output aggregations to console
    console_query = processor.write_to_console(
        aggregated_df,
        output_mode="update",
        trigger_interval="30 seconds"
    )

    # Start Parquet archival
    parquet_query = processor.write_to_parquet(
        output_path=parquet_path,
        checkpoint_location=f"{checkpoint_path}/parquet"
    )

    # Detect and output flash sale candidates
    flash_sale_df = processor.detect_flash_sale_candidates(aggregated_df)
    alert_query = flash_sale_df.writeStream \
        .outputMode("update") \
        .format("console") \
        .option("truncate", "false") \
        .trigger(processingTime="30 seconds") \
        .queryName("flash_sale_alerts") \
        .start()

    logger.info("Stream processing started. Waiting for termination...")
    logger.info(f"Aggregation output every 30 seconds")
    logger.info(f"Parquet archival to {parquet_path}")
    logger.info(f"Flash sale alerts: views > {min_views}, purchases < {max_purchases}")

    # Wait for any query to terminate
    try:
        spark.streams.awaitAnyTermination()
    except KeyboardInterrupt:
        logger.info("Stopping stream processing...")
        console_query.stop()
        parquet_query.stop()
        alert_query.stop()
        spark.stop()


if __name__ == "__main__":
    main()
