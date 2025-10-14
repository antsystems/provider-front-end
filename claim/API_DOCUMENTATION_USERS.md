# Users API Documentation

## Overview
Users API provides endpoints for managing user accounts, profiles, and user-related operations in the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/users`

**Authentication**: Required (Bearer token)

---

## Endpoints

### 1. Get User Profile
**GET** `/profile`

**Purpose**: Get current user's profile information

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "user": {
    "uid": "user_123",
    "email": "employee@test.com",
    "displayName": "John Doe",
    "role": "hospital_user",
    "hospital_id": "hospital_123",
    "hospital_name": "Test Hospital",
    "entity_assignments": {
      "hospitals": [
        {
          "id": "hospital_123",
          "name": "Test Hospital"
        }
      ]
    },
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+91-9876543210",
      "department": "Claims",
      "designation": "Claims Executive",
      "employee_id": "EMP001",
      "joining_date": "2024-01-01",
      "status": "active"
    },
    "permissions": [
      "claims:read",
      "claims:write",
      "drafts:read",
      "drafts:write"
    ],
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:

**401 - Unauthorized**:
```json
{
  "error": "No token provided"
}
```

**404 - Not Found**:
```json
{
  "error": "User not found"
}
```

---

### 2. Update User Profile
**PUT** `/profile`

**Purpose**: Update current user's profile information

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "displayName": "John Smith",
  "profile": {
    "first_name": "John",
    "last_name": "Smith",
    "phone": "+91-9876543211",
    "department": "Claims",
    "designation": "Senior Claims Executive"
  }
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "uid": "user_123",
    "email": "employee@test.com",
    "displayName": "John Smith",
    "role": "hospital_user",
    "hospital_id": "hospital_123",
    "hospital_name": "Test Hospital",
    "profile": {
      "first_name": "John",
      "last_name": "Smith",
      "phone": "+91-9876543211",
      "department": "Claims",
      "designation": "Senior Claims Executive",
      "employee_id": "EMP001",
      "joining_date": "2024-01-01",
      "status": "active"
    },
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Invalid profile data"
}
```

**401 - Unauthorized**:
```json
{
  "error": "No token provided"
}
```

---

### 3. Get All Users
**GET** `/list`

**Purpose**: Get list of all users (admin only)

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `hospital_id` (optional): Filter users by hospital
- `role` (optional): Filter users by role
- `status` (optional): Filter users by status
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Example Request**:
```
GET /api/users/list?hospital_id=hospital_123&role=hospital_user&limit=20
```

**Success Response (200)**:
```json
{
  "success": true,
  "users": [
    {
      "uid": "user_123",
      "email": "employee@test.com",
      "displayName": "John Doe",
      "role": "hospital_user",
      "hospital_id": "hospital_123",
      "hospital_name": "Test Hospital",
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+91-9876543210",
        "department": "Claims",
        "designation": "Claims Executive",
        "employee_id": "EMP001",
        "status": "active"
      },
      "last_login": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "uid": "user_456",
      "email": "processor@test.com",
      "displayName": "Jane Smith",
      "role": "claim_processor",
      "hospital_id": "hospital_123",
      "hospital_name": "Test Hospital",
      "profile": {
        "first_name": "Jane",
        "last_name": "Smith",
        "phone": "+91-9876543212",
        "department": "Processing",
        "designation": "Claims Processor",
        "employee_id": "EMP002",
        "status": "active"
      },
      "last_login": "2024-01-15T09:15:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T09:15:00Z"
    }
  ],
  "total": 2,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

**Error Responses**:

**403 - Forbidden**:
```json
{
  "error": "Access denied. Admin role required"
}
```

---

### 4. Get User by ID
**GET** `/{user_id}`

**Purpose**: Get specific user information by user ID

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `user_id` (string): The ID of the user

**Success Response (200)**:
```json
{
  "success": true,
  "user": {
    "uid": "user_123",
    "email": "employee@test.com",
    "displayName": "John Doe",
    "role": "hospital_user",
    "hospital_id": "hospital_123",
    "hospital_name": "Test Hospital",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+91-9876543210",
      "department": "Claims",
      "designation": "Claims Executive",
      "employee_id": "EMP001",
      "joining_date": "2024-01-01",
      "status": "active"
    },
    "permissions": [
      "claims:read",
      "claims:write",
      "drafts:read",
      "drafts:write"
    ],
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "error": "User not found"
}
```

**403 - Forbidden**:
```json
{
  "error": "Access denied"
}
```

---

### 5. Create New User
**POST** `/create`

**Purpose**: Create a new user account (admin only)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "newuser@test.com",
  "displayName": "New User",
  "role": "hospital_user",
  "hospital_id": "hospital_123",
  "profile": {
    "first_name": "New",
    "last_name": "User",
    "phone": "+91-9876543213",
    "department": "Claims",
    "designation": "Claims Executive",
    "employee_id": "EMP003"
  }
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "uid": "user_789",
    "email": "newuser@test.com",
    "displayName": "New User",
    "role": "hospital_user",
    "hospital_id": "hospital_123",
    "hospital_name": "Test Hospital",
    "profile": {
      "first_name": "New",
      "last_name": "User",
      "phone": "+91-9876543213",
      "department": "Claims",
      "designation": "Claims Executive",
      "employee_id": "EMP003",
      "status": "active"
    },
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Missing required fields: email, displayName, role"
}
```

