import pymongo
from app.db.mongodb import get_tasks_collection, get_users_collection
from app.core.logging import logger


async def init_db() -> None:
    """Create essential MongoDB indexes for performance and uniqueness."""
    try:
        users_col = get_users_collection()
        tasks_col = get_tasks_collection()

        # Unique index on email for users collection
        await users_col.create_index([("email", pymongo.ASCENDING)], unique=True, name="idx_users_email_unique")

        # Indexes for tasks collection
        await tasks_col.create_index([("user_id", pymongo.ASCENDING)], name="idx_tasks_user_id")
        await tasks_col.create_index([("user_id", pymongo.ASCENDING), ("status", pymongo.ASCENDING)], name="idx_tasks_user_status")
        await tasks_col.create_index([("created_at", pymongo.DESCENDING)], name="idx_tasks_created_at")

        logger.info("MongoDB indexes successfully verified/created.")
    except Exception as e:
        logger.warning(f"Database indexing check/initialization deferred or skipped: {e}")
