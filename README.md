# 🛒 E-Commerce Clickstream Inventory Watch

Real-time e-commerce analytics platform with clickstream tracking, data processing, and inventory monitoring. Features a production-grade online store with enterprise architecture patterns, integrated with Apache Kafka and Apache Spark for real-time event processing.

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-7.5-black.svg)](https://kafka.apache.org/)
[![Apache Spark](https://img.shields.io/badge/Apache%20Spark-3.5-orange.svg)](https://spark.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Services](#services)
- [API Documentation](#api-documentation)
- [Event Flow](#event-flow)
- [Development](#development)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

This project demonstrates a complete end-to-end e-commerce analytics solution combining:

- **Modern E-Commerce Store** - Full-featured online electronics store with React/TypeScript
- **Real-Time Event Tracking** - Clickstream events captured and processed in real-time
- **Data Pipeline** - Apache Kafka for event streaming, Apache Spark for processing
- **Batch Analytics** - Scheduled data processing and report generation via Apache Airflow
- **Enterprise Architecture** - SOLID principles, layered architecture, DTO pattern

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                    │
│  • Product Catalog  • Shopping Cart  • Search  • Event Tracking     │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────┐
│                  BACKEND (Spring Boot + Java 17)                    │
│  Controller → Service → Repository (Layered Architecture)           │
│  • Product API  • Event API  • DTOs  • Mappers                      │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼ Kafka Producer
┌─────────────────────────────────────────────────────────────────────┐
│                    KAFKA (Event Streaming)                          │
│  Topic: clickstream_events                                          │
│  Events: view, add_to_cart, purchase, search, filter                │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼ Spark Consumer
┌─────────────────────────────────────────────────────────────────────┐
│            SPARK (Real-Time Stream Processing)                      │
│  • Event aggregation  • User behavior analysis                      │
│  • Inventory alerts  • Anomaly detection                            │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼ Parquet Files
┌─────────────────────────────────────────────────────────────────────┐
│                DATA LAKE (Partitioned Storage)                      │
│  /data/parquet/category=<category>/                                 │
│  Checkpoint mechanism for fault tolerance                           │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              AIRFLOW (Batch Processing & Reporting)                 │
│  • Daily aggregations  • User segmentation  • Report generation     │
└─────────────────────────────────────────────────────────────────────┘
```

## ✨ Features

### 🛍️ E-Commerce Store
- **18 Products** across 6 categories (Smartphones, Laptops, Tablets, Gaming, Audio, Accessories)
- **Shopping Cart** with localStorage persistence
- **Real-Time Search** with live filtering
- **Category Filtering** for easy product discovery
- **Stock Management** with out-of-stock indicators
- **Responsive Design** with modern dark theme UI
- **Session Tracking** with unique user/session IDs

### 📊 Analytics & Processing
- **Real-Time Event Tracking** - View, add to cart, remove, purchase, search
- **Stream Processing** - Apache Spark structured streaming with Kafka integration
- **Batch Processing** - Daily scheduled jobs for aggregations and reports
- **Data Partitioning** - Category-based partitioning for optimized queries
- **Checkpointing** - Fault-tolerant processing with automatic recovery
- **Alert System** - Inventory and behavior anomaly detection

### 🔧 Technical Features
- **SOLID Principles** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Layered Architecture** - Controller → Service → Repository pattern
- **DTO Pattern** - Clean separation between API and domain models
- **Mapper Pattern** - Automated entity-DTO transformations
- **Exception Handling** - Global exception handler with custom exceptions
- **API Response Wrapper** - Consistent response format across all endpoints
- **CORS Configuration** - Secure cross-origin resource sharing
- **Docker Multi-Stage Builds** - Optimized container images
- **Health Checks** - Service health monitoring and automatic restarts

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript 5.3** - Type-safe JavaScript
- **Vite 5.0** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications
- **UUID** - Unique identifier generation

### Backend
- **Java 17** - LTS version with latest features
- **Spring Boot 3.2.1** - Enterprise application framework
- **Spring Kafka** - Kafka integration
- **Lombok** - Boilerplate reduction
- **Maven** - Dependency management
- **Jackson** - JSON processing
- **Bean Validation** - Input validation

### Data Pipeline
- **Apache Kafka 7.5** - Distributed event streaming
- **Apache Spark 3.5** - Unified analytics engine
- **Apache Airflow 2.7** - Workflow orchestration
- **PostgreSQL 15** - Metadata storage
- **Parquet** - Column-oriented data format

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **Zookeeper** - Kafka coordination

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- 8GB+ RAM recommended
- Ports available: 3000, 8080, 8081, 8082, 8090, 9092, 2181, 5432

### 1. Clone Repository
```bash
git clone https://github.com/PramithaMJ/E-Commerce-Clickstream-Inventory-Watch.git
cd E-Commerce-Clickstream-Inventory-Watch
```

### 2. Configure Environment
```bash
cd ecommerce_pipeline
cp .env.example .env
# Edit .env with your settings if needed
```

### 3. Start All Services
```bash
docker compose up -d
```

### 4. Wait for Services to Initialize
```bash
# Check service status
docker compose ps

# Watch logs
docker compose logs -f
```

### 5. Access Applications

| Service | URL | Description |
|---------|-----|-------------|
| **Store Frontend** | http://localhost:3000 | E-commerce website |
| **Store Backend API** | http://localhost:8090/api | REST API |
| **Airflow UI** | http://localhost:8080 | Workflow management |
| **Spark Master UI** | http://localhost:8081 | Spark cluster monitoring |
| **Spark Worker UI** | http://localhost:8082 | Worker node monitoring |

**Default Airflow Credentials:**
- Username: `admin`
- Password: `admin`

## 📁 Project Structure

```
.
├── ecommerce_pipeline/          # Data pipeline infrastructure
│   ├── docker-compose.yaml      # Service orchestration
│   ├── config/                  # Configuration files
│   ├── dags/                    # Airflow DAGs
│   ├── data/                    # Data storage
│   │   ├── parquet/            # Processed data (partitioned)
│   │   └── checkpoints/        # Spark checkpoints
│   ├── docker/                  # Dockerfiles
│   │   ├── airflow/
│   │   └── spark/
│   ├── reports/                 # Generated reports
│   └── src/                     # Source code
│       ├── batch/              # Batch processing jobs
│       ├── producers/          # Kafka producers
│       └── streaming/          # Spark streaming apps
│
└── store/                       # E-commerce application
    ├── backend/                 # Spring Boot API
    │   ├── src/main/java/com/ecommerce/clickstream/
    │   │   ├── config/         # Configuration classes
    │   │   ├── controller/     # REST controllers
    │   │   ├── dto/            # Data Transfer Objects
    │   │   ├── exception/      # Exception handlers
    │   │   ├── mapper/         # Entity-DTO mappers
    │   │   ├── model/          # Domain models
    │   │   ├── repository/     # Data repositories
    │   │   └── service/        # Business logic
    │   └── resources/
    │       └── application.properties
    │
    └── frontend/                # React application
        ├── src/
        │   ├── components/     # Reusable UI components
        │   ├── hooks/          # Custom React hooks
        │   ├── pages/          # Page components
        │   ├── services/       # API services
        │   └── types/          # TypeScript types
        ├── nginx.conf          # Nginx configuration
        └── Dockerfile          # Multi-stage build
```

## 🔌 Services

### Store Backend (Port 8090)
Spring Boot application providing REST API and Kafka event publishing.

**Key Components:**
- `ProductController` - Product catalog endpoints
- `EventController` - Clickstream event tracking
- `ProductService` - Business logic with interface
- `KafkaProducerService` - Event publishing to Kafka
- `InMemoryProductRepository` - 18 pre-loaded products


### Store Frontend (Port 3000)
React SPA with TypeScript, Tailwind CSS, and real-time event tracking.

**Key Features:**
- Product grid with category filtering
- Shopping cart with persistence
- Real-time search functionality
- Automatic event tracking
- Session management with UUIDs

### Kafka Broker (Port 9092)
Distributed event streaming platform.

**Topics:**
- `clickstream_events` - User interaction events

**Event Types:**
- `view` - Product viewed
- `add_to_cart` - Item added to cart
- `remove_from_cart` - Item removed from cart
- `purchase` - Checkout completed
- `search` - Search query performed

### Spark (Ports 8081, 8082)
Real-time stream processing with structured streaming.

**Processing:**
- Consumes from Kafka
- Aggregates by category
- Writes to Parquet (partitioned)
- Checkpointing for fault tolerance

### Airflow (Port 8080)
Workflow orchestration for batch jobs.

**DAGs:**
- Daily aggregation pipeline
- User segmentation analysis
- Report generation

## 📡 API Documentation

### Products API

#### Get All Products
```http
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "PROD_001",
      "name": "iPhone 15 Pro Max",
      "description": "Latest Apple flagship...",
      "price": 1199.99,
      "category": "smartphones",
      "image_url": "https://...",
      "stock": 45,
      "rating": 4.8,
      "features": ["A17 Pro Chip", "48MP Camera"],
      "in_stock": true
    }
  ],
  "timestamp": "2026-01-26T12:00:00"
}
```

#### Get Product by ID
```http
GET /api/products/{id}
```

#### Get Products by Category
```http
GET /api/products/category/{category}
```

### Events API

#### Track Event
```http
POST /api/events
Content-Type: application/json

{
  "userId": "USER_ABC123",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "add_to_cart",
  "productId": "PROD_001",
  "productName": "iPhone 15 Pro Max",
  "category": "smartphones",
  "price": 1199.99,
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event tracked successfully",
  "data": null,
  "timestamp": "2026-01-26T12:00:00"
}
```

## 🔄 Event Flow

1. **User Interaction** - User browses products, adds to cart, searches
2. **Frontend Tracking** - React app captures events with `trackingService`
3. **API Call** - Events sent to Spring Boot `/api/events` endpoint
4. **Event Service** - Validates and maps DTO to domain model
5. **Kafka Producer** - Publishes to `clickstream_events` topic
6. **Spark Streaming** - Consumes events in micro-batches
7. **Processing** - Aggregates, enriches, and validates data
8. **Storage** - Writes to Parquet files (partitioned by category)
9. **Batch Jobs** - Airflow DAGs process data for reports
10. **Analytics** - Generate insights, segments, and alerts

## 💻 Development

### Running Locally

**Backend:**
```bash
cd store/backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd store/frontend
npm install
npm run dev
```

### Building Docker Images

```bash
cd ecommerce_pipeline
docker compose build
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f store-backend
docker compose logs -f store-frontend
docker compose logs -f spark-master
```

### Kafka Console Consumer

```bash
docker exec -it broker kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic clickstream_events \
  --from-beginning
```

### Accessing Spark Shell

```bash
docker exec -it spark-master /opt/spark/bin/spark-shell
```

## 🎬 (Without Website)
> **Note:** For detailed information about the data pipeline architecture, batch processing, and analytics components, see the [Pipeline Documentation](ecommerce_pipeline/README.md).

## 📊 Monitoring

### Health Checks

**Backend Health:**
```bash
curl http://localhost:8090/api/events/health
```

**Service Status:**
```bash
docker compose ps
```

### Kafka Topics

```bash
# List topics
docker exec broker kafka-topics --bootstrap-server localhost:9092 --list

# Describe topic
docker exec broker kafka-topics --bootstrap-server localhost:9092 \
  --describe --topic clickstream_events
```

### Spark UI
- **Master:** http://localhost:8081 - Cluster status, running applications
- **Worker:** http://localhost:8082 - Worker status, resource usage

### Data Storage

```bash
# View Parquet data structure
ls -R ecommerce_pipeline/data/parquet/

# Check checkpoint data
ls -R ecommerce_pipeline/data/checkpoints/
```

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose logs

# Restart specific service
docker compose restart store-backend

# Rebuild and restart
docker compose up -d --build
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Frontend Shows "Out of Stock" for All Products

**Issue:** API field name mismatch (snake_case vs camelCase)

**Solution:** Ensure `ProductDTO` interface and transformation function are properly configured in `productService.ts`

### CSS Not Loading

**Issue:** Tailwind directives missing or browser cache

**Solution:**
1. Verify `@tailwind` directives in `index.css`
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear browser cache

### Kafka Connection Issues

```bash
# Check Kafka broker health
docker compose ps broker

# Verify topic exists
docker exec broker kafka-topics --bootstrap-server localhost:9092 --list

# Check consumer groups
docker exec broker kafka-consumer-groups --bootstrap-server localhost:9092 --list
```

### Spark Streaming Errors

```bash
# Check Spark logs
docker compose logs spark-master

# Verify checkpoint directory permissions
ls -la ecommerce_pipeline/data/checkpoints/
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

⭐ **Star this repository if you find it helpful!**

📧 **Questions?** Open an issue or reach out!
