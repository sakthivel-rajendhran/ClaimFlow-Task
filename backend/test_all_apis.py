import urllib.request
import urllib.error
import json
import io
import sys

BASE_URL = "http://127.0.0.1:8000"

total_tests = 0
passed_tests = 0
warnings_count = 0

def test_api(name, method, endpoint, headers=None, data=None, is_json=True, expected_status=200):
    global total_tests, passed_tests, warnings_count
    total_tests += 1
    url = f"{BASE_URL}{endpoint}"
    req_headers = headers.copy() if headers else {}
    body = None

    if data is not None:
        if is_json:
            req_headers["Content-Type"] = "application/json"
            body = json.dumps(data).encode("utf-8")
        else:
            body = data

    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            status = res.status
            content = res.read().decode("utf-8", errors="ignore")
            try:
                parsed = json.loads(content)
            except Exception:
                parsed = content
            if status == expected_status:
                passed_tests += 1
                print(f"  [{passed_tests:02d}] PASS: {name} ({method} {endpoint}) -> Status {status}")
                return parsed
            else:
                print(f"  [FAIL] {name}: Expected status {expected_status}, got {status}")
                return None
    except urllib.error.HTTPError as e:
        if e.code == expected_status:
            passed_tests += 1
            print(f"  [{passed_tests:02d}] PASS: {name} ({method} {endpoint}) -> Handled {e.code} correctly")
            try:
                return json.loads(e.read().decode("utf-8", errors="ignore"))
            except Exception:
                return {}
        else:
            print(f"  [FAIL] {name} ({method} {endpoint}) -> Expected {expected_status}, got {e.code}: {e.read().decode('utf-8', errors='ignore')}")
            return None
    except Exception as exc:
        print(f"  [ERROR] {name} ({method} {endpoint}) -> {exc}")
        return None

def create_multipart(fields, files):
    boundary = "----TestBoundaryClaimFlow2026"
    buf = io.BytesIO()
    for key, val in fields.items():
        buf.write(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"\r\n\r\n{val}\r\n".encode("utf-8"))
    for key, (fname, fcontent, ftype) in files.items():
        buf.write(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"; filename=\"{fname}\"\r\nContent-Type: {ftype}\r\n\r\n".encode("utf-8"))
        buf.write(fcontent)
        buf.write(b"\r\n")
    buf.write(f"--{boundary}--\r\n".encode("utf-8"))
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    return buf.getvalue(), headers

print("=" * 65)
print("     ClaimFlow — Full Comprehensive API Verification Suite     ")
print("=" * 65)

# 1. System Health
test_api("Health Check API", "GET", "/api/v1/health", expected_status=200)

import time
emp_email = f"emp_test_{int(time.time())}@claimflow.com"
reg_payload = {
    "name": "Jane Employee",
    "email": emp_email,
    "password": "Password@123",
    "department": "Engineering"
}
emp_reg = test_api("Employee Account Registration", "POST", "/api/v1/auth/register", data=reg_payload, expected_status=201)

# 3. Prevent Duplicate Registration
test_api("Duplicate Email Check (Conflict 409)", "POST", "/api/v1/auth/register", data=reg_payload, expected_status=409)

# 4. Weak Password Rejection
weak_reg = {
    "name": "Weak User",
    "email": "weak@claimflow.com",
    "password": "123",
    "department": "IT"
}
test_api("Weak Password Rejection (422)", "POST", "/api/v1/auth/register", data=weak_reg, expected_status=422)

# 5. Invalid Login
test_api("Invalid Password Rejection (401)", "POST", "/api/v1/auth/login", data={"email": emp_email, "password": "WrongPassword"}, expected_status=401)

# 6. Valid Employee Login
emp_login = test_api("Employee Valid Login", "POST", "/api/v1/auth/login", data={"email": emp_email, "password": "Password@123"}, expected_status=200)
emp_token = emp_login["access_token"]
emp_headers = {"Authorization": f"Bearer {emp_token}"}

# 7. Unauthenticated User Check
test_api("Protected Route Without Token (403)", "GET", "/api/v1/auth/me", expected_status=403)

# 8. Employee Profile Verification
me_res = test_api("Employee Profile Fetch (/me)", "GET", "/api/v1/auth/me", headers=emp_headers, expected_status=200)

# 9. Admin Login
admin_login = test_api("Administrator Login", "POST", "/api/v1/auth/login", data={"email": "admin@claimflow.com", "password": "Admin@123456"}, expected_status=200)
admin_token = admin_login["access_token"]
admin_headers = {"Authorization": f"Bearer {admin_token}"}

# 10. Role Boundary: Employee Blocked from Admin Endpoints
test_api("Employee Blocked from /admin/stats (403)", "GET", "/api/v1/admin/stats", headers=emp_headers, expected_status=403)
test_api("Employee Blocked from /admin/claims (403)", "GET", "/api/v1/admin/claims", headers=emp_headers, expected_status=403)
test_api("Employee Blocked from /admin/employees (403)", "GET", "/api/v1/admin/employees", headers=emp_headers, expected_status=403)

