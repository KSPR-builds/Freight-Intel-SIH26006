import urllib.request
import json

# Test login
data = json.dumps({"email": "admin@freight-intel.com", "password": "admin123", "is_admin_login": False}).encode("utf-8")
req = urllib.request.Request(
    "http://localhost:8000/api/auth/login",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read())
        print("Login SUCCESS:", json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    print("Login FAILED:", e.code, e.read().decode())
