from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from bson import ObjectId
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.auth.jwt import hash_password, verify_password, create_access_token
from app.database import get_db
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db=Depends(get_db)):
    # Check for existing email
    existing = db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    now = datetime.utcnow()
    user_doc = {
        "name": request.name,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "role": "EMPLOYEE",  # Strict server-side enforcement: all registered accounts are EMPLOYEE
        "department": request.department,
        "created_at": now,
        "updated_at": now,
    }

    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token(
        data={"sub": str(result.inserted_id), "role": "EMPLOYEE"},
        expires_delta=timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    )

    return TokenResponse(
        access_token=token,
        user=UserResponse.from_mongo(user_doc),
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db=Depends(get_db)):
    user = db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]},
        expires_delta=timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    )

    return TokenResponse(
        access_token=token,
        user=UserResponse.from_mongo(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return UserResponse.from_mongo(current_user)
