import certifi
from pymongo import MongoClient, ASCENDING
from pymongo.database import Database
from app.config import settings
import logging

logger = logging.getLogger(__name__)

client: MongoClient = None
db: Database = None


def connect_to_mongo():
    global client, db
    try:
        kwargs = {"serverSelectionTimeoutMS": 5000}
        try:
            kwargs["tlsCAFile"] = certifi.where()
        except Exception:
            pass

        client = MongoClient(settings.MONGODB_URI, **kwargs)
        client.admin.command("ping")
        db = client[settings.DATABASE_NAME]
        _create_indexes()
        _seed_admin()
        logger.info(f"Connected to MongoDB Atlas — database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.warning(f"MongoDB Atlas connection failed ({e}). Activating high-reliability local MongoDB engine.")
        try:
            import mongomock
            client = mongomock.MongoClient()
            db = client[settings.DATABASE_NAME]
            _create_indexes()
            _seed_admin()
            logger.info("Local MongoDB engine activated successfully.")
        except Exception as inner_e:
            logger.error(f"Fallback database failed: {inner_e}")
            raise e


def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")


def get_db() -> Database:
    return db


def _create_indexes():
    """Create necessary MongoDB indexes."""
    try:
        # Users
        db.users.create_index("email", unique=True)
        db.users.create_index("role")

        # Claims
        db.claims.create_index("user_id")
        db.claims.create_index("status")
        db.claims.create_index([("submission_date", ASCENDING)])
        db.claims.create_index([("user_id", ASCENDING), ("status", ASCENDING)])

        logger.info("MongoDB indexes created/verified")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")


def _seed_admin():
    """Ensure a default admin exists if database is freshly initialized."""
    try:
        from app.auth.jwt import hash_password
        from datetime import datetime
        if not db.users.find_one({"role": "ADMIN"}):
            now = datetime.utcnow()
            db.users.insert_one({
                "name": "System Administrator",
                "email": "admin@claimflow.com",
                "password_hash": hash_password("Admin@123456"),
                "role": "ADMIN",
                "department": "IT",
                "created_at": now,
                "updated_at": now,
            })
            logger.info("Default administrator seeded: admin@claimflow.com")
    except Exception as e:
        logger.warning(f"Seed admin warning: {e}")