**409 - Conflict**:
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

**403 - Forbidden**:
```json
{
  "error": "Access denied. Admin role required"
}
```

---

### 6. Update User
**PUT** `/{user_id}`

**Purpose**: Update user information (admin only)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `user_id` (string): The ID of the user to update

**Request Body**:
```json
{
  "displayName": "Updated Name",
  "role": "claim_processor",
  "profile": {
    "department": "Processing",
    "designation": "Senior Claims Processor",
    "status": "active"
  }
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "uid": "user_123",
    "email": "employee@test.com",
    "displayName": "Updated Name",
    "role": "claim_processor",
    "hospital_id": "hospital_123",
    "hospital_name": "Test Hospital",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+91-9876543210",
      "department": "Processing",
      "designation": "Senior Claims Processor",
      "employee_id": "EMP001",
      "status": "active"
    },
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

---

### 7. Deactivate User
**PATCH** `/{user_id}/deactivate`

**Purpose**: Deactivate a user account (admin only)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `user_id` (string): The ID of the user to deactivate

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "user_id": "user_123"
}
```

---

### 8. Activate User
**PATCH** `/{user_id}/activate`

**Purpose**: Activate a user account (admin only)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `user_id` (string): The ID of the user to activate

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User activated successfully",
  "user_id": "user_123"
}
```

---

### 9. Get User Permissions
**GET** `/{user_id}/permissions`

**Purpose**: Get user's permissions and access rights

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `user_id` (string): The ID of the user

**Success Response (200)**:
```json
{
  "success": true,
  "user_id": "user_123",
  "permissions": [
    "claims:read",
    "claims:write",
    "drafts:read",
    "drafts:write",
    "documents:read",
    "documents:write"
  ],
  "role": "hospital_user",
  "role_permissions": {
    "hospital_user": [
      "claims:read",
      "claims:write",
      "drafts:read",
      "drafts:write",
      "documents:read",
      "documents:write"
    ]
  }
}
```

---

### 10. Update User Permissions
**PUT** `/{user_id}/permissions`

**Purpose**: Update user's permissions (admin only)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `user_id` (string): The ID of the user

**Request Body**:
```json
{
  "permissions": [
    "claims:read",
    "claims:write",
    "drafts:read",
    "drafts:write",
    "documents:read",
    "documents:write",
    "inbox:read"
  ]
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Permissions updated successfully",
  "user_id": "user_123",
  "permissions": [
    "claims:read",
    "claims:write",
    "drafts:read",
    "drafts:write",
    "documents:read",
    "documents:write",
    "inbox:read"
  ]
}
```

---

## User Roles and Permissions

### Available Roles
- **hospital_user**: Hospital staff who can submit claims
- **claim_processor**: Staff who can process claims
- **reconciler**: Staff who can reconcile claims
- **admin**: System administrators
- **super_admin**: Super administrators

### Permission Types
- **claims:read**: Read access to claims
- **claims:write**: Write access to claims
- **drafts:read**: Read access to drafts
- **drafts:write**: Write access to drafts
- **documents:read**: Read access to documents
- **documents:write**: Write access to documents
- **inbox:read**: Read access to inbox
- **inbox:write**: Write access to inbox
- **users:read**: Read access to users
- **users:write**: Write access to users

---

## Frontend Integration

### Get User Profile
```javascript
const getUserProfile = async () => {
  const response = await fetch('http://localhost:5002/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.user;
  } else {
    throw new Error(data.error);
  }
};
```

### Update User Profile
```javascript
const updateUserProfile = async (profileData) => {
  const response = await fetch('http://localhost:5002/api/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Profile updated:', result.user);
  } else {
    throw new Error(result.error);
  }
};
```

### Get All Users
```javascript
const getAllUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:5002/api/users/list?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.users;
  } else {
    throw new Error(data.error);
  }
};
```

### Create New User
```javascript
const createUser = async (userData) => {
  const response = await fetch('http://localhost:5002/api/users/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('User created:', result.user);
  } else {
    throw new Error(result.error);
  }
};
```

---

## Data Structure

### User Object
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "string",
  "hospital_id": "string",
  "hospital_name": "string",
  "entity_assignments": {
    "hospitals": [
      {
        "id": "string",
        "name": "string"
      }
    ]
  },
  "profile": {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "department": "string",
    "designation": "string",
    "employee_id": "string",
    "joining_date": "string",
    "status": "active|inactive"
  },
  "permissions": ["string"],
  "last_login": "timestamp",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## Error Handling

### Common Error Scenarios
1. **Authentication Required**: User must be logged in
2. **Access Denied**: User doesn't have permission
3. **User Not Found**: Invalid user ID
4. **Invalid Data**: Invalid profile or user data
5. **Email Already Exists**: User with email already exists

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
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
