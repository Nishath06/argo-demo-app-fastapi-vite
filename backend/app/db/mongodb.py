from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from app.core.config import settings
from app.core.logging import logger


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None


db_manager = MongoDB()


async def connect_to_mongo() -> None:
    """Initialize MongoDB async client with connection pooling."""
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI.split('@')[-1]} (database: {settings.DATABASE_NAME})...")
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            serverSelectionTimeoutMS=2000,
        )
        db_manager.database = db_manager.client[settings.DATABASE_NAME]
        
        # Ping the server to verify connection on startup
        await db_manager.database.command("ping")
        logger.info("Successfully connected to MongoDB Atlas!")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Note: We do not exit immediately so the app can start and report status via /health


async def close_mongo_connection() -> None:
    """Close MongoDB connection gracefully."""
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """Get active MongoDB database instance."""
    if db_manager.database is None:
        raise RuntimeError("Database is not initialized. Check MongoDB connection settings.")
    return db_manager.database


def get_tasks_collection() -> AsyncIOMotorCollection:
    """Get tasks collection."""
    return get_database()["tasks"]


def get_users_collection() -> AsyncIOMotorCollection:
    """Get users collection."""
    return get_database()["users"]


async def ping_database() -> bool:
    """Check if MongoDB is reachable and healthy."""
    if not db_manager.client or db_manager.database is None:
        return False
    try:
        await db_manager.database.command("ping")
        return True
    except Exception:
        return False
