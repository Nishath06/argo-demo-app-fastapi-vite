from fastapi import APIRouter, Depends, status
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services import auth_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account"
)
async def register(user_in: UserRegister):
    """Register a new user with email and password."""
    return await auth_service.register_user(user_in)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login and JWT token generation"
)
async def login(login_in: UserLogin):
    """Authenticate user with credentials and return JWT bearer token."""
    return await auth_service.authenticate_user(login_in)


@router.get(
    "/profile",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve current user profile"
)
async def get_profile(current_user: UserResponse = Depends(get_current_user)):
    """Return profile data of the currently logged-in user."""
    return current_user
