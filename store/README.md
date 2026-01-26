# 🛍️ ElectroStore - E-Commerce with Real-Time Clickstream Analytics

A production-grade electronics e-commerce platform integrated with real-time event streaming and analytics.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.2-green)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61dafb)
![Kafka](https://img.shields.io/badge/Kafka-7.5-black)
![Spark](https://img.shields.io/badge/Spark-3.x-orange)

## 📋 Overview

This project demonstrates a complete e-commerce solution with:
- **Real User Tracking**: Captures actual user interactions (views, cart actions, purchases)
- **Event Streaming**: Kafka-based event pipeline
- **Real-Time Analytics**: Spark Structured Streaming
- **Batch Processing**: Airflow orchestrated jobs
- **Modern UI**: React + TypeScript with Tailwind CSS

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  Store Frontend  │         │  Data Generator  │
│  React + TS      │         │  Python Script   │
│  Port: 3000      │         │  Synthetic Data  │
└────────┬─────────┘         └────────┬─────────┘
         │                             │
         │ POST /api/events            │
         ▼                             ▼
┌────────────────────────────────────────────────┐
│          Store Backend (Spring Boot)           │
│          REST API + Kafka Producer             │
│               Port: 8090                       │
└────────────────────┬───────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────┐
│              Apache Kafka Broker               │
│         Topic: clickstream_events              │
│               Port: 9092                       │
└────────────────────┬───────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────┐
│         Spark Structured Streaming             │
│      Real-time Aggregations & Alerts           │
│          Spark Master Port: 8081               │
└────────────────────┬───────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────┐
│             Batch Processing (Airflow)         │
│          Daily Reports & Analytics             │
│               Port: 8080                       │
└────────────────────────────────────────────────┘
```

## ✨ Features

### 🎨 Frontend (React + TypeScript)
- **18 Premium Products** across 6 categories
- **Real-time Search** with instant filtering
- **Shopping Cart** with persistent storage
- **Modern Dark Theme** using Tailwind CSS
- **Responsive Design** for all devices
- **Event Tracking** - Every user action captured
- **Toast Notifications** for user feedback
- **Session Management** with UUID

### 🚀 Backend (Spring Boot)
- **Layered Architecture**: Controller → Service → Repository
- **SOLID Principles** implementation
- **DTOs** for clean data transfer
- **Global Exception Handling**
- **Bean Validation** (JSR-380)
- **Kafka Integration** for event streaming
- **RESTful API** with consistent responses
- **Health Checks** and monitoring

### 📊 Analytics Pipeline
- **Kafka Topics**: clickstream_events, flash_sale_alerts
- **Spark Streaming**: Real-time aggregations
- **Airflow DAGs**: Batch processing
- **Parquet Storage**: Efficient data storage

## 🚀 Quick Start

### Prerequisites
```bash
- Docker & Docker Compose
- Ports available: 3000, 8080, 8081, 8090, 9092
```

### Deploy Everything
```bash
# Clone repository
git clone https://github.com/PramithaMJ/E-Commerce-Clickstream-Inventory-Watch.git 
cd E-Commerce-Clickstream-Inventory-Watch/ecommerce_pipeline

# Start all services
docker-compose up -d

# Wait for services to start (~2 minutes)
docker-compose ps
```

### Access Points
| Service | URL | Credentials |
|---------|-----|-------------|
| 🛍️ **Store** | http://13.235.248.201:3000 | - |
| 🔌 **API** | http://13.235.248.201:8090/api | - |
| 📊 **Airflow** | http://13.235.248.201:8080 | admin/admin |
| ⚡ **Spark** | http://13.235.248.201:8081 | - |

### 📈 Data Flow
```
1. User Action (React)
   └→ trackingService.trackEvent()
      └→ POST /api/events
         └→ EventController.trackEvent()
            └→ EventService.processEvent()
               └→ KafkaProducerService.sendEvent()
                  └→ Kafka Topic (clickstream_events)
                     └→ Spark Structured Streaming
                        └→ Real-time Analytics
```
### 📡 API Endpoints

#### Products
```
GET  /api/products              - All products
GET  /api/products/{id}         - Single product
GET  /api/products/category/{c} - By category
GET  /api/products/search?q={q} - Search
```

#### Events
```
POST /api/events                - Track event
POST /api/events/batch          - Batch tracking
GET  /api/e

## 📁 Project Structure

```
store/
├── backend/                      # Spring Boot Application
│   ├── src/main/java/com/ecommerce/clickstream/
│   │   ├── controller/          # REST Controllers
│   │   ├── service/             # Business Logic
│   │   │   └── impl/            # Service Implementations
│   │   ├── repository/          # Data Access Layer
│   │   ├── model/               # Domain Models
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── mapper/              # DTO ↔ Entity Mappers
│   │   ├── exception/           # Custom Exceptions
│   │   └── config/              # Configuration
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                     # React Application
│   ├── src/
│   │   ├── components/          # React Components
│   │   │   ├── ProductCard.tsx
│   │   │   └── CartModal.tsx
│   │   ├── pages/               # Page Components
│   │   │   └── HomePage.tsx
│   │   ├── services/            # API Services
│   │   │   ├── productService.ts
│   │   │   └── trackingService.ts
│   │   ├── hooks/               # Custom Hooks
│   │   │   ├── useCart.ts
│   │   │   └── useSession.ts
│   │   ├── types/               # TypeScript Types
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docs/
    ├── DEPLOYMENT.md            # Deployment Guide
    └── QUICKSTART.md            # Quick Start Guide
```

## 🎯 Event Tracking

### Event Types
```typescript
type EventType = 
  | 'view'              // Product page view
  | 'add_to_cart'       // Add item to cart
  | 'remove_from_cart'  // Remove from cart
  | 'purchase'          // Complete purchase
  | 'search'            // Product search
  | 'filter';           // Category filter
```

### Example Event
```json
{
  "userId": "USER_A1B2C3",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "purchase",
  "productId": "PROD_001",
  "productName": "iPhone 15 Pro Max",
  "category": "smartphones",
  "price": 1199.99,
  "quantity": 1,
  "timestamp": "2026-01-26T10:30:00"
}
```

## 🔧 Technology Stack

### Backend
- **Java 17** - Modern Java features
- **Spring Boot 3.2.1** - Application framework
- **Spring Kafka** - Kafka integration
- **Lombok** - Boilerplate reduction
- **Jackson** - JSON processing
- **Maven** - Build tool

### Frontend
- **React 18** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **React Hot Toast** - Notifications
- **UUID** - ID generation

### Infrastructure
- **Docker** - Containerization
- **Apache Kafka 7.5** - Event streaming
- **Apache Spark 3.x** - Stream processing
- **Apache Airflow** - Workflow orchestration
- **PostgreSQL 15** - Airflow metadata
- **Nginx** - Frontend server

## 📡 API Documentation

### Products API
```bash
# Get all products
GET /api/products
Response: ApiResponse<List<ProductDTO>>

# Get product by ID
GET /api/products/{id}
Response: ApiResponse<ProductDTO>

# Search products
GET /api/products/search?q=iphone
Response: ApiResponse<List<ProductDTO>>

# Get by category
GET /api/products/category/smartphones
Response: ApiResponse<List<ProductDTO>>
```

### Events API
```bash
# Track event
POST /api/events
Content-Type: application/json
Body: ClickstreamEventDTO
Response: ApiResponse<Map<String, Object>>

# Health check
GET /api/events/health
Response: ApiResponse<Map<String, String>>
```

## 🧪 Testing

### Test Event Flow
```bash
# 1. Track a view event
curl -X POST http://13.235.248.201:8090/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_USER",
    "sessionId": "test-session",
    "eventType": "view",
    "productId": "PROD_001",
    "productName": "iPhone 15 Pro Max",
    "category": "smartphones",
    "price": 1199.99
  }'

# 2. Verify in Kafka
docker exec -it broker kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic clickstream_events \
  --from-beginning
```

## 📊 Monitoring & Observability

### Backend Logs
```bash
docker logs -f store-backend
```

### Frontend Logs
```bash
docker logs -f store-frontend
```

### Kafka Consumer
```bash
docker exec -it broker kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic clickstream_events \
  --from-beginning
```

### Spark Jobs
Visit: http://13.235.248.201:8081

## 🔒 Security Features

- ✅ CORS configuration
- ✅ Input validation
- ✅ Non-root Docker users
- ✅ Environment variable configuration
- ✅ API error handling
- ✅ Request sanitization

## 🚀 Deployment

### Production Deployment
```bash
# Build and deploy
cd ecommerce_pipeline
docker-compose up -d store-backend store-frontend

# Check status
docker-compose ps

# View logs
docker-compose logs -f store-backend store-frontend
```

### Environment Configuration
```bash
# Backend
KAFKA_BOOTSTRAP_SERVERS=broker:29092
KAFKA_CLICKSTREAM_TOPIC=clickstream_events

# Frontend  
VITE_API_BASE_URL=http://13.235.248.201:8090/api
```

## 📈 Performance

- **API Response Time**: < 50ms average
- **Event Publishing**: Async, non-blocking
- **Frontend Build**: Optimized with Vite
- **Image Loading**: Lazy loading enabled
- **Bundle Size**: Code splitting

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if Kafka is running
docker ps | grep broker

# Verify topic exists
docker exec -it broker kafka-topics \
  --list --bootstrap-server localhost:9092

# Test backend health
curl http://13.235.248.201:8090/api/events/health
```

### Frontend Issues
```bash
# Check environment variables
cat store/frontend/.env

# Verify API connectivity
curl http://13.235.248.201:8090/api/products

# Check frontend container
docker logs store-frontend
```

## 📚 Documentation

- [Deployment Guide](store/DEPLOYMENT.md)
- [Quick Start Guide](store/QUICKSTART.md)
- [API Documentation](#api-documentation)

## 🎯 Use Cases

1. **E-commerce Platform** - Full-featured online store
2. **Real-time Analytics** - User behavior tracking
3. **Inventory Management** - Stock monitoring
4. **A/B Testing** - Feature experimentation
5. **Personalization** - User preferences
6. **Fraud Detection** - Anomaly detection

## 🤝 Contributing

This is a demonstration project showcasing enterprise-grade architecture and modern development practices.

## 📝 License

This project is for educational and demonstration purposes.

## 👥 Authors

Built with enterprise-grade patterns and modern technologies.

---

**🎉 Ready to explore real-time e-commerce analytics!**

For detailed setup instructions, see [DEPLOYMENT.md](store/DEPLOYMENT.md)

For quick start, see [QUICKSTART.md](store/QUICKSTART.md)
