from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime, date
from enum import Enum


class ClaimStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PROCESSED = "PROCESSED"


class ExpenseCategory(str, Enum):
    TRAVEL = "Travel"
    MEALS = "Meals"
    SUPPLIES = "Supplies"
    ACCOMMODATION = "Accommodation"
    TRANSPORTATION = "Transportation"
    OTHER = "Other"


class ReceiptInfo(BaseModel):
    image_url: str
    merchant_name: str
    expense_date: str
    category: str
    original_filename: str
    mime_type: str
    file_size: int


class ClaimResponse(BaseModel):
    id: str
    user_id: str
    total_amount: float
    status: str
    submission_date: Optional[datetime] = None
    admin_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    receipt: ReceiptInfo
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # Populated when fetched with user info
    employee_name: Optional[str] = None
    employee_email: Optional[str] = None
    employee_department: Optional[str] = None

    @classmethod
    def from_mongo(cls, doc: dict, user_doc: Optional[dict] = None) -> "ClaimResponse":
        receipt = doc.get("receipt", {})
        obj = cls(
            id=str(doc["_id"]),
            user_id=str(doc["user_id"]),
            total_amount=doc.get("total_amount", 0),
            status=doc.get("status", "PENDING"),
            submission_date=doc.get("submission_date"),
            admin_notes=doc.get("admin_notes"),
            reviewed_by=str(doc["reviewed_by"]) if doc.get("reviewed_by") else None,
            reviewed_at=doc.get("reviewed_at"),
            receipt=ReceiptInfo(
                image_url=receipt.get("image_url", ""),
                merchant_name=receipt.get("merchant_name", ""),
                expense_date=receipt.get("expense_date", ""),
                category=receipt.get("category", ""),
                original_filename=receipt.get("original_filename", ""),
                mime_type=receipt.get("mime_type", ""),
                file_size=receipt.get("file_size", 0),
            ),
            created_at=doc.get("created_at"),
            updated_at=doc.get("updated_at"),
        )
        if user_doc:
            obj.employee_name = user_doc.get("name")
            obj.employee_email = user_doc.get("email")
            obj.employee_department = user_doc.get("department")
        else:
            obj.employee_name = doc.get("employee_name")
            obj.employee_email = doc.get("employee_email")
            obj.employee_department = doc.get("employee_department")
        return obj


class UpdateClaimRequest(BaseModel):
    status: ClaimStatus
    admin_notes: Optional[str] = None

    @field_validator("admin_notes")
    @classmethod
    def rejection_reason_required(cls, v, info):
        # We check in the route handler for contextual validation
        return v


class ClaimListResponse(BaseModel):
    claims: list[ClaimResponse]
    total: int
    page: int
    per_page: int
    pages: int
