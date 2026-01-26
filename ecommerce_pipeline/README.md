# E-Commerce Clickstream & Inventory Watch Pipeline

A complete **Lambda Architecture** implementation for real-time e-commerce analytics with batch user segmentation.

> **Live Server**: http://13.235.248.201

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Airflow UI** | http://13.235.248.201:8080 | admin / admin |
| **Spark Master UI** | http://13.235.248.201:8081 | - |
| **Spark Worker UI** | http://13.235.248.201:8082 | - |

---

## 📐 Architecture Overview

This pipeline implements the **Lambda Architecture** pattern, combining real-time stream processing with batch analytics.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        E-COMMERCE CLICKSTREAM PIPELINE                          │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐
  │  Data Producer   │  Generates synthetic clickstream events:
  │  (Python Script) │  • user_id, product_id, event_type, timestamp
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │   Apache Kafka   │  Message broker for event ingestion
  │  (Broker:29092)  │  • Topic: clickstream_events
  └────────┬─────────┘
           │
           ├─────────────────────────────────────────────────┐
           │                                                 │
           ▼                                                 ▼
  ┌────────────────────────┐                    ┌────────────────────────┐
  │   SPEED LAYER          │                    │   BATCH LAYER          │
  │   (Real-Time)          │                    │   (Historical)         │
  │                        │                    │                        │
  │  Spark Structured      │                    │  Parquet Files         │
  │  Streaming             │                    │  (Partitioned by       │
  │  • 10-min windows      │                    │   category)            │
  │  • 5-min slide         │                    │                        │
  │  • 2-min watermark     │                    └───────────┬────────────┘
  │                        │                                │
  │  ┌──────────────────┐  │                    ┌───────────▼────────────┐
  │  │ Flash Sale Alert │  │                    │   Apache Airflow       │
  │  │ Detection        │  │                    │   Daily DAG            │
  │  │ views>100 &      │  │                    │   (2 AM UTC)           │
  │  │ purchases<5      │  │                    │                        │
  │  └──────────────────┘  │                    │  • User Segmentation   │
  │                        │                    │  • Top 5 Products      │
  └────────────────────────┘                    │  • Conversion Rates    │
                                                └────────────────────────┘
```

---

## 🛠 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Message Broker** | Apache Kafka 7.5.0 | Real-time event ingestion |
| **Stream Processing** | Apache Spark 3.5.0 | Structured Streaming with Event Time |
| **Orchestration** | Apache Airflow 2.7.1 | Batch job scheduling |
| **Storage** | Parquet + PostgreSQL | Columnar storage & metadata |
| **Coordination** | Apache Zookeeper | Kafka coordination |
| **Containerization** | Docker Compose | Service orchestration |

### Why This Stack?

1. **Kafka**: Handles high-throughput, fault-tolerant event streaming with partitioning support
2. **Spark Structured Streaming**: Provides exactly-once processing with event time semantics
3. **Airflow**: Enterprise-grade DAG orchestration with monitoring and retry logic
4. **Parquet**: Columnar format optimized for analytical queries with compression

---

## ⏱ Event Time vs Processing Time

This pipeline uses **Event Time** (when events occurred) for accurate analytics:

```python
# Event Time is embedded in each message
{
    "user_id": "USER_0123",
    "product_id": "PROD_001",
    "event_type": "view",
    "timestamp": "2026-01-26T07:10:15.123456+00:00",  # ← EVENT TIME
    "category": "smartphones"
}
```

### Why Event Time?

| Aspect | Event Time | Processing Time |
|--------|------------|-----------------|
| **Accuracy** | Reflects actual user behavior | May include processing delays |
| **Late Events** | Handled via watermarking | Lost or misattributed |
| **Reproducibility** | Same input → Same output | Non-deterministic |

### Watermarking

```python
# Allow events arriving up to 2 minutes late
df.withWatermark("event_timestamp", "2 minutes")

# 10-minute sliding windows
window(col("event_timestamp"), "10 minutes", "5 minutes")
```

---

## 🚀 Quick Start Guide

### Prerequisites

- Docker & Docker Compose
- 8GB+ RAM recommended
- Ports 8080, 8081, 8082, 9092 open

### Step 1: Start All Services

```bash
cd ecommerce_pipeline

# Start the stack
sudo docker compose up -d

