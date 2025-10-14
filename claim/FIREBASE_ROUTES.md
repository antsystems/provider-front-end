# Firebase Routes

## POST `/api/firebase/verify-token`

**Purpose**: Verify Firebase ID token and get user data

**Mandatory Fields**:
- `token` (string, valid Firebase ID token)

**Request Body**:
```json
{
  "token": "firebase_id_token"
}
```

**Success Response (200)**:
```json
{
  "success": true,
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

**Error Response (400)**:
```json
{
  "error": "ID token is required",
  "success": false
}
```

**Error Response (401)**:
```json
{
  "error": "Invalid token",
  "success": false
}
```
