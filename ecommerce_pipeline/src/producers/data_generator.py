"""
Data Generator Module - Factory Pattern Implementation.

This module implements the Factory Pattern for generating synthetic
clickstream events. It supports different event generation strategies
and includes data skewing logic for testing alert triggers.

"""

import random
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Iterator, List, Optional, Type, Union

from pydantic import BaseModel, Field, field_validator


class EventType(str, Enum):
    """Enumeration of valid clickstream event types.

    Attributes:
        VIEW: User viewed a product page.
        ADD_TO_CART: User added a product to their cart.
        PURCHASE: User completed a purchase.
    """

    VIEW = "view"
    ADD_TO_CART = "add_to_cart"
    PURCHASE = "purchase"


class ProductCategory(str, Enum):
    """Product categories for the electronics store.

    Attributes:
        SMARTPHONES: Mobile phones and accessories.
        LAPTOPS: Laptops and notebooks.
        TABLETS: Tablets and e-readers.
        ACCESSORIES: General electronics accessories.
        GAMING: Gaming consoles and accessories.
        AUDIO: Headphones, speakers, etc.
    """

    SMARTPHONES = "smartphones"
    LAPTOPS = "laptops"
    TABLETS = "tablets"
    ACCESSORIES = "accessories"
    GAMING = "gaming"
    AUDIO = "audio"


class ClickstreamEvent(BaseModel):
    """Pydantic model for clickstream event data validation.

    This model ensures data integrity and provides automatic
    serialization for Kafka message production.

    Attributes:
        user_id: Unique identifier for the user.
        product_id: Unique identifier for the product.
        event_type: Type of user interaction.
        timestamp: ISO 8601 formatted event time (Event Time).
        category: Product category for analytics.
        session_id: Browser session identifier.

    Example:
        >>> event = ClickstreamEvent(
        ...     user_id="USER_001",
        ...     product_id="PROD_001",
        ...     event_type=EventType.VIEW,
        ...     category=ProductCategory.SMARTPHONES
        ... )
        >>> print(event.model_dump_json())
    """

    user_id: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique user identifier"
    )
    product_id: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique product identifier"
    )
    event_type: EventType = Field(
        ...,
        description="Type of user event"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Event timestamp in ISO 8601 format"
    )
    category: ProductCategory = Field(
        default=ProductCategory.ACCESSORIES,
        description="Product category"
    )
    session_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Browser session ID"
    )

    @field_validator("timestamp", mode="before")
    @classmethod
    def ensure_iso_format(cls, v: Union[str, datetime]) -> str:
        """Ensure timestamp is in ISO 8601 format."""
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    def to_json(self) -> str:
        """Serialize event to JSON string for Kafka.

        Returns:
            str: JSON representation of the event.
        """
        return self.model_dump_json()


class DataGenerator(ABC):
    """Abstract base class for data generators (Factory Pattern).

    This abstract class defines the interface for all event generators.
    Concrete implementations must provide the generate() method.

    SOLID - Dependency Inversion: High-level modules depend on this
    abstraction rather than concrete implementations.
    """

    @abstractmethod
    def generate(self) -> ClickstreamEvent:
        """Generate a single clickstream event.

        Returns:
            ClickstreamEvent: A validated event instance.
        """
        pass

    @abstractmethod
    def generate_batch(self, size: int) -> List[ClickstreamEvent]:
        """Generate a batch of clickstream events.

        Args:
            size: Number of events to generate.

        Returns:
            list[ClickstreamEvent]: List of validated events.
        """
        pass


