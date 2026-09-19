from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query, status
from datetime import datetime
from bson import ObjectId
from typing import Optional
from app.schemas.claim import ClaimResponse, ClaimListResponse
from app.database import get_db
from app.dependencies import require_employee
from app.utils.file_handler import validate_and_save_file

router = APIRouter(prefix="/api/v1/claims", tags=["Claims"])

VALID_CATEGORIES = {"Travel", "Meals", "Supplies", "Accommodation", "Transportation", "Other"}
VALID_SORT = {"newest", "oldest", "highest", "lowest"}


@router.post("", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
async def create_claim(
    merchant_name: str = Form(...),
    amount: float = Form(...),
    category: str = Form(...),
    expense_date: str = Form(...),
    receipt: UploadFile = File(...),
    current_user=Depends(require_employee),
    db=Depends(get_db),
):
    # Validate fields
    if not merchant_name.strip():
        raise HTTPException(status_code=400, detail="Merchant name is required")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category")
    if not expense_date:
        raise HTTPException(status_code=400, detail="Expense date is required")

    # Validate and save file
    file_info = validate_and_save_file(receipt)

    now = datetime.utcnow()
    claim_doc = {
        "user_id": current_user["_id"],
        "employee_name": current_user.get("name"),
        "employee_email": current_user.get("email"),
        "employee_department": current_user.get("department"),
        "total_amount": amount,
        "status": "PENDING",
        "submission_date": now,
        "admin_notes": None,
        "reviewed_by": None,
        "reviewed_at": None,
        "receipt": {
            "image_url": file_info["image_url"],
            "merchant_name": merchant_name.strip(),
            "expense_date": expense_date,
            "category": category,
            "original_filename": file_info["original_filename"],
            "mime_type": file_info["mime_type"],
            "file_size": file_info["file_size"],
        },
        "created_at": now,
        "updated_at": now,
    }

    result = db.claims.insert_one(claim_doc)
    claim_doc["_id"] = result.inserted_id

    return ClaimResponse.from_mongo(claim_doc, current_user)


@router.get("", response_model=ClaimListResponse)
async def list_claims(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user=Depends(require_employee),
    db=Depends(get_db),
):
    query = {"user_id": current_user["_id"]}

    if status and status != "ALL":
        query["status"] = status.upper()

    if search:
        query["$or"] = [
            {"receipt.merchant_name": {"$regex": search, "$options": "i"}},
        ]

    sort_map = {
        "newest": [("submission_date", -1)],
        "oldest": [("submission_date", 1)],
        "highest": [("total_amount", -1)],
        "lowest": [("total_amount", 1)],
    }
    sort_order = sort_map.get(sort, sort_map["newest"])

    total = db.claims.count_documents(query)
    skip = (page - 1) * per_page
    claims_cursor = db.claims.find(query).sort(sort_order).skip(skip).limit(per_page)

    claims = []
    for claim in claims_cursor:
        claims.append(ClaimResponse.from_mongo(claim, current_user))

    return ClaimListResponse(
        claims=claims,
        total=total,
        page=page,
        per_page=per_page,
        pages=max(1, (total + per_page - 1) // per_page),
    )


@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(
    claim_id: str,
    current_user=Depends(require_employee),
    db=Depends(get_db),
):
    try:
        oid = ObjectId(claim_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid claim ID")

    claim = db.claims.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    return ClaimResponse.from_mongo(claim, current_user)