# Wait for services to be healthy (2-3 minutes)
sudo docker compose ps
```

### Step 2: Run the Kafka Producer

Generate synthetic clickstream events:

```bash
sudo docker exec spark-worker python3 /opt/spark-apps/src/producers/kafka_producer.py
```

This generates events at **10 events/second** for **5 minutes** with:
- 1000 simulated users
- 100 products across 6 categories
- Skewed data toward specific "high interest" products (PROD_001, PROD_002, PROD_003)

### Step 3: Start Spark Streaming Processor

```bash
sudo docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  /opt/spark-apps/src/streaming/spark_processor.py
```

This starts:
- **Windowed aggregations** (views/purchases per product)
- **Flash Sale Alert detection** (views > 100, purchases < 5)
- **Parquet archival** (for batch processing)

### Step 4: Trigger Airflow Batch Job

1. Open Airflow: http://13.235.248.201:8080
2. Login with `admin` / `admin`
3. Enable and trigger `ecommerce_daily_segmentation` DAG

---

## 📊 Pipeline Outputs

### 1. Real-Time Console Output (Spark Streaming)

```
+------------------------------------------+----------+-----------+----------+--------------+
|window                                    |product_id|category   |view_count|purchase_count|
+------------------------------------------+----------+-----------+----------+--------------+
|{2026-01-26 07:05:00, 2026-01-26 07:15:00}|PROD_001  |smartphones|156       |3             |
|{2026-01-26 07:05:00, 2026-01-26 07:15:00}|PROD_002  |gaming     |142       |2             |
+------------------------------------------+----------+-----------+----------+--------------+
```

### 2. Flash Sale Alerts

```
🚨 FLASH SALE ALERT 🚨
════════════════════════════════════════════════════════════
Product ID: PROD_001
Category: smartphones
Views: 156
Purchases: 3
Conversion Rate: 1.92%
Suggestion: Consider Flash Sale!
════════════════════════════════════════════════════════════
```

### 3. Daily Batch Reports (Airflow)

Generated in `/opt/airflow/reports/`:
- `user_segments_YYYYMMDD.csv` - Window Shoppers vs Buyers
- `top_products_YYYYMMDD.csv` - Top 5 most viewed products
- `conversion_rates_YYYYMMDD.csv` - Rates by category
- `daily_summary_YYYYMMDD.txt` - Email-ready summary

---

## 📁 Project Structure

```
ecommerce_pipeline/
├── config/
│   ├── __init__.py
│   └── settings.py              # Singleton Pydantic configuration
├── docker/
│   ├── spark/Dockerfile         # Custom Spark image with Kafka
│   └── airflow/Dockerfile       # Custom Airflow image
├── dags/
│   └── ecommerce_daily_dag.py   # Airflow DAG definition
├── src/
│   ├── producers/
│   │   ├── data_generator.py    # Factory Pattern event generator
│   │   └── kafka_producer.py    # Kafka message producer
│   ├── streaming/
│   │   ├── spark_processor.py   # Spark Structured Streaming
│   │   └── alert_handler.py     # Strategy Pattern alert handlers
│   └── batch/
│       ├── user_segmentation.py # PySpark batch analytics
│       └── report_generator.py  # Factory Pattern reports
├── data/                        # Parquet output (volume mounted)
├── reports/                     # Generated reports (volume mounted)
├── docker-compose.yaml          # Service definitions
├── .env                         # Environment configuration
└── requirements.txt             # Python dependencies
```

---

## 🎯 Design Patterns Used

| Pattern | Implementation | Purpose |
|---------|----------------|---------|
| **Factory** | `DataGeneratorFactory`, `ReportFactory` | Create objects without exposing creation logic |
| **Singleton** | `AppSettings` | Single configuration instance |
| **Strategy** | `AlertHandler` implementations | Interchangeable alert handling algorithms |
| **Builder** | Spark DataFrame transformations | Construct complex queries step-by-step |

---

## ⚙️ Configuration

All settings are managed via environment variables or `.env` file:

```bash
# Kafka
KAFKA_BOOTSTRAP_SERVERS=broker:29092
KAFKA_CLICKSTREAM_TOPIC=clickstream_events

# Spark
SPARK_WINDOW_DURATION=10
SPARK_SLIDE_DURATION=5
SPARK_WATERMARK_DELAY=2 minutes

# Alert Thresholds
ALERT_MIN_VIEWS_THRESHOLD=100
ALERT_MAX_PURCHASES_THRESHOLD=5

# Producer
PRODUCER_EVENTS_PER_SECOND=10.0
PRODUCER_HIGH_INTEREST_PRODUCT_IDS=PROD_001,PROD_002,PROD_003
```

---

## 🔒 Ethics & Data Governance

### Privacy Implications

E-commerce clickstream data contains sensitive user behavior information:

1. **User Profiling Risks**: Tracking browsing patterns can reveal personal preferences, financial status, and shopping habits
2. **Data Retention**: How long should clickstream data be kept?
3. **Consent**: Users should be informed about data collection

### Recommended Governance Practices

| Practice | Implementation |
|----------|----------------|
| **Anonymization** | Hash user_id before storage |
| **Data Minimization** | Collect only necessary fields |
| **Retention Policy** | Auto-delete data after 30 days |
| **Access Control** | Role-based access to reports |
| **Audit Logging** | Track who accessed what data |

---

## 🛑 Stopping the Pipeline

```bash
# Stop all services
sudo docker compose down

# Stop and remove volumes
sudo docker compose down -v
```

---

## 📝 Troubleshooting

| Issue | Solution |
|-------|----------|
| Producer can't connect to Kafka | Ensure broker uses `broker:29092` (Docker network) |
| Spark streaming fails | Check `/opt/spark-data` directory permissions |
| Airflow DAG shows "no status" | Ensure Parquet data exists in `/opt/spark-data/parquet` |
| Type errors in Python | Python 3.9 compatibility - use `List[str]` not `list[str]` |

---

## 📜 License

MIT License

---

## 👥 Contributors

This project was built as part of an Applied Big Data Engineering course to demonstrate Lambda Architecture implementation.
