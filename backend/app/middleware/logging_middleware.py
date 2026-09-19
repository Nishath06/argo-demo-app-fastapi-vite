import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.core.logging import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured request and response logging with execution timing."""
    async def dispatch(self, request: Request, call_next):
        # Exclude metrics and health endpoints from noisy access logs if desired
        is_observability_endpoint = request.url.path in ["/health", "/metrics"]
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
            
            if not is_observability_endpoint or response.status_code >= 400:
                logger.info(
                    f"{request.method} {request.url.path} - {response.status_code} ({process_time_ms}ms)",
                    extra={
                        "props": {
                            "method": request.method,
                            "path": request.url.path,
                            "status_code": response.status_code,
                            "duration_ms": process_time_ms,
                            "client_ip": request.client.host if request.client else "unknown",
                        }
                    }
                )
            return response
        except Exception as exc:
            process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                f"Unhandled error processing {request.method} {request.url.path}: {exc}",
                exc_info=True,
                extra={
                    "props": {
                        "method": request.method,
                        "path": request.url.path,
                        "duration_ms": process_time_ms,
                        "client_ip": request.client.host if request.client else "unknown",
                    }
                }
            )
            raise exc
