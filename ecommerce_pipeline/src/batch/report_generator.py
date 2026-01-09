"""
Report Generator Module for E-Commerce Analytics.
"""

import csv
import json
import logging
import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@dataclass
class ReportData:
    """Container for report data.

    Attributes:
        date: Report date.
        user_segments: User segmentation data.
        top_products: Top viewed products.
        conversion_rates: Conversion rates by category.
        metadata: Additional report metadata.
    """

    date: datetime
    user_segments: list[dict]
    top_products: list[dict]
    conversion_rates: list[dict]
    metadata: dict[str, Any] | None = None


class ReportGenerator(ABC):
    """Abstract base class for report generators.

    Defines the interface for generating reports in different formats.
    """

    @abstractmethod
    def generate(self, data: ReportData) -> str:
        """Generate a report from the data.

        Args:
            data: Report data container.

        Returns:
            str: Generated report content.
        """
        pass

    @abstractmethod
    def save(self, content: str, output_path: str) -> str:
        """Save the report to a file.

        Args:
            content: Report content.
            output_path: Base output path.

        Returns:
            str: Path to the saved file.
        """
        pass


class TextReportGenerator(ReportGenerator):
    """Generator for plain text reports.

    Creates formatted text files suitable for email distribution.
    """

    def generate(self, data: ReportData) -> str:
        """Generate a plain text report.

        Args:
            data: Report data container.

        Returns:
            str: Formatted text report.
        """
        date_str = data.date.strftime("%Y-%m-%d")

        lines = [
            "=" * 70,
            "           E-COMMERCE DAILY ANALYTICS REPORT",
            f"                     Date: {date_str}",
            "=" * 70,
            "",
            "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
            "                    USER SEGMENTATION SUMMARY",
            "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
            "",
        ]

        # Add segment data
        for segment in data.user_segments:
            segment_name = segment.get("segment", "Unknown")
            user_count = segment.get("user_count", 0)
            avg_views = segment.get("avg_views_per_user", 0)
            avg_purchases = segment.get("avg_purchases_per_user", 0)

            lines.extend([
                f"  ┌─ {segment_name} ─────────────────────────────────────────┐",
                f"  │  User Count:          {user_count:>10}                    │",
                f"  │  Avg Views/User:      {avg_views:>10.2f}                    │",
                f"  │  Avg Purchases/User:  {avg_purchases:>10.2f}                    │",
                f"  └───────────────────────────────────────────────────────────┘",
                ""
            ])

        lines.extend([
            "",
            "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
            "                  TOP 5 MOST VIEWED PRODUCTS",
            "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
            "",
            "  ┌────┬──────────────┬──────────────┬───────────┬───────────────┐",
            "  │ #  │ Product ID   │ Category     │ Views     │ Unique Viewers│",
            "  ├────┼──────────────┼──────────────┼───────────┼───────────────┤",
        ])

        for i, product in enumerate(data.top_products[:5], 1):
            pid = product.get("product_id", "N/A")[:12]
            cat = product.get("category", "N/A")[:12]
            views = product.get("view_count", 0)
            viewers = product.get("unique_viewers", 0)
            lines.append(
                f"  │ {i:<2} │ {pid:<12} │ {cat:<12} │ {views:>9} │ {viewers:>13} │"
            )

        lines.extend([
            "  └────┴──────────────┴──────────────┴───────────┴───────────────┘",
            "",
            "",
            "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
            "                CONVERSION RATES BY CATEGORY",
            "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
            "",
        ])

        for category in data.conversion_rates:
            cat_name = category.get("category", "Unknown")
            views = category.get("views", 0)
            purchases = category.get("purchases", 0)
            conv_rate = category.get("overall_conversion_rate", 0)

            lines.extend([
                f"  📊 {cat_name.upper()}",
                f"     ├── Views: {views:,}",
                f"     ├── Purchases: {purchases:,}",
                f"     └── Conversion Rate: {conv_rate:.2f}%",
                ""
            ])

        lines.extend([
            "",
            "=" * 70,
            f"Report Generated: {datetime.now().isoformat()}",
            "=" * 70,
        ])

        return "\n".join(lines)

    def save(self, content: str, output_path: str) -> str:
        """Save the text report.

        Args:
            content: Report content.
            output_path: Base output path.

        Returns:
            str: Path to saved file.
        """
        date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(output_path, f"report_{date_str}.txt")

        os.makedirs(output_path, exist_ok=True)

        with open(filepath, "w") as f:
            f.write(content)

        logger.info(f"Text report saved to {filepath}")
        return filepath