# 11. Create Claim 1 (Travel)
claim1_data, claim1_headers = create_multipart(
    {"amount": "4500.50", "category": "Travel", "expense_date": "2026-09-15"},
    {"receipt": ("airline_ticket.png", b"\x89PNG\r\n\x1a\nFakePngData", "image/png")}
)
claim1_headers.update(emp_headers)
c1 = test_api("Submit Expense Claim #1 (Travel)", "POST", "/api/v1/claims", headers=claim1_headers, data=claim1_data, is_json=False, expected_status=201)
c1_id = c1["id"]
c1_receipt_url = c1["receipt"]["image_url"]

# 12. Create Claim 2 (Meals)
claim2_data, claim2_headers = create_multipart(
    {"amount": "1200.00", "category": "Meals", "expense_date": "2026-09-17"},
    {"receipt": ("dinner_bill.jpg", b"\xff\xd8\xffFakeJpgData", "image/jpeg")}
)
claim2_headers.update(emp_headers)
c2 = test_api("Submit Expense Claim #2 (Meals)", "POST", "/api/v1/claims", headers=claim2_headers, data=claim2_data, is_json=False, expected_status=201)
c2_id = c2["id"]

# 13. Create Claim 3 (Supplies)
claim3_data, claim3_headers = create_multipart(
    {"amount": "850.75", "category": "Supplies", "expense_date": "2026-09-18"},
    {"receipt": ("office_receipt.pdf", b"%PDF-1.4FakePdfData", "application/pdf")}
)
claim3_headers.update(emp_headers)
c3 = test_api("Submit Expense Claim #3 (Supplies)", "POST", "/api/v1/claims", headers=claim3_headers, data=claim3_data, is_json=False, expected_status=201)
c3_id = c3["id"]

# 14. Employee List Own Claims
emp_claims = test_api("Employee List Own Claims", "GET", "/api/v1/claims?sort=newest&per_page=10", headers=emp_headers, expected_status=200)

# 15. Employee Filter Own Claims by Status
test_api("Employee Filter Own Claims (PENDING)", "GET", "/api/v1/claims?status=PENDING", headers=emp_headers, expected_status=200)

# 16. Employee Get Specific Claim Detail
test_api("Employee Get Specific Claim Detail", "GET", f"/api/v1/claims/{c1_id}", headers=emp_headers, expected_status=200)

# 17. Verify Static File Serving for Uploaded Receipt
test_api("Static Receipt File Fetch", "GET", c1_receipt_url, expected_status=200)

# 18. Admin Get Analytics Stats
test_api("Admin Dashboard Analytics Stats", "GET", "/api/v1/admin/stats", headers=admin_headers, expected_status=200)

# 19. Admin List All Claims Across Company
test_api("Admin List All Organization Claims", "GET", "/api/v1/admin/claims?page=1&per_page=15&sort=newest", headers=admin_headers, expected_status=200)

# 20. Admin Filter by Category
test_api("Admin Filter Claims by Category", "GET", "/api/v1/admin/claims?category=Travel", headers=admin_headers, expected_status=200)

# 21. Admin Search Claims
test_api("Admin Search Claims Query", "GET", "/api/v1/admin/claims?search=Travel", headers=admin_headers, expected_status=200)

# 22. Admin Inspect Specific Claim
test_api("Admin Inspect Specific Claim", "GET", f"/api/v1/admin/claims/{c1_id}", headers=admin_headers, expected_status=200)

# 23. Admin Approve Claim
test_api("Admin Approve Claim #1", "PATCH", f"/api/v1/admin/claims/{c1_id}", headers=admin_headers, data={"status": "APPROVED", "admin_notes": "All receipts verified"}, expected_status=200)

# 24. Admin Rejection Without Reason (Must Fail 400)
test_api("Admin Reject Without Mandatory Reason (400)", "PATCH", f"/api/v1/admin/claims/{c2_id}", headers=admin_headers, data={"status": "REJECTED", "admin_notes": ""}, expected_status=400)

# 25. Admin Rejection With Mandatory Reason
test_api("Admin Reject With Reason Provided", "PATCH", f"/api/v1/admin/claims/{c2_id}", headers=admin_headers, data={"status": "REJECTED", "admin_notes": "Receipt date is illegible, please re-upload"}, expected_status=200)

# 26. Admin Mark Claim as Processed
test_api("Admin Mark Approved Claim as Processed", "PATCH", f"/api/v1/admin/claims/{c1_id}", headers=admin_headers, data={"status": "PROCESSED"}, expected_status=200)

# 27. Admin List Employees Directory
emp_dir = test_api("Admin Employees Directory", "GET", "/api/v1/admin/employees?page=1&per_page=20", headers=admin_headers, expected_status=200)
target_emp_id = me_res["id"]

# 28. Admin Get Specific Employee Details and Claim History
test_api("Admin Get Employee Profile & History", "GET", f"/api/v1/admin/employees/{target_emp_id}", headers=admin_headers, expected_status=200)

print("=" * 65)
score = (passed_tests / total_tests) * 100
print(f"API SCORE: {score:.0f}/100 ({passed_tests}/{total_tests} Tests Passed)")
print(f"TOTAL WARNINGS: {warnings_count}")
print("=" * 65)

if passed_tests == total_tests and warnings_count == 0:
    print(">>> 100/100 VERIFIED: All APIs are operational with 0 warnings! <<<")
    sys.exit(0)
else:
    sys.exit(1)
