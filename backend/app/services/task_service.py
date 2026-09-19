from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import get_tasks_collection
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskStatus
from app.utils.helpers import serialize_doc


async def get_user_tasks(
    user_id: str,
    task_status: Optional[TaskStatus] = None,
    search: Optional[str] = None,
) -> TaskListResponse:
    """Retrieve all tasks for the authenticated user, optionally filtered."""
    tasks_col = get_tasks_collection()
    
    query = {"user_id": user_id}
    if task_status:
        query["status"] = task_status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    cursor = tasks_col.find(query).sort("created_at", -1)
    tasks_list = []
    async for doc in cursor:
        tasks_list.append(TaskResponse(**serialize_doc(doc)))

    return TaskListResponse(tasks=tasks_list, total=len(tasks_list))


async def create_task(user_id: str, task_in: TaskCreate) -> TaskResponse:
    """Create a new task for the authenticated user."""
    tasks_col = get_tasks_collection()
    now = datetime.now(timezone.utc)
    
    task_dict = task_in.model_dump()
    task_dict["user_id"] = user_id
    task_dict["created_at"] = now
    task_dict["updated_at"] = now

    result = await tasks_col.insert_one(task_dict)
    task_dict["_id"] = result.inserted_id

    return TaskResponse(**serialize_doc(task_dict))


async def get_task_by_id(user_id: str, task_id: str) -> TaskResponse:
    """Get single task by ID ensuring it belongs to the user."""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format",
        )

    tasks_col = get_tasks_collection()
    task = await tasks_col.find_one({"_id": ObjectId(task_id), "user_id": user_id})
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return TaskResponse(**serialize_doc(task))


async def update_task(user_id: str, task_id: str, task_in: TaskUpdate) -> TaskResponse:
    """Update task fields ensuring ownership."""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format",
        )

    tasks_col = get_tasks_collection()
    update_data = {k: v for k, v in task_in.model_dump().items() if v is not None}
    
    if not update_data:
        # Return current without modification if no fields were provided
        return await get_task_by_id(user_id, task_id)

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await tasks_col.find_one_and_update(
        {"_id": ObjectId(task_id), "user_id": user_id},
        {"$set": update_data},
        return_document=True,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return TaskResponse(**serialize_doc(result))


async def delete_task(user_id: str, task_id: str) -> dict:
    """Delete task ensuring ownership."""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format",
        )

    tasks_col = get_tasks_collection()
    result = await tasks_col.delete_one({"_id": ObjectId(task_id), "user_id": user_id})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return {"message": "Task deleted successfully", "id": task_id}