class JSONReportGenerator(ReportGenerator):
    """Generator for JSON reports.

    Creates structured JSON files for downstream processing.
    """

    def generate(self, data: ReportData) -> str:
        """Generate a JSON report.

        Args:
            data: Report data container.

        Returns:
            str: JSON formatted report.
        """
        report = {
            "report_date": data.date.isoformat(),
            "generated_at": datetime.now().isoformat(),
            "user_segmentation": data.user_segments,
            "top_products": data.top_products,
            "conversion_rates": data.conversion_rates,
            "metadata": data.metadata or {}
        }
        return json.dumps(report, indent=2)

    def save(self, content: str, output_path: str) -> str:
        """Save the JSON report.

        Args:
            content: Report content.
            output_path: Base output path.

        Returns:
            str: Path to saved file.
        """
        date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(output_path, f"report_{date_str}.json")

        os.makedirs(output_path, exist_ok=True)

        with open(filepath, "w") as f:
            f.write(content)

        logger.info(f"JSON report saved to {filepath}")
        return filepath


class CSVReportGenerator(ReportGenerator):
    """Generator for CSV reports.

    Creates separate CSV files for each data section.
    """

    def generate(self, data: ReportData) -> str:
        """Generate a summary CSV.

        Args:
            data: Report data container.

        Returns:
            str: CSV formatted summary.
        """
        lines = ["metric,value"]
        lines.append(f"report_date,{data.date.strftime('%Y-%m-%d')}")
        lines.append(f"total_segments,{len(data.user_segments)}")
        lines.append(f"total_categories,{len(data.conversion_rates)}")

        # Add segment counts
        for segment in data.user_segments:
            seg_name = segment.get("segment", "unknown").replace(" ", "_")
            count = segment.get("user_count", 0)
            lines.append(f"{seg_name}_count,{count}")

        return "\n".join(lines)

    def save(self, content: str, output_path: str) -> str:
        """Save the CSV report.

        Args:
            content: Report content.
            output_path: Base output path.

        Returns:
            str: Path to saved file.
        """
        date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(output_path, f"summary_{date_str}.csv")

        os.makedirs(output_path, exist_ok=True)

        with open(filepath, "w") as f:
            f.write(content)

        logger.info(f"CSV report saved to {filepath}")
        return filepath


class ReportFactory:
    """Factory for creating report generators.

    Follows the Factory Pattern to create appropriate generators.
    """

    _generators = {
        "text": TextReportGenerator,
        "json": JSONReportGenerator,
        "csv": CSVReportGenerator,
    }

    @classmethod
    def create(cls, format_type: str) -> ReportGenerator:
        """Create a report generator of the specified type.

        Args:
            format_type: Type of report ('text', 'json', 'csv').

        Returns:
            ReportGenerator: Appropriate generator instance.

        Raises:
            ValueError: If format type is not supported.
        """
        if format_type not in cls._generators:
            available = ", ".join(cls._generators.keys())
            raise ValueError(
                f"Unknown format: '{format_type}'. Available: {available}"
            )
        return cls._generators[format_type]()

    @classmethod
    def available_formats(cls) -> list[str]:
        """Get list of available report formats.

        Returns:
            list: Available format names.
        """
        return list(cls._generators.keys())
