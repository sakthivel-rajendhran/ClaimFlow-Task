# ClaimFlow — Employee Expense Claims Management System

A production-ready, full-stack web application for managing employee expense reimbursements.

## Features

- **Employee Portal**: Submit claims with receipt uploads (JPG, PNG, PDF), track claim status, view rejection reasons
- **Admin Portal**: Review claims in a split interface, approve/reject with mandatory reason, employee management, real-time analytics
- **Claim Workflow**: PENDING → APPROVED / REJECTED → PROCESSED
- **File Uploads**: Drag & drop, file validation, UUID-renamed storage, served via FastAPI static files
- **Authentication**: JWT with bcrypt password hashing, role-based access control
- **Dark / Light Theme**: Persisted to localStorage
- **Responsive**: Mobile, tablet, desktop
- **SEO**: Open Graph, Twitter Card, JSON-LD, robots.txt, sitemap.xml

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Axios, CSS Variables |
| Backend | Python 3.11, FastAPI, PyMongo, Passlib (bcrypt), python-jose (JWT) |
| Database | MongoDB (Atlas or local) |
| File Storage | Local `./uploads/` directory served as static files |

## Project Structure

```
ClaimFlow/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/     # StatusBadge, SEO
│   │   ├── pages/          # All page components
│   │   ├── layouts/        # AppLayout (sidebar + header)
│   │   ├── context/        # Auth, Theme, Toast contexts
│   │   ├── services/       # Axios API service layer
│   │   └── utils/          # Formatters, helpers
│   └── public/             # robots.txt, sitemap.xml, favicon.svg
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── routes/         # auth.py, claims.py, admin.py
│   │   ├── schemas/        # Pydantic models
│   │   ├── auth/           # JWT + password hashing
│   │   ├── utils/          # File upload handler
│   │   ├── main.py         # App entry, CORS, static files
│   │   ├── config.py       # Settings from .env
│   │   └── database.py     # MongoDB connection + indexes
│   └── uploads/            # Stored receipt files
├── docker-compose.yml
└── .env.example
```

## Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=claimflow
JWT_SECRET=your-super-secret-key
JWT_EXPIRE_MINUTES=1440
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SITE_URL=http://localhost:5173
```

## MongoDB Setup

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Add your IP to the network access list (or use 0.0.0.0/0 for development)
4. Copy the connection string into `backend/.env`

### Creating an Admin User

Since admin self-registration is disabled for security, create an admin manually via MongoDB Compass or Atlas UI:

```json
{
  "name": "Admin User",
  "email": "admin@company.com",
  "password_hash": "<bcrypt hash of your password>",
  "role": "ADMIN",
  "department": "IT",
  "created_at": { "$date": "2026-01-01T00:00:00.000Z" },
  "updated_at": { "$date": "2026-01-01T00:00:00.000Z" }
}
```

**To generate a bcrypt hash**, run:
```python
from passlib.context import CryptContext
pwd = CryptContext(schemes=["bcrypt"]).hash("YourPassword123")
print(pwd)
```

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
# Create backend/.env with your MongoDB URI and JWT_SECRET
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/api/docs

### Frontend

```bash
cd frontend
npm install
# Create frontend/.env (copy from frontend/.env.example)
npm run dev
```

App available at: http://localhost:5173

The Vite dev server proxies `/api` and `/uploads` to the backend at port 8000.

## Docker Deployment

```bash
# Copy .env.example to .env and configure
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT_SECRET

docker-compose up --build
```

The backend is accessible at port 8000. Run the frontend separately (`npm run dev`) or deploy it to a static host (Vercel, Netlify, etc.) pointing `VITE_API_BASE_URL` to your backend URL.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/register | Public | Register employee |
| POST | /api/v1/auth/login | Public | Login |
| GET | /api/v1/auth/me | JWT | Get current user |
| POST | /api/v1/claims | Employee | Submit claim + receipt |
| GET | /api/v1/claims | Employee | List own claims |
| GET | /api/v1/claims/{id} | Employee | Get own claim |
| GET | /api/v1/admin/stats | Admin | Dashboard statistics |
| GET | /api/v1/admin/claims | Admin | List all claims |
| GET | /api/v1/admin/claims/{id} | Admin | Get any claim |
| PATCH | /api/v1/admin/claims/{id} | Admin | Approve/Reject claim |
| GET | /api/v1/admin/users | Admin | List employees |
| GET | /api/v1/health | Public | Health check |

## File Upload Architecture

1. Employee submits `multipart/form-data` with form fields + receipt file
2. Backend validates: extension (jpg/png/pdf), MIME type, size (≤10MB)
3. File is renamed to `<uuid><ext>` and saved to `./uploads/`
4. `image_url` stored in MongoDB as `/uploads/<uuid>.<ext>`
5. FastAPI serves `/uploads/*` as static files
6. Frontend loads receipt images/PDFs directly from the backend URL

## Claim Status Flow

```
PENDING → APPROVED → PROCESSED
PENDING → REJECTED
APPROVED → PROCESSED  (via admin "Mark as Processed")
```

## Troubleshooting

| Problem | Solution |
|---|---|
| MongoDB connection fails | Check MONGODB_URI in backend/.env; verify Atlas IP whitelist |
| File upload 413 error | Check MAX_UPLOAD_SIZE in .env (default 10MB) |
| JWT 401 errors | Check JWT_SECRET is the same between restarts; token may have expired |
| CORS errors | Add your frontend URL to CORS_ORIGINS in backend/.env |
| Receipt not loading | Check /uploads/ is mounted and the backend is running |
| Admin can't log in | Verify the MongoDB user document has `"role": "ADMIN"` |
