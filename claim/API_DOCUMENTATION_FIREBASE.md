# Firebase API Documentation

## Overview
Firebase API provides endpoints for Firebase-related operations, including configuration, health checks, and Firebase-specific functionality in the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/firebase`

**Authentication**: Required (Bearer token)

---

## Endpoints

### 1. Firebase Health Check
**GET** `/health`

**Purpose**: Check Firebase connection and health status

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Firebase connection is healthy",
  "firebase": {
    "firestore": {
      "status": "connected",
      "database_id": "your-project-id"
    },
    "storage": {
      "status": "connected",
      "bucket": "your-project-id.appspot.com"
    },
    "auth": {
      "status": "connected",
      "project_id": "your-project-id"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Firebase connection failed",
  "details": "Connection timeout"
}
```

---

### 2. Get Firebase Configuration
**GET** `/config`

**Purpose**: Get Firebase configuration information

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "config": {
    "project_id": "your-project-id",
    "database_url": "https://your-project-id.firebaseio.com",
    "storage_bucket": "your-project-id.appspot.com",
    "auth_domain": "your-project-id.firebaseapp.com",
    "api_key": "AIzaSy...",
    "app_id": "1:123456789:web:abcdef123456"
  },
  "services": {
    "firestore": true,
    "storage": true,
    "auth": true,
    "functions": false
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

---

### 3. Test Firestore Connection
**GET** `/test/firestore`

**Purpose**: Test Firestore database connection

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Firestore connection test successful",
  "test_results": {
    "connection": "success",
    "read_test": "success",
    "write_test": "success",
    "response_time_ms": 150
  },
  "collections": [
    "users",
    "claims",
    "checklist",
    "documents"
  ]
}
```

**Error Responses**:

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Firestore connection test failed",
  "details": "Permission denied"
}
```

---

### 4. Test Firebase Storage Connection
**GET** `/test/storage`

**Purpose**: Test Firebase Storage connection

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Firebase Storage connection test successful",
  "test_results": {
    "connection": "success",
    "upload_test": "success",
    "download_test": "success",
    "response_time_ms": 200
  },
  "bucket_info": {
    "name": "your-project-id.appspot.com",
    "location": "us-central1",
    "storage_class": "STANDARD"
  }
}
```

**Error Responses**:

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Firebase Storage connection test failed",
  "details": "Bucket not found"
}
```

---

### 5. Test Firebase Auth Connection
**GET** `/test/auth`

**Purpose**: Test Firebase Authentication connection

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Firebase Auth connection test successful",
  "test_results": {
    "connection": "success",
    "token_verification": "success",
    "user_lookup": "success",
    "response_time_ms": 100
  },
  "auth_info": {
    "project_id": "your-project-id",
    "auth_domain": "your-project-id.firebaseapp.com",
    "enabled_providers": [
      "email",
      "password"
    ]
  }
}
```

**Error Responses**:

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Firebase Auth connection test failed",
  "details": "Invalid service account"
}
```

---

### 6. Get Database Statistics
**GET** `/stats`