class RandomDataGenerator(DataGenerator):
    """Generator for random clickstream events.

    Produces uniformly distributed events across users, products,
    and event types.

    Attributes:
        num_users: Number of simulated users.
        num_products: Number of simulated products.
    """

    def __init__(
        self,
        num_users: int = 1000,
        num_products: int = 100
    ) -> None:
        """Initialize the random data generator.

        Args:
            num_users: Number of unique users to simulate.
            num_products: Number of unique products to simulate.
        """
        self.num_users = num_users
        self.num_products = num_products
        self._categories = list(ProductCategory)
        self._event_types = list(EventType)

    def generate(self) -> ClickstreamEvent:
        """Generate a single random clickstream event.

        Returns:
            ClickstreamEvent: A randomly generated event.
        """
        return ClickstreamEvent(
            user_id=f"USER_{random.randint(1, self.num_users):04d}",
            product_id=f"PROD_{random.randint(1, self.num_products):03d}",
            event_type=random.choice(self._event_types),
            category=random.choice(self._categories),
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    def generate_batch(self, size: int) -> List[ClickstreamEvent]:
        """Generate a batch of random events.

        Args:
            size: Number of events to generate.

        Returns:
            list[ClickstreamEvent]: List of random events.
        """
        return [self.generate() for _ in range(size)]


class SkewedDataGenerator(DataGenerator):
    """Generator that skews data toward specific products.

    This generator creates events with higher probability for
    specific "high interest" products to test the flash sale
    alert trigger (views > 100, purchases < 5).

    Attributes:
        high_interest_products: Product IDs to skew toward.
        skew_probability: Probability of selecting a high interest product.
        view_purchase_ratio: Ratio of views to purchases for high interest.
    """

    def __init__(
        self,
        num_users: int = 1000,
        num_products: int = 100,
        high_interest_products: Optional[List[str]] = None,
        skew_probability: float = 0.3,
        view_purchase_ratio: float = 0.95
    ) -> None:
        """Initialize the skewed data generator.

        Args:
            num_users: Number of unique users.
            num_products: Number of unique products.
            high_interest_products: Product IDs to receive more events.
            skew_probability: Probability of picking a high interest product.
            view_purchase_ratio: Probability that high interest event is a view.
        """
        self.num_users = num_users
        self.num_products = num_products
        self.high_interest_products = high_interest_products or [
            "PROD_001", "PROD_002", "PROD_003"
        ]
        self.skew_probability = skew_probability
        self.view_purchase_ratio = view_purchase_ratio
        self._categories = list(ProductCategory)
        self._event_types = list(EventType)

    def generate(self) -> ClickstreamEvent:
        """Generate a skewed clickstream event.

        High interest products receive more views than purchases
        to simulate the "High Interest, Low Conversion" scenario.

        Returns:
            ClickstreamEvent: A generated event with potential skew.
        """
        # Determine if this should be a high interest product event
        is_high_interest = random.random() < self.skew_probability

        if is_high_interest:
            product_id = random.choice(self.high_interest_products)
            # High interest products mostly get views (few purchases)
            if random.random() < self.view_purchase_ratio:
                event_type = EventType.VIEW
            else:
                # Very low chance of add_to_cart or purchase
                event_type = random.choice([EventType.ADD_TO_CART, EventType.PURCHASE])
        else:
            # Normal distribution for other products
            product_id = f"PROD_{random.randint(4, self.num_products):03d}"
            event_type = random.choice(self._event_types)

        return ClickstreamEvent(
            user_id=f"USER_{random.randint(1, self.num_users):04d}",
            product_id=product_id,
            event_type=event_type,
            category=random.choice(self._categories),
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    def generate_batch(self, size: int) -> List[ClickstreamEvent]:
        """Generate a batch of skewed events.

        Args:
            size: Number of events to generate.

        Returns:
            list[ClickstreamEvent]: List of skewed events.
        """
        return [self.generate() for _ in range(size)]


class BurstDataGenerator(DataGenerator):
    """Generator that creates burst patterns for stress testing.

    Simulates sudden spikes in user activity for specific products.
    """

    def __init__(
        self,
        target_product: str = "PROD_001",
        burst_size: int = 150
    ) -> None:
        """Initialize the burst data generator.

        Args:
            target_product: Product ID to target with burst.
            burst_size: Number of views in the burst.
        """
        self.target_product = target_product
        self.burst_size = burst_size
        self._categories = list(ProductCategory)

    def generate(self) -> ClickstreamEvent:
        """Generate a single burst event (view for target product).

        Returns:
            ClickstreamEvent: A view event for the target product.
        """
        return ClickstreamEvent(
            user_id=f"USER_{random.randint(1, 1000):04d}",
            product_id=self.target_product,
            event_type=EventType.VIEW,
            category=random.choice(self._categories),
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    def generate_batch(self, size: int) -> List[ClickstreamEvent]:
        """Generate a burst of view events.

        Args:
            size: Number of events to generate.

        Returns:
            list[ClickstreamEvent]: List of burst events.
        """
        return [self.generate() for _ in range(size)]


class DataGeneratorFactory:
    """Factory class for creating data generators.

    This factory encapsulates the logic for instantiating different
    types of data generators based on configuration.

    Design Pattern: Factory Pattern

    Example:
        >>> factory = DataGeneratorFactory()
        >>> generator = factory.create("skewed", skew_probability=0.5)
        >>> event = generator.generate()
    """

    # Registry of available generator types
    _generators: Dict[str, Type[DataGenerator]] = {
        "random": RandomDataGenerator,
        "skewed": SkewedDataGenerator,
        "burst": BurstDataGenerator,
    }

    @classmethod
    def create(
        cls,
        generator_type: str = "skewed",
        **kwargs
    ) -> DataGenerator:
        """Create a data generator of the specified type.

        Args:
            generator_type: Type of generator ('random', 'skewed', 'burst').
            **kwargs: Additional arguments passed to the generator constructor.

        Returns:
            DataGenerator: An instance of the requested generator type.

        Raises:
            ValueError: If the generator type is not registered.
        """
        if generator_type not in cls._generators:
            available = ", ".join(cls._generators.keys())
            raise ValueError(
                f"Unknown generator type: '{generator_type}'. "
                f"Available types: {available}"
            )

        generator_class = cls._generators[generator_type]
        return generator_class(**kwargs)

    @classmethod
    def register(cls, name: str, generator_class: type[DataGenerator]) -> None:
        """Register a new generator type.

        This allows extending the factory without modifying existing code
        (SOLID - Open/Closed Principle).

        Args:
            name: Name to register the generator under.
            generator_class: The generator class to register.
        """
        cls._generators[name] = generator_class

    @classmethod
    def available_types(cls) -> List[str]:
        """Get list of available generator types.

        Returns:
            list[str]: List of registered generator type names.
        """
        return list(cls._generators.keys())


def create_event_stream(
    generator: DataGenerator,
    count: Optional[int] = None
) -> Iterator[ClickstreamEvent]:
    """Create an iterator of clickstream events.

    Args:
        generator: The data generator to use.
        count: Number of events to generate (None for infinite).

    Yields:
        ClickstreamEvent: Generated events.

    Example:
        >>> gen = DataGeneratorFactory.create("random")
        >>> for event in create_event_stream(gen, count=10):
        ...     print(event.to_json())
    """
    generated = 0
    while count is None or generated < count:
        yield generator.generate()
        generated += 1
