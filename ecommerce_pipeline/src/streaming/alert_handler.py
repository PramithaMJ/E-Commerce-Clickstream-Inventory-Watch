"""
Alert Handler Module for Flash Sale Detection.

"""

import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Protocol

from pyspark.sql import DataFrame, Row
from pyspark.sql.functions import col

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@dataclass
class FlashSaleAlert:
    """Data class representing a flash sale alert.

    Attributes:
        product_id: The product triggering the alert.
        category: Product category.
        view_count: Number of views in the window.
        purchase_count: Number of purchases in the window.
        window_start: Start time of the aggregation window.
        window_end: End time of the aggregation window.
        alert_message: Human-readable alert message.
        created_at: When the alert was generated.
    """

    product_id: str
    category: str
    view_count: int
    purchase_count: int
    window_start: datetime
    window_end: datetime
    alert_message: str
    created_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)

    def to_dict(self) -> dict:
        """Convert alert to dictionary.

        Returns:
            dict: Alert data as dictionary.
        """
        return {
            "product_id": self.product_id,
            "category": self.category,
            "view_count": self.view_count,
            "purchase_count": self.purchase_count,
            "window_start": self.window_start.isoformat() if isinstance(self.window_start, datetime) else str(self.window_start),
            "window_end": self.window_end.isoformat() if isinstance(self.window_end, datetime) else str(self.window_end),
            "alert_message": self.alert_message,
            "created_at": self.created_at.isoformat(),
            "conversion_rate": round(
                self.purchase_count / self.view_count * 100, 2
            ) if self.view_count > 0 else 0.0
        }

    def to_json(self) -> str:
        """Convert alert to JSON string.

        Returns:
            str: JSON representation of the alert.
        """
        return json.dumps(self.to_dict())


class AlertHandler(Protocol):
    """Protocol for alert handlers.

    This protocol defines the interface for handling flash sale alerts.
    Implementations can send alerts to different destinations.
    """

    def handle(self, alert: FlashSaleAlert) -> bool:
        """Handle a single alert.

        Args:
            alert: The flash sale alert to handle.

        Returns:
            bool: True if handled successfully.
        """
        ...


class ConsoleAlertHandler:
    """Handler that logs alerts to console.

    Simple handler for development and debugging purposes.
    """

    def handle(self, alert: FlashSaleAlert) -> bool:
        """Log the alert to console with formatting.

        Args:
            alert: The flash sale alert to handle.

        Returns:
            bool: Always True.
        """
        logger.warning(
            f"\n{'='*60}\n"
            f"🚨 FLASH SALE ALERT 🚨\n"
            f"{'='*60}\n"
            f"Product ID: {alert.product_id}\n"
            f"Category: {alert.category}\n"
            f"Views: {alert.view_count}\n"
            f"Purchases: {alert.purchase_count}\n"
            f"Conversion Rate: {alert.to_dict()['conversion_rate']:.2f}%\n"
            f"Window: {alert.window_start} to {alert.window_end}\n"
            f"Message: {alert.alert_message}\n"
            f"{'='*60}\n"
        )
        return True


class FileAlertHandler:
    """Handler that writes alerts to a file.

    Useful for audit trails and later analysis.

    Attributes:
        output_path: Path to the output file.
    """

    def __init__(self, output_path: str) -> None:
        """Initialize the file alert handler.

        Args:
            output_path: Path to write alerts to.
        """
        self.output_path = output_path

    def handle(self, alert: FlashSaleAlert) -> bool:
        """Append alert to the output file.

        Args:
            alert: The flash sale alert to handle.

        Returns:
            bool: True if written successfully.
        """
        try:
            with open(self.output_path, "a") as f:
                f.write(alert.to_json() + "\n")
            return True
        except IOError as e:
            logger.error(f"Failed to write alert to file: {e}")
            return False