**Purpose**: Get Firebase database statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "statistics": {
    "firestore": {
      "collections": 4,
      "total_documents": 1250,
      "storage_size_mb": 15.5,
      "collections_breakdown": {
        "users": 25,
        "claims": 800,
        "checklist": 15,
        "documents": 410
      }
    },
    "storage": {
      "total_files": 410,
      "total_size_mb": 125.8,
      "bucket_usage_percent": 12.5
    },
    "auth": {
      "total_users": 25,
      "active_users": 20,
      "disabled_users": 5
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Failed to retrieve statistics"
}
```

---

### 7. Backup Database
**POST** `/backup`

**Purpose**: Create a backup of the Firestore database

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "backup_name": "daily_backup_20240115",
  "collections": ["users", "claims", "checklist"],
  "include_documents": true
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Backup created successfully",
  "backup": {
    "backup_id": "backup_12345678",
    "backup_name": "daily_backup_20240115",
    "collections_backed_up": 3,
    "total_documents": 840,
    "backup_size_mb": 12.5,
    "created_at": "2024-01-15T10:30:00Z",
    "storage_location": "gs://your-project-id.appspot.com/backups/daily_backup_20240115"
  }
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Invalid backup configuration"
}
```

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Backup creation failed"
}
```

---

### 8. Restore Database
**POST** `/restore`

**Purpose**: Restore database from a backup

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "backup_id": "backup_12345678",
  "collections": ["users", "claims"],
  "overwrite_existing": false
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Database restored successfully",
  "restore": {
    "restore_id": "restore_87654321",
    "backup_id": "backup_12345678",
    "collections_restored": 2,
    "documents_restored": 825,
    "restored_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Backup not found or invalid"
}
```

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Restore operation failed"
}
```

---

### 9. Get Backup List
**GET** `/backups`

**Purpose**: Get list of available backups

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "backups": [
    {
      "backup_id": "backup_12345678",
      "backup_name": "daily_backup_20240115",
      "collections_backed_up": 3,
      "total_documents": 840,
      "backup_size_mb": 12.5,
      "created_at": "2024-01-15T10:30:00Z",
      "storage_location": "gs://your-project-id.appspot.com/backups/daily_backup_20240115"
    },
    {
      "backup_id": "backup_87654321",
      "backup_name": "weekly_backup_20240114",
      "collections_backed_up": 4,
      "total_documents": 1200,
      "backup_size_mb": 18.2,
      "created_at": "2024-01-14T10:30:00Z",
      "storage_location": "gs://your-project-id.appspot.com/backups/weekly_backup_20240114"
    }
  ],
  "total": 2
}
```

---

### 10. Delete Backup
**DELETE** `/backups/{backup_id}`

**Purpose**: Delete a specific backup

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `backup_id` (string): The ID of the backup to delete

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Backup deleted successfully",
  "backup_id": "backup_12345678"
}
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "success": false,
  "error": "Backup not found"
}
```

---

## Frontend Integration

### Check Firebase Health
```javascript
const checkFirebaseHealth = async () => {
  const response = await fetch('http://localhost:5002/api/firebase/health', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Firebase is healthy:', data.firebase);
    return data.firebase;
  } else {
    throw new Error(data.error);
  }
};
```

### Get Firebase Configuration
```javascript
const getFirebaseConfig = async () => {
  const response = await fetch('http://localhost:5002/api/firebase/config', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.config;
  } else {
    throw new Error(data.error);
  }
};
```

### Test Firestore Connection
```javascript
const testFirestore = async () => {
  const response = await fetch('http://localhost:5002/api/firebase/test/firestore', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Firestore test results:', data.test_results);
    return data.test_results;
  } else {
    throw new Error(data.error);
  }
};
```

### Get Database Statistics
```javascript
const getDatabaseStats = async () => {
  const response = await fetch('http://localhost:5002/api/firebase/stats', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.statistics;
  } else {
    throw new Error(data.error);
  }
};
```

### Create Backup
```javascript
const createBackup = async (backupName, collections = []) => {
  const backupData = {
    backup_name: backupName,
    collections: collections,
    include_documents: true
  };
  
  const response = await fetch('http://localhost:5002/api/firebase/backup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(backupData)
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Backup created:', result.backup);
    return result.backup;
  } else {
    throw new Error(result.error);
  }
};
```

---

## Firebase Services

### Firestore Database
- **Collections**: users, claims, checklist, documents
- **Features**: Real-time updates, offline support, automatic scaling
- **Security**: Firestore security rules

### Firebase Storage
- **Purpose**: File storage for documents and images
- **Features**: Secure file uploads, CDN distribution
- **Security**: Storage security rules

### Firebase Authentication
- **Purpose**: User authentication and authorization
- **Features**: Email/password, phone authentication
- **Security**: JWT tokens, role-based access

---

## Error Handling

### Common Error Scenarios
1. **Connection Failed**: Firebase services unavailable
2. **Permission Denied**: Insufficient permissions
3. **Invalid Configuration**: Firebase config issues
4. **Backup Failed**: Backup creation/restore issues
5. **Authentication Required**: User must be logged in

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Internal server error |

---

## Rate Limiting
- No rate limiting implemented
- Consider implementing in production

---

## Dependencies
- Firebase Admin SDK
- Firebase Storage
- Firebase Auth
- Flask
- Python 3.13+
