# Authentication Routes

## POST `/api/auth/login`

**Purpose**: User login with email and password

**Mandatory Fields**:
- `email` (string, valid email format)
- `password` (string, minimum 6 characters)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "message": "Hospital user found",
  "user": {
    "uid": "user_id",
    "email": "user@example.com",
    "role": "hospital_user",
    "hospital_id": "hospital_123",
    "hospital_name": "Hospital Name",
    "entity_assignments": {
      "hospitals": [
        {
          "id": "hospital_123",
          "name": "Hospital Name",
          "city": "City",
          "code": "HOSP123"
        }
      ]
    }
  }
}
```

**Error Response (403)**:
```json
{
  "error": "Access denied",
  "message": "Administrators cannot access the claims module",
  "allowed_roles": ["hospital_user", "claim_processor", "reconciler"]
}
```

**Error Response (404)**:
```json
{
  "error": "User not found"
}
```

**Allowed Roles**: `hospital_user`, `claim_processor`, `reconciler`
**Blocked Roles**: `admin`, `super_admin`, `system_admin`, `hospital_admin`, `rm`, `rp`, `employee`
