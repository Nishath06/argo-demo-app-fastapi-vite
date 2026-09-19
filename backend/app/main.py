from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.db.init_db import init_db
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from app.routes.auth import router as auth_router
from app.routes.tasks import router as tasks_router
from app.routes.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for graceful startup and shutdown."""
    # Startup
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode...")
    
    # Initialize async database connection and indexes
    await connect_to_mongo()
    await init_db()
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}...")
    await close_mongo_connection()
    logger.info("Graceful shutdown complete.")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production-ready FastAPI backend with MongoDB Atlas, JWT Auth, Prometheus, and Healthcheck.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Prometheus Metrics Instrumentation
instrumentator = Instrumentator(
    should_group_status_codes=False,
    should_ignore_untemplated=True,
    excluded_handlers=["/metrics", "/health"],
)
instrumentator.instrument(app).expose(app, endpoint="/metrics", tags=["System"])

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Logging Middleware
app.add_middleware(LoggingMiddleware)

# Unified Exception Handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include Routers
# System routes: /health (and /metrics is exposed by instrumentator)
app.include_router(health_router)

# API v1 routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")


@app.get("/", tags=["System"])
async def root():
    """Root endpoint providing service metadata."""
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "metrics": "/metrics",
    }
