# Authentication API Documentation

## Overview
Authentication API provides user login, token management, and user verification endpoints for the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/auth`

---

## Endpoints

### 1. User Login
**POST** `/login`

**Purpose**: Authenticate hospital users and return access token

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Request Body Example**:
```json
{
  "email": "employee@test.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "uid": "6OYnwHhLsRepFhTfcZ4DFBlNHux2",
    "email": "employee@test.com",
    "displayName": "Test employee",
    "role": "hospital_user",
    "hospital_id": "",
    "hospital_name": "",
    "entity_assignments": {
      "hospitals": [
        {
          "id": "",
          "name": ""
        }
      ]
    }
  },
  "token": "eyJhbGciOiAiUlMyNTYiLCAidHlwIjogIkpXVCIsICJraWQiOiAiMTNiOThhNDNjODg4MjQyNWQyZTNiYzdhMzNlNTE4ODQyMDIxYTkwYSJ9...",
  "expires_in": 3600
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "error": "Email and password are required"
}
```

**401 - Unauthorized**:
```json
{
  "error": "Invalid credentials"
}
```

**403 - Forbidden**:
```json
{
  "error": "Access denied",
  "message": "Administrators cannot access the claims module",
  "allowed_roles": ["hospital_user", "claim_processor", "reconciler"]
}
```

**404 - Not Found**:
```json
{
  "error": "User not found"
}
```

**500 - Internal Server Error**:
```json
{
  "error": "Login failed",
  "details": "Error message"
}
```

---

## Authentication Flow

### 1. Login Process
1. User provides email and password
2. System validates credentials against Firebase Auth
3. System checks user exists in Firestore
4. System validates user role is allowed for claims module
5. System returns user data and access token

### 2. Allowed Roles
- `hospital_user` - Hospital staff who can submit claims
- `claim_processor` - Staff who can process claims
- `reconciler` - Staff who can reconcile claims

### 3. Blocked Roles
- `admin`
- `super_admin`
- `system_admin`
- `hospital_admin`
- `rm`
- `rp`
- `employee`

### 4. Token Usage
- Store token in localStorage as `auth_token`
- Include in Authorization header: `Bearer <token>`
- Token expires after 24 hours

---

## Frontend Integration

### Login Form
```javascript
const loginData = {
  email: "employee@test.com",
  password: "password123"
};

const response = await fetch('http://localhost:5002/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
});

const result = await response.json();
if (result.success) {
  localStorage.setItem('auth_token', result.token);
  localStorage.setItem('auth_user', JSON.stringify(result.user));
}
```

### Token Validation
```javascript
const token = localStorage.getItem('auth_token');
if (!token) {
  // Redirect to login
  window.location.href = '/login';
}
```

---

## Error Handling

### Common Error Scenarios
1. **Invalid Credentials**: Check email/password
2. **User Not Found**: User doesn't exist in system
3. **Access Denied**: User role not authorized
4. **Token Expired**: Re-login required

### Error Response Format
All error responses follow this format:
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": "Additional error details (optional)"
}
```

---

## Security Notes

1. **Password Security**: Passwords are handled by Firebase Auth
2. **Token Security**: Tokens are JWT format with 24-hour expiry
3. **Role-Based Access**: Only specific roles can access claims module
4. **HTTPS Required**: Use HTTPS in production
5. **Token Storage**: Store tokens securely in localStorage

---

## Testing

### Valid Test Users
```json
{
  "email": "employee@test.com",
  "role": "hospital_user"
}
```

```json
{
  "email": "testmedverve@gmail.com", 
  "role": "hospital_user"
}
```

```json
{
  "email": "shivarajagni4@gmail.com",
  "role": "hospital_user"
}
```

### Test with cURL
```bash
curl -X POST "http://localhost:5002/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@test.com",
    "password": "password123"
  }'
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Login successful |
| 400 | Bad request (missing fields) |
| 401 | Unauthorized (invalid credentials) |
| 403 | Forbidden (role not allowed) |
| 404 | User not found |
| 500 | Internal server error |

---

## Rate Limiting
- No rate limiting implemented
- Consider implementing in production

---

## Dependencies
- Firebase Admin SDK
- Flask
- Python 3.13+
