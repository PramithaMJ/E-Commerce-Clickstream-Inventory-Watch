"""
Configuration module for E-Commerce Clickstream Pipeline.
"""

from functools import lru_cache
from typing import ClassVar, List, Optional, Union

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class KafkaSettings(BaseSettings):
    """Kafka connection and topic settings.

    Attributes:
        bootstrap_servers: Kafka broker addresses (comma-separated).
        clickstream_topic: Topic for raw clickstream events.
        alerts_topic: Topic for flash sale alerts.
        consumer_group: Consumer group ID for stream processing.
    """

    model_config = SettingsConfigDict(
        env_prefix="KAFKA_",
        env_file=".env",
        extra="ignore"
    )

    bootstrap_servers: str = Field(
        default="broker:29092",
        description="Kafka broker addresses"
    )
    clickstream_topic: str = Field(
        default="clickstream_events",
        description="Topic for clickstream events"
    )
    alerts_topic: str = Field(
        default="flash_sale_alerts",
        description="Topic for flash sale alerts"
    )
    consumer_group: str = Field(
        default="ecommerce_processor",
        description="Consumer group ID"
    )


class SparkSettings(BaseSettings):
    """Spark processing configuration.

    Attributes:
        master_url: Spark master URL.
        app_name: Application name for Spark UI.
        window_duration: Window duration in minutes.
        slide_duration: Slide interval in minutes.
        watermark_delay: Watermark delay for late event tolerance.
        checkpoint_location: Directory for Spark checkpoints.
        parquet_output_path: Directory for Parquet file output.
    """

    model_config = SettingsConfigDict(
        env_prefix="SPARK_",
        env_file=".env",
        extra="ignore"
    )

    master_url: str = Field(
        default="spark://spark-master:7077",
        description="Spark master URL"
    )
    app_name: str = Field(
        default="EcommerceClickstreamProcessor",
        description="Spark application name"
    )
    window_duration: int = Field(
        default=10,
        ge=1,
        le=60,
        description="Window duration in minutes"
    )
    slide_duration: int = Field(
        default=5,
        ge=1,
        le=30,
        description="Slide interval in minutes"
    )
    watermark_delay: str = Field(
        default="2 minutes",
        description="Watermark delay for late events"
    )
    checkpoint_location: str = Field(
        default="/opt/spark-data/checkpoints",
        description="Checkpoint directory"
    )
    parquet_output_path: str = Field(
        default="/opt/spark-data/parquet",
        description="Parquet output directory"
    )


class AlertSettings(BaseSettings):
    """Alert trigger thresholds for flash sale detection.

    Attributes:
        min_views_threshold: Minimum views to consider high interest.
        max_purchases_threshold: Maximum purchases to indicate low conversion.
    """

    model_config = SettingsConfigDict(
        env_prefix="ALERT_",
        env_file=".env",
        extra="ignore"
    )

    min_views_threshold: int = Field(
        default=100,
        ge=1,
        description="Minimum views for high interest"
    )
    max_purchases_threshold: int = Field(
        default=5,
        ge=0,
        description="Maximum purchases for low conversion"
    )


class ProducerSettings(BaseSettings):
    """Data producer configuration.

    Attributes:
        events_per_second: Rate of event generation.
        high_interest_product_ids: Product IDs to skew with high views.
        high_interest_probability: Probability of generating high interest events.
        num_users: Number of simulated users.
        num_products: Number of simulated products.
    """

    model_config = SettingsConfigDict(
        env_prefix="PRODUCER_",
        env_file=".env",
        extra="ignore"
    )

    events_per_second: float = Field(
        default=10.0,
        ge=0.1,
        le=1000.0,
        description="Events generated per second"
    )
    high_interest_product_ids: List[str] = Field(
        default=["PROD_001", "PROD_002", "PROD_003"],
        description="Products to skew with high views"
    )
    high_interest_probability: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Probability of high interest event"
    )
    num_users: int = Field(
        default=1000,
        ge=1,
        description="Number of simulated users"
    )
    num_products: int = Field(
        default=100,
        ge=1,
        description="Number of simulated products"
    )

    @field_validator("high_interest_product_ids", mode="before")
    @classmethod
    def parse_product_ids(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse comma-separated product IDs from environment variable."""
        if isinstance(v, str):
            return [pid.strip() for pid in v.split(",")]
        return v


class AirflowSettings(BaseSettings):
    """Airflow DAG configuration.

    Attributes:
        dag_id: Unique identifier for the DAG.
        schedule_interval: Cron expression for DAG schedule.
        reports_output_path: Directory for generated reports.
    """

    model_config = SettingsConfigDict(
        env_prefix="AIRFLOW_",
        env_file=".env",
        extra="ignore"
    )

    dag_id: str = Field(
        default="ecommerce_daily_segmentation",
        description="DAG identifier"
    )
    schedule_interval: str = Field(
        default="0 2 * * *",
        description="Cron schedule (2 AM daily)"
    )
    reports_output_path: str = Field(
        default="/opt/airflow/reports",
        description="Reports output directory"
    )


class AppSettings(BaseSettings):
    """Main application configuration - Singleton pattern.

    This class aggregates all sub-configurations and provides a single
    access point for the entire application configuration.

    Usage:
        settings = get_settings()
        kafka_config = settings.kafka
        spark_config = settings.spark
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    # Sub-configurations
    kafka: KafkaSettings = Field(default_factory=KafkaSettings)
    spark: SparkSettings = Field(default_factory=SparkSettings)
    alert: AlertSettings = Field(default_factory=AlertSettings)
    producer: ProducerSettings = Field(default_factory=ProducerSettings)
    airflow: AirflowSettings = Field(default_factory=AirflowSettings)

    # Application metadata
    app_name: str = Field(
        default="E-Commerce Clickstream Pipeline",
        description="Application name"
    )
    environment: str = Field(
        default="development",
        description="Deployment environment"
    )
    debug: bool = Field(
        default=True,
        description="Enable debug mode"
    )

    # Singleton instance holder (private)
    _instance: ClassVar[Optional["AppSettings"]] = None

    @classmethod
    def get_instance(cls) -> "AppSettings":
        """Get or create the singleton instance.

        Returns:
            AppSettings: The singleton configuration instance.
        """
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance


@lru_cache(maxsize=1)
def get_settings() -> AppSettings:
    """Get the application settings (Singleton pattern with caching).

    This function uses lru_cache to ensure only one instance is created
    and reused throughout the application lifecycle.

    Returns:
        AppSettings: The singleton configuration instance.

    Example:
        >>> settings = get_settings()
        >>> print(settings.kafka.bootstrap_servers)
        'localhost:9092'
    """
    return AppSettings.get_instance()
