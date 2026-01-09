"""Streaming module for E-Commerce Clickstream Pipeline."""

from src.streaming.spark_processor import (
    ClickstreamSchema,
    SparkSessionFactory,
    SparkStreamProcessor,
    ClickstreamProcessor,
)
from src.streaming.alert_handler import (
    FlashSaleAlert,
    AlertHandler,
    ConsoleAlertHandler,
    FileAlertHandler,
    KafkaAlertHandler,
    AlertProcessor,
    create_alert_from_row,
    process_alert_batch,
)

__all__ = [
    "ClickstreamSchema",
    "SparkSessionFactory",
    "SparkStreamProcessor",
    "ClickstreamProcessor",
    "FlashSaleAlert",
    "AlertHandler",
    "ConsoleAlertHandler",
    "FileAlertHandler",
    "KafkaAlertHandler",
    "AlertProcessor",
    "create_alert_from_row",
    "process_alert_batch",
]
