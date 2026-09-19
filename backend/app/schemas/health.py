from datetime import datetime
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    database_connected: bool
    timestamp: datetime
    app_name: str
    environment: str
