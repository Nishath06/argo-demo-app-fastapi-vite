# FastAPI Production-Ready Backend

Production-ready async REST API built with FastAPI, Motor (Async MongoDB), Pydantic v2, JWT authentication, Prometheus metrics, and structured logging.

## Features

- **FastAPI (Python 3.12)**: Asynchronous, fast, and auto-documenting (`/docs`).
- **Motor & MongoDB Atlas**: Async MongoDB client with connection pooling (`starterdb`).
- **Pydantic v2**: Type validation and serialization for requests and responses.
- **JWT Authentication**: Passwords hashed with bcrypt, stateless JWT bearer token authentication.
- **Structured Logging**: Context-aware logging middleware with request timing and status tracking.
- **Prometheus Metrics**: Automated metric instrumentation available on `/metrics`.
- **Health Check**: Comprehensive `/health` endpoint verifying MongoDB connectivity and status.
- **CORS Configured**: Seamless frontend integration with configurable origins.
- **Security**: Runs as non-root user in Docker container, input sanitization, and global error handling.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── deps.py              # Auth & DB dependencies
│   ├── core/
│   │   ├── config.py            # Pydantic Settings
│   │   ├── security.py          # Hashing & JWT functions
│   │   └── logging.py           # Structured logger configuration
│   ├── db/
│   │   ├── mongodb.py           # Motor async client & pooling
│   │   └── init_db.py           # Database index setup
│   ├── middleware/
│   │   ├── logging_middleware.py # Request logging & timing middleware
│   │   └── error_handler.py     # Global exception handlers
│   ├── models/
│   │   ├── user.py              # MongoDB user model definitions
│   │   └── task.py              # MongoDB task model definitions
│   ├── routes/
│   │   ├── auth.py              # /api/v1/auth routes
│   │   ├── tasks.py             # /api/v1/tasks routes
│   │   └── health.py            # /health & /metrics routes
│   ├── schemas/
│   │   ├── user.py              # User request/response schemas
│   │   ├── task.py              # Task request/response schemas
│   │   └── health.py            # Healthcheck schema
│   ├── services/
│   │   ├── auth_service.py      # User authentication business logic
│   │   └── task_service.py      # Task management business logic
│   ├── utils/
│   │   └── helpers.py           # ObjectId conversion helpers
│   └── main.py                  # App entry point and lifespan
├── Dockerfile                   # python:3.12-slim non-root image
├── .dockerignore
├── .env.example
├── requirements.txt
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate user and receive JWT access token
- `GET /api/v1/auth/profile` - Get currently authenticated user profile (Protected)

### Tasks
- `GET /api/v1/tasks` - List authenticated user's tasks (Supports `?status=` and `?search=`) (Protected)
- `POST /api/v1/tasks` - Create a new task (Protected)
- `GET /api/v1/tasks/{id}` - Get task details by ID (Protected)
- `PUT /api/v1/tasks/{id}` - Update an existing task (Protected)
- `DELETE /api/v1/tasks/{id}` - Delete a task (Protected)

### System & Observability
- `GET /health` - Liveness & readiness check (returns API status, MongoDB connection, timestamp)
- `GET /metrics` - Prometheus metrics instrumentation

## Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas / Server connection string | `mongodb+srv://...` |
| `DATABASE_NAME` | Database name | `starterdb` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `min-32-characters-secret` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes | `60` |
| `APP_NAME` | Application name | `Starter API` |
| `ENVIRONMENT` | Environment mode | `development` / `production` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

## Local Development

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB credentials
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. Access interactive API documentation at:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Docker Container Build & Run

```bash
# Build image
docker build -t starter-backend:latest .

# Run container
docker run -p 8000:8000 --env-file .env starter-backend:latest
```
