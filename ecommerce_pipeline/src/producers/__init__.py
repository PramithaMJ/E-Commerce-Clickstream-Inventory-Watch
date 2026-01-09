"""Producers module for E-Commerce Clickstream Pipeline."""

from src.producers.data_generator import (
    ClickstreamEvent,
    DataGenerator,
    DataGeneratorFactory,
    EventType,
    ProductCategory,
    RandomDataGenerator,
    SkewedDataGenerator,
    BurstDataGenerator,
    create_event_stream,
)
from src.producers.kafka_producer import (
    KafkaEventProducer,
    ensure_topic_exists,
)

__all__ = [
    "ClickstreamEvent",
    "DataGenerator",
    "DataGeneratorFactory",
    "EventType",
    "ProductCategory",
    "RandomDataGenerator",
    "SkewedDataGenerator",
    "BurstDataGenerator",
    "create_event_stream",
    "KafkaEventProducer",
    "ensure_topic_exists",
]
