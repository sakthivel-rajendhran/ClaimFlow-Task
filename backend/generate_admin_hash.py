"""
ClaimFlow Admin Password Hash Generator
Run this to generate a bcrypt hash for creating an admin user in MongoDB.

Usage:
    python generate_admin_hash.py
"""
from passlib.context import CryptContext
import getpass

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("=" * 50)
print("ClaimFlow — Admin Password Hash Generator")
print("=" * 50)
print()
password = getpass.getpass("Enter admin password (min 8 chars): ")

if len(password) < 8:
    print("ERROR: Password must be at least 8 characters.")
    exit(1)

confirm = getpass.getpass("Confirm password: ")
if password != confirm:
    print("ERROR: Passwords do not match.")
    exit(1)

hashed = pwd_context.hash(password)

print()
print("MongoDB document to insert into the 'users' collection:")
print()
print("""{
  "name": "Admin User",
  "email": "admin@company.com",
  "password_hash": \"""" + hashed + """\",
  "role": "ADMIN",
  "department": "IT",
  "created_at": { "$date": { "$numberLong": "1726742400000" } },
  "updated_at": { "$date": { "$numberLong": "1726742400000" } }
}""")
print()
print("NOTE: Replace 'name', 'email', and 'department' with your actual values.")
print("Insert this document into the 'users' collection in your MongoDB database.")