class KafkaAlertHandler:
    """Handler that publishes alerts to a Kafka topic.

    Enables downstream consumers to react to alerts in real-time.

    Attributes:
        bootstrap_servers: Kafka broker addresses.
        topic: Alert topic name.
    """

    def __init__(
        self,
        bootstrap_servers: str,
        topic: str = "flash_sale_alerts"
    ) -> None:
        """Initialize the Kafka alert handler.

        Args:
            bootstrap_servers: Kafka broker addresses.
            topic: Topic to publish alerts to.
        """
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self._producer = None

    def _get_producer(self):
        """Lazy initialization of Kafka producer."""
        if self._producer is None:
            try:
                from confluent_kafka import Producer
                self._producer = Producer({
                    "bootstrap.servers": self.bootstrap_servers,
                    "client.id": "flash-sale-alert-handler"
                })
            except ImportError:
                logger.warning("confluent_kafka not available")
                return None
        return self._producer

    def handle(self, alert: FlashSaleAlert) -> bool:
        """Publish alert to Kafka topic.

        Args:
            alert: The flash sale alert to handle.

        Returns:
            bool: True if published successfully.
        """
        producer = self._get_producer()
        if producer is None:
            return False

        try:
            producer.produce(
                topic=self.topic,
                key=alert.product_id.encode("utf-8"),
                value=alert.to_json().encode("utf-8")
            )
            producer.poll(0)
            return True
        except Exception as e:
            logger.error(f"Failed to publish alert to Kafka: {e}")
            return False


class AlertProcessor:
    """Processor that coordinates multiple alert handlers.

    This class follows the Strategy Pattern, allowing multiple
    handlers to process each alert.

    Attributes:
        handlers: List of alert handlers.
    """

    def __init__(self) -> None:
        """Initialize the alert processor with empty handler list."""
        self.handlers: List[AlertHandler] = []

    def add_handler(self, handler: AlertHandler) -> "AlertProcessor":
        """Add a handler to the processor.

        Args:
            handler: Handler to add.

        Returns:
            AlertProcessor: Self for method chaining.
        """
        self.handlers.append(handler)
        return self

    def process(self, alert: FlashSaleAlert) -> Dict[str, bool]:
        """Process an alert through all handlers.

        Args:
            alert: The alert to process.

        Returns:
            dict: Results from each handler.
        """
        results = {}
        for handler in self.handlers:
            handler_name = handler.__class__.__name__
            try:
                results[handler_name] = handler.handle(alert)
            except Exception as e:
                logger.error(f"Handler {handler_name} failed: {e}")
                results[handler_name] = False
        return results

    def process_batch(self, alerts: List[FlashSaleAlert]) -> List[Dict]:
        """Process multiple alerts.

        Args:
            alerts: List of alerts to process.

        Returns:
            list: Results for each alert.
        """
        return [self.process(alert) for alert in alerts]


def create_alert_from_row(row: Row) -> FlashSaleAlert:
    """Convert a Spark Row to a FlashSaleAlert.

    Args:
        row: Spark Row containing alert data.

    Returns:
        FlashSaleAlert: Constructed alert object.
    """
    window_data = row["window"]
    return FlashSaleAlert(
        product_id=row["product_id"],
        category=row.get("category", "unknown"),
        view_count=row["view_count"],
        purchase_count=row["purchase_count"],
        window_start=window_data.start,
        window_end=window_data.end,
        alert_message="High Interest, Low Conversion - Consider Flash Sale!"
    )


def process_alert_batch(batch_df: DataFrame, batch_id: int) -> None:
    """Foreachbatch function for Spark Structured Streaming.

    This function is called by Spark for each micro-batch of alerts.

    Args:
        batch_df: DataFrame containing alerts in this batch.
        batch_id: Unique batch identifier.
    """
    if batch_df.count() == 0:
        return

    # Create alert processor with desired handlers
    processor = AlertProcessor()
    processor.add_handler(ConsoleAlertHandler())
    processor.add_handler(FileAlertHandler("/opt/spark-data/alerts.jsonl"))

    # Process each alert
    for row in batch_df.collect():
        alert = create_alert_from_row(row)
        processor.process(alert)

    logger.info(f"Processed {batch_df.count()} alerts in batch {batch_id}")
