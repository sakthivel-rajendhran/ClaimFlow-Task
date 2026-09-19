from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt import decode_access_token
from app.database import get_db
from bson import ObjectId

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def require_admin(current_user=Depends(get_current_user)):
    # Verify role directly against the MongoDB document
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrator access required",
        )
    return current_user


def require_employee(current_user=Depends(get_current_user)):
    # Verify role directly against the MongoDB document
    if current_user.get("role") != "EMPLOYEE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Employee access required",
        )
    return current_user


def get_db_dep():
    return get_db()

