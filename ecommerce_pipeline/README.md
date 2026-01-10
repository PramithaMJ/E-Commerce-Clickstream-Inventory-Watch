# E-Commerce Clickstream & Inventory Watch Pipeline

A complete **Lambda Architecture** implementation for real-time e-commerce analytics with batch user segmentation.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐
│  Data Producer  │───▶│  Apache Kafka   │───▶│  Spark Structured Streaming │
│  (Factory/Skew) │    │  (clickstream)  │    │  (10-min windows)           │
└─────────────────┘    └─────────────────┘    └──────────────┬──────────────┘
                                                             │
                              ┌───────────────────────────────┼───────────────┐
                              │                               │               │
                              ▼                               ▼               ▼
                       ┌─────────────┐               ┌─────────────┐   ┌──────────┐
                       │ Flash Sale  │               │   Parquet   │   │  Console │
                       │   Alerts    │               │   Archive   │   │  Output  │
                       └─────────────┘               └──────┬──────┘   └──────────┘
                                                           │
                                                           ▼
                                                    ┌─────────────┐
                                                    │   Airflow   │
                                                    │  Daily DAG  │
                                                    └──────┬──────┘
                                                           │
                                                           ▼
                                               ┌─────────────────────┐
                                               │   Batch Analytics   │
                                               │ • User Segmentation │
                                               │ • Top 5 Products    │
                                               │ • Conversion Rates  │
                                               └─────────────────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- 8GB+ RAM recommended

### Start the Pipeline

```bash
cd ecommerce_pipeline

# Start all services
docker-compose up -d

# Wait for services to be healthy (2-3 minutes)
docker-compose ps

# Access UIs:
# - Airflow: http://localhost:8080 (admin/admin)
# - Spark Master: http://localhost:8081
```

### Run the Producer

```bash
# Generate clickstream events
docker exec -it spark-worker python /opt/spark-apps/src/producers/kafka_producer.py
```

### Start Stream Processing

```bash
# Run the Spark Streaming job
docker exec -it spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0 \
  /opt/spark-apps/src/streaming/spark_processor.py
```

### Trigger Batch Job (Airflow)

1. Open Airflow UI: http://localhost:8080
2. Login: `admin` / `admin`
3. Enable and trigger `ecommerce_daily_segmentation` DAG

## Project Structure

```
ecommerce_pipeline/
├── config/
│   ├── __init__.py
│   └── settings.py              # Singleton Pydantic config
├── docker/
│   ├── spark/Dockerfile
│   └── airflow/Dockerfile
├── dags/
│   └── ecommerce_daily_dag.py   # Airflow DAG
├── src/
│   ├── producers/
│   │   ├── data_generator.py    # Factory Pattern generator
│   │   └── kafka_producer.py
│   ├── streaming/
│   │   ├── spark_processor.py   # Event Time windowing
│   │   └── alert_handler.py
│   └── batch/
│       ├── user_segmentation.py # PySpark batch job
│       └── report_generator.py
├── data/                        # Parquet output
├── reports/                     # Generated reports
├── docker-compose.yaml
└── requirements.txt
```

## Features

### Speed Layer (Real-Time)

- **10-minute sliding windows** with 5-minute slide
- **Event Time processing** with 2-minute watermark
- **Flash Sale Alerts**: Products with >100 views but <5 purchases
- **Parquet archival** for batch layer

### Batch Layer (Daily)

- **User Segmentation**: Window Shoppers vs Buyers
- **Top 5 Most Viewed Products**
- **Conversion Rates** per product category
- **Automated reports** (CSV, TXT, JSON)

## Event Time Handling

This pipeline uses **Event Time** (when events occurred) rather than Processing Time:

```python
# Watermark for late event handling
df.withWatermark("event_timestamp", "2 minutes")

# Sliding window based on event time
window(col("event_timestamp"), "10 minutes", "5 minutes")
```

**Why Event Time?**
- Accurate analytics reflecting actual user behavior
- Handles out-of-order events
- Resilient to processing delays

## Design Patterns

| Pattern | Implementation |
|---------|----------------|
| **Factory** | `DataGeneratorFactory` for event generators |
| **Singleton** | `AppSettings` configuration |
| **Strategy** | Multiple `AlertHandler` implementations |
| **Builder** | Spark DataFrame transformations |

## Sample Output

### Flash Sale Alert
```
🚨 FLASH SALE ALERT 🚨
Product ID: PROD_001
Views: 156
Purchases: 3
Conversion Rate: 1.92%
Suggestion: Consider Flash Sale!
```

### User Segmentation Report
```
USER SEGMENTATION SUMMARY
─────────────────────────
Window Shoppers: 847 users (Avg 12.3 views, 0 purchases)
Buyers: 153 users (Avg 8.7 views, 2.1 purchases)
```

## Stopping the Pipeline

```bash
docker-compose down -v
```

## License

MIT License
