from datetime import datetime, timezone
from fastapi import APIRouter, Response, status
from app.core.config import settings
from app.db.mongodb import ping_database
from app.schemas.health import HealthResponse

router = APIRouter(tags=["System"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint for Kubernetes liveness & readiness"
)
async def health_check(response: Response):
    """
    Returns:
    - API status (healthy / degraded)
    - MongoDB connection status
    - Current ISO timestamp
    """
    db_ok = await ping_database()
    is_healthy = db_ok

    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return HealthResponse(
        status="healthy" if is_healthy else "degraded",
        database_connected=db_ok,
        timestamp=datetime.now(timezone.utc),
        app_name=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
    )
