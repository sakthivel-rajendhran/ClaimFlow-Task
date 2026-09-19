from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import logging

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, claims, admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="ClaimFlow — Employee Expense Claims Management API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    connect_to_mongo()
    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("ClaimFlow API started")


@app.on_event("shutdown")
async def shutdown():
    close_mongo_connection()


# Mount uploads as static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(claims.router)
app.include_router(admin.router)


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
    )
