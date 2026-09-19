from fastapi import APIRouter, HTTPException, Depends, Query, status
from datetime import datetime
from bson import ObjectId
from typing import Optional
from app.schemas.claim import ClaimResponse, ClaimListResponse, UpdateClaimRequest
from app.schemas.user import UserResponse
from app.database import get_db
from app.dependencies import require_admin

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/stats")
async def get_admin_stats(
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "total_amount": {"$sum": "$total_amount"}}},
    ]
    status_counts = {doc["_id"]: {"count": doc["count"], "total": doc["total_amount"]} for doc in db.claims.aggregate(pipeline)}

    # Category breakdown
    cat_pipeline = [
        {"$group": {"_id": "$receipt.category", "count": {"$sum": 1}, "total": {"$sum": "$total_amount"}}},
    ]
    category_breakdown = [
        {"category": doc["_id"], "count": doc["count"], "total": doc["total"]}
        for doc in db.claims.aggregate(cat_pipeline)
    ]

    # Monthly breakdown (last 6 months)
    monthly_pipeline = [
        {"$group": {
            "_id": {"year": {"$year": "$submission_date"}, "month": {"$month": "$submission_date"}},
            "count": {"$sum": 1},
            "total": {"$sum": "$total_amount"},
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 6},
    ]
    monthly_data = [
        {
            "year": doc["_id"]["year"],
            "month": doc["_id"]["month"],
            "count": doc["count"],
            "total": doc["total"],
        }
        for doc in db.claims.aggregate(monthly_pipeline)
    ]

    total_users = db.users.count_documents({"role": "EMPLOYEE"})

    return {
        "pending": status_counts.get("PENDING", {}).get("count", 0),
        "approved": status_counts.get("APPROVED", {}).get("count", 0),
        "rejected": status_counts.get("REJECTED", {}).get("count", 0),
        "processed": status_counts.get("PROCESSED", {}).get("count", 0),
        "total_claims": db.claims.count_documents({}),
        "total_amount": sum(v.get("total", 0) for v in status_counts.values()),
        "approved_amount": status_counts.get("APPROVED", {}).get("total", 0),
        "total_employees": total_users,
        "category_breakdown": category_breakdown,
        "monthly_data": monthly_data,
    }


@router.get("/claims", response_model=ClaimListResponse)
async def list_all_claims(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    employee_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    query = {}

    if status and status != "ALL":
        query["status"] = status.upper()

    if category and category != "ALL":
        query["receipt.category"] = category

    if employee_id:
        try:
            query["user_id"] = ObjectId(employee_id)
        except Exception:
            pass

    if search:
        matching_users = list(db.users.find({"name": {"$regex": search, "$options": "i"}}, {"_id": 1}))
        matching_user_ids = [u["_id"] for u in matching_users]
        query["$or"] = [
            {"receipt.merchant_name": {"$regex": search, "$options": "i"}},
            {"employee_name": {"$regex": search, "$options": "i"}},
            {"user_id": {"$in": matching_user_ids}},
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
        user_doc = db.users.find_one({"_id": claim["user_id"]})
        claims.append(ClaimResponse.from_mongo(claim, user_doc))

    return ClaimListResponse(
        claims=claims,
        total=total,
        page=page,
        per_page=per_page,
        pages=max(1, (total + per_page - 1) // per_page),
    )


@router.get("/claims/{claim_id}", response_model=ClaimResponse)
async def get_claim_admin(
    claim_id: str,
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    try:
        oid = ObjectId(claim_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid claim ID")

    claim = db.claims.find_one({"_id": oid})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    user_doc = db.users.find_one({"_id": claim["user_id"]})
    return ClaimResponse.from_mongo(claim, user_doc)


@router.patch("/claims/{claim_id}", response_model=ClaimResponse)
async def update_claim_status(
    claim_id: str,
    request: UpdateClaimRequest,
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    try:
        oid = ObjectId(claim_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid claim ID")

    claim = db.claims.find_one({"_id": oid})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Rejection requires a reason
    if request.status.value == "REJECTED":
        if not request.admin_notes or not request.admin_notes.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rejection reason is required",
            )

    now = datetime.utcnow()
    update_data = {
        "status": request.status.value,
        "admin_notes": request.admin_notes,
        "reviewed_by": current_user["_id"],
        "reviewed_at": now,
        "updated_at": now,
    }

    db.claims.update_one({"_id": oid}, {"$set": update_data})
    updated_claim = db.claims.find_one({"_id": oid})
    user_doc = db.users.find_one({"_id": updated_claim["user_id"]})

    return ClaimResponse.from_mongo(updated_claim, user_doc)


@router.get("/employees")
@router.get("/users")
async def list_employees(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    query = {"role": "EMPLOYEE"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    total = db.users.count_documents(query)
    skip = (page - 1) * per_page
    users_cursor = db.users.find(query).skip(skip).limit(per_page)

    employees = []
    for user in users_cursor:
        claim_count = db.claims.count_documents({"user_id": user["_id"]})
        user_resp = UserResponse.from_mongo(user)
        employees.append({
            **user_resp.model_dump(),
            "claim_count": claim_count,
        })

    return {
        "employees": employees,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
    }


@router.get("/employees/{employee_id}")
async def get_employee_details(
    employee_id: str,
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    try:
        oid = ObjectId(employee_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID")

    user = db.users.find_one({"_id": oid, "role": "EMPLOYEE"})
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    claims = list(db.claims.find({"user_id": oid}).sort([("submission_date", -1)]))
    claim_responses = [ClaimResponse.from_mongo(c, user) for c in claims]

    return {
        "employee": UserResponse.from_mongo(user),
        "claims": claim_responses,
        "total_claims": len(claims),
        "total_claimed_amount": sum(c.get("total_amount", 0) for c in claims),
        "approved_amount": sum(c.get("total_amount", 0) for c in claims if c.get("status") in ["APPROVED", "PROCESSED"]),
    }
