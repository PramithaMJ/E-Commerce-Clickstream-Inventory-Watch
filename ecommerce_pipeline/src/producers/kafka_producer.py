"""
Kafka Producer Module for E-Commerce Clickstream Pipeline.

This module provides a robust Kafka producer implementation for
publishing clickstream events to the message queue.

"""

import json
import logging
import sys
import time
from typing import Callable, Dict, Optional, Union

from confluent_kafka import Producer, KafkaError, KafkaException
from confluent_kafka.admin import AdminClient, NewTopic

from src.producers.data_generator import (
    ClickstreamEvent,
    DataGenerator,
    DataGeneratorFactory,
    create_event_stream,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class KafkaEventProducer:
    """Kafka producer for clickstream events.

    This class wraps the Confluent Kafka producer with delivery
    callbacks, error handling, and graceful shutdown support.

    Attributes:
        bootstrap_servers: Kafka broker addresses.
        topic: Target topic for events.
        producer: Confluent Kafka Producer instance.

    Example:
        >>> producer = KafkaEventProducer("localhost:9092", "clickstream_events")
        >>> generator = DataGeneratorFactory.create("skewed")
        >>> producer.produce_events(generator, events_per_second=10, duration=60)
    """

    def __init__(
        self,
        bootstrap_servers: str,
        topic: str,
        config: Optional[Dict] = None
    ) -> None:
        """Initialize the Kafka producer.

        Args:
            bootstrap_servers: Kafka broker addresses (comma-separated).
            topic: Target Kafka topic.
            config: Additional producer configuration.
        """
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self._delivery_count = 0
        self._error_count = 0

        # Default producer configuration
        producer_config = {
            "bootstrap.servers": bootstrap_servers,
            "client.id": "ecommerce-clickstream-producer",
            "acks": "all",  # Wait for all replicas
            "retries": 3,
            "retry.backoff.ms": 100,
            "linger.ms": 5,  # Batch messages for 5ms
            "batch.size": 16384,  # 16KB batch size
            "compression.type": "gzip",
        }

        # Merge with custom config
        if config:
            producer_config.update(config)

        self.producer = Producer(producer_config)
        logger.info(
            f"Kafka producer initialized for topic '{topic}' "
            f"on {bootstrap_servers}"
        )

    def _delivery_callback(
        self,
        err: Optional[KafkaError],
        msg
    ) -> None:
        """Callback for message delivery confirmation.

        Args:
            err: Error if delivery failed, None otherwise.
            msg: The message that was delivered.
        """
        if err is not None:
            self._error_count += 1
            logger.error(
                f"Message delivery failed: {err}. "
                f"Topic: {msg.topic()}, Partition: {msg.partition()}"
            )
        else:
            self._delivery_count += 1
            if self._delivery_count % 100 == 0:
                logger.debug(
                    f"Delivered {self._delivery_count} messages to "
                    f"{msg.topic()}[{msg.partition()}]"
                )

    def produce_event(self, event: ClickstreamEvent) -> None:
        """Produce a single event to Kafka.

        Args:
            event: The clickstream event to produce.

        Raises:
            KafkaException: If production fails after retries.
        """
        try:
            self.producer.produce(
                topic=self.topic,
                key=event.product_id.encode("utf-8"),
                value=event.to_json().encode("utf-8"),
                callback=self._delivery_callback
            )
            # Trigger callbacks for any delivered messages
            self.producer.poll(0)
        except BufferError:
            logger.warning("Producer queue full, waiting...")
            self.producer.poll(1)
            # Retry after waiting
            self.producer.produce(
                topic=self.topic,
                key=event.product_id.encode("utf-8"),
                value=event.to_json().encode("utf-8"),
                callback=self._delivery_callback
            )

    def produce_events(
        self,
        generator: DataGenerator,
        events_per_second: float = 10.0,
        duration: Optional[int] = None,
        max_events: Optional[int] = None,
        on_produce: Optional[Callable[[ClickstreamEvent], None]] = None
    ) -> Dict[str, int]:
        """Produce events continuously with rate limiting.

        Args:
            generator: Data generator for creating events.
            events_per_second: Target rate of event production.
            duration: Duration in seconds (None for indefinite).
            max_events: Maximum events to produce (None for unlimited).
            on_produce: Optional callback for each produced event.

        Returns:
            dict: Statistics about the production run.
        """
        interval = 1.0 / events_per_second
        start_time = time.time()
        events_produced = 0

        logger.info(
            f"Starting event production at {events_per_second} events/sec. "
            f"Duration: {duration or 'indefinite'}s, "
            f"Max events: {max_events or 'unlimited'}"
        )

        try:
            for event in create_event_stream(generator, count=max_events):
                # Check duration limit
                if duration and (time.time() - start_time) >= duration:
                    logger.info(f"Duration limit ({duration}s) reached")
                    break

                # Produce the event
                self.produce_event(event)
                events_produced += 1

                # Optional callback
                if on_produce:
                    on_produce(event)

                # Log progress
                if events_produced % 100 == 0:
                    elapsed = time.time() - start_time
                    rate = events_produced / elapsed if elapsed > 0 else 0
                    logger.info(
                        f"Produced {events_produced} events "
                        f"(actual rate: {rate:.1f}/s)"
                    )

                # Rate limiting
                time.sleep(interval)

        except KeyboardInterrupt:
            logger.info("Production interrupted by user")
        finally:
            # Flush remaining messages
            self.flush()

        elapsed_time = time.time() - start_time
        stats = {
            "events_produced": events_produced,
            "events_delivered": self._delivery_count,
            "errors": self._error_count,
            "elapsed_seconds": round(elapsed_time, 2),
            "actual_rate": round(events_produced / elapsed_time, 2) if elapsed_time > 0 else 0
        }

        logger.info(f"Production complete: {stats}")
        return stats

    def flush(self, timeout: float = 10.0) -> int:
        """Flush pending messages and wait for delivery.

        Args:
            timeout: Maximum time to wait for flush.

        Returns:
            int: Number of messages still in queue after flush.
        """
        remaining = self.producer.flush(timeout)
        if remaining > 0:
            logger.warning(f"{remaining} messages were not delivered")
        return remaining

    def close(self) -> None:
        """Close the producer and release resources."""
        self.flush()
        logger.info(
            f"Producer closed. Total delivered: {self._delivery_count}, "
            f"Errors: {self._error_count}"
        )


def ensure_topic_exists(
    bootstrap_servers: str,
    topic: str,
    num_partitions: int = 3,
    replication_factor: int = 1
) -> bool:
    """Ensure a Kafka topic exists, creating it if necessary.

    Args:
        bootstrap_servers: Kafka broker addresses.
        topic: Topic name to ensure exists.
        num_partitions: Number of partitions for new topic.
        replication_factor: Replication factor for new topic.

    Returns:
        bool: True if topic exists or was created successfully.
    """
    admin_client = AdminClient({"bootstrap.servers": bootstrap_servers})

    # Check if topic exists
    metadata = admin_client.list_topics(timeout=10)
    if topic in metadata.topics:
        logger.info(f"Topic '{topic}' already exists")
        return True

    # Create the topic
    new_topic = NewTopic(
        topic,
        num_partitions=num_partitions,
        replication_factor=replication_factor
    )

    futures = admin_client.create_topics([new_topic])
    for topic_name, future in futures.items():
        try:
            future.result()
            logger.info(f"Topic '{topic_name}' created successfully")
            return True
        except KafkaException as e:
            logger.error(f"Failed to create topic '{topic_name}': {e}")
            return False

    return False


def main() -> None:
    """Main entry point for the Kafka producer.

    This function runs the producer with configuration from
    environment variables or defaults.
    """
    # Import settings (avoid circular import)
    sys.path.insert(0, "/opt/spark-apps")
    try:
        from config.settings import get_settings
        settings = get_settings()
        bootstrap_servers = settings.kafka.bootstrap_servers
        topic = settings.kafka.clickstream_topic
        events_per_second = settings.producer.events_per_second
        high_interest_products = settings.producer.high_interest_product_ids
        skew_probability = settings.producer.high_interest_probability
        num_users = settings.producer.num_users
        num_products = settings.producer.num_products
    except ImportError:
        logger.warning("Settings not found, using defaults")
        bootstrap_servers = "localhost:9092"
        topic = "clickstream_events"
        events_per_second = 10.0
        high_interest_products = ["PROD_001", "PROD_002", "PROD_003"]
        skew_probability = 0.3
        num_users = 1000
        num_products = 100

    # Ensure topic exists
    ensure_topic_exists(bootstrap_servers, topic)

    # Create producer and generator
    producer = KafkaEventProducer(bootstrap_servers, topic)
    generator = DataGeneratorFactory.create(
        "skewed",
        num_users=num_users,
        num_products=num_products,
        high_interest_products=high_interest_products,
        skew_probability=skew_probability
    )

    # Run producer
    try:
        stats = producer.produce_events(
            generator,
            events_per_second=events_per_second,
            duration=300  # 5 minutes default
        )
        print(f"\nProduction Statistics:\n{json.dumps(stats, indent=2)}")
    finally:
        producer.close()


if __name__ == "__main__":
    main()
