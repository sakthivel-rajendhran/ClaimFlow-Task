from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    ADMIN = "ADMIN"


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    created_at: Optional[datetime] = None

    @classmethod
    def from_mongo(cls, doc: dict) -> "UserResponse":
        return cls(
            id=str(doc["_id"]),
            name=doc["name"],
            email=doc["email"],
            role=doc["role"],
            department=doc.get("department", ""),
            created_at=doc.get("created_at"),
        )
