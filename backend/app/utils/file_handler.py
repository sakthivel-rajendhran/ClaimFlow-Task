import os
import uuid
import mimetypes
from fastapi import HTTPException, status, UploadFile
from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf"}


def validate_and_save_file(file: UploadFile) -> dict:
    """
    Validate file extension, MIME type, and size.
    Save to uploads directory with a UUID filename.
    Returns dict with saved filename info.
    """
    # Check extension
    original_name = file.filename or "upload"
    _, ext = os.path.splitext(original_name.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{ext}'. Allowed: JPG, PNG, PDF",
        )

    # Read file content
    contents = file.file.read()
    file_size = len(contents)

    # Check size
    if file_size > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed size is {max_mb:.0f} MB",
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    # Validate MIME type from content-type header
    content_type = file.content_type or ""
    # Also guess from extension as fallback
    guessed_type, _ = mimetypes.guess_type(original_name)
    
    if content_type not in ALLOWED_MIME_TYPES and guessed_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Invalid file type. Allowed: JPEG, PNG, PDF",
        )

    # Use the content_type if valid, else the guessed one
    final_mime = content_type if content_type in ALLOWED_MIME_TYPES else guessed_type

    # Generate unique filename
    unique_name = f"{uuid.uuid4()}{ext}"

    # Ensure uploads directory exists
    upload_path = os.path.join(settings.UPLOAD_DIR)
    os.makedirs(upload_path, exist_ok=True)

    # Save file
    file_path = os.path.join(upload_path, unique_name)
    with open(file_path, "wb") as f:
        f.write(contents)

    return {
        "unique_filename": unique_name,
        "original_filename": original_name,
        "mime_type": final_mime,
        "file_size": file_size,
        "image_url": f"/uploads/{unique_name}",
    }
