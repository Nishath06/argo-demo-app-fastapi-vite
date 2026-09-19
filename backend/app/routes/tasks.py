from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskStatus
from app.schemas.user import UserResponse
from app.services import task_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get(
    "",
    response_model=TaskListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all tasks for authenticated user"
)
async def list_tasks(
    task_status: Optional[TaskStatus] = Query(None, alias="status", description="Filter by task status"),
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    current_user: UserResponse = Depends(get_current_user),
):
    """Retrieve all tasks owned by the logged-in user with optional filtering and search."""
    return await task_service.get_user_tasks(
        user_id=current_user.id,
        task_status=task_status,
        search=search,
    )


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task"
)
async def create_task(
    task_in: TaskCreate,
    current_user: UserResponse = Depends(get_current_user),
):
    """Create a new task owned by the authenticated user."""
    return await task_service.create_task(
        user_id=current_user.id,
        task_in=task_in,
    )


@router.get(
    "/{id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get task details by ID"
)
async def get_task(
    id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """Retrieve details of a specific task."""
    return await task_service.get_task_by_id(
        user_id=current_user.id,
        task_id=id,
    )


@router.put(
    "/{id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing task"
)
async def update_task(
    id: str,
    task_in: TaskUpdate,
    current_user: UserResponse = Depends(get_current_user),
):
    """Update title, description, status, priority, or due date of a task."""
    return await task_service.update_task(
        user_id=current_user.id,
        task_id=id,
        task_in=task_in,
    )


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a task"
)
async def delete_task(
    id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """Permanently delete a task."""
    return await task_service.delete_task(
        user_id=current_user.id,
        task_id=id,
    )
