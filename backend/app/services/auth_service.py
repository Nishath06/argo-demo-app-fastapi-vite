from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import get_users_collection
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.utils.helpers import serialize_doc


async def register_user(user_in: UserRegister) -> UserResponse:
    """Register a new user in MongoDB."""
    users_col = get_users_collection()
    
    # Check if email is already registered
    existing_user = await users_col.find_one({"email": user_in.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    now = datetime.now(timezone.utc)
    hashed_password = get_password_hash(user_in.password)
    
    user_doc = {
        "email": user_in.email.lower(),
        "hashed_password": hashed_password,
        "full_name": user_in.full_name,
        "created_at": now,
        "updated_at": now,
    }
    
    result = await users_col.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    serialized = serialize_doc(user_doc)
    return UserResponse(**serialized)


async def authenticate_user(login_in: UserLogin) -> TokenResponse:
    """Authenticate credentials and generate JWT token."""
    users_col = get_users_collection()
    
    user = await users_col.find_one({"email": login_in.email.lower()})
    if not user or not verify_password(login_in.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = str(user["_id"])
    access_token = create_access_token(subject=user_id)
    
    serialized_user = serialize_doc(user)
    user_response = UserResponse(**serialized_user)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


async def get_user_by_id(user_id: str) -> UserResponse:
    """Retrieve user profile by MongoDB ObjectId."""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )
    
    users_col = get_users_collection()
    user = await users_col.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse(**serialize_doc(user))
