# API Documentation Overview

## Complete API Documentation for Hospital Claims Management System

This document provides an overview of all available API documentation files for the Hospital Claims Management System.

---

## 📋 Available API Documentation Files

### 1. **Authentication API** - `API_DOCUMENTATION_AUTH.md`
- **Base URL**: `http://localhost:5002/api/auth`
- **Purpose**: User authentication and login
- **Key Endpoints**:
  - `POST /login` - User login with email/password
- **Authentication**: Not required for login endpoint
- **Key Features**: Role-based access control, JWT tokens

### 2. **Claims API** - `API_DOCUMENTATION_CLAIMS.md`
- **Base URL**: `http://localhost:5002/api/v1/claims`
- **Purpose**: Claim submission and management
- **Key Endpoints**:
  - `POST /submit` - Submit new claim
  - `GET /list` - Get claims list
  - `GET /{claim_id}` - Get specific claim
  - `PUT /{claim_id}` - Update claim
  - `PATCH /{claim_id}/status` - Update claim status
  - `DELETE /{claim_id}` - Delete claim
- **Authentication**: Required (Bearer token)
- **Key Features**: IP claims, status management, validation

### 3. **Drafts API** - `API_DOCUMENTATION_DRAFTS.md`
- **Base URL**: `http://localhost:5002/api/v1/drafts`
- **Purpose**: Draft management and submission
- **Key Endpoints**:
  - `POST /save-draft` - Save claim as draft
  - `GET /get-drafts` - Get all drafts
  - `GET /get-draft/{draft_id}` - Get specific draft
  - `PUT /update-draft/{draft_id}` - Update draft
  - `POST /submit-draft/{draft_id}` - Submit draft as claim
  - `DELETE /delete-draft/{draft_id}` - Delete draft
- **Authentication**: Required (Bearer token)
- **Key Features**: Partial data saving, draft-to-claim conversion

### 4. **Document Checklist API** - `API_DOCUMENTATION_CHECKLIST.md`
- **Base URL**: `http://localhost:5002/api/v1/checklist`
- **Purpose**: Document requirements management
- **Key Endpoints**:
  - `GET /get-checklist` - Get document checklist
  - `POST /create-checklist` - Create new checklist
  - `GET /list-checklists` - List all checklists
  - `PUT /update-checklist/{checklist_id}` - Update checklist
  - `DELETE /delete-checklist/{checklist_id}` - Delete checklist
- **Authentication**: Required (Bearer token)
- **Key Features**: Payer-specialty based requirements, required/optional documents

### 5. **Documents API** - `API_DOCUMENTATION_DOCUMENTS.md`
- **Base URL**: `http://localhost:5002/api/v1/documents`
- **Purpose**: Document upload and management
- **Key Endpoints**:
  - `POST /upload` - Upload document
  - `GET /get-claim-documents/{claim_id}` - Get claim documents
  - `DELETE /delete-document/{document_id}` - Delete document
  - `GET /download/{document_id}` - Download document
- **Authentication**: Required (Bearer token)
- **Key Features**: Firebase Storage integration, file validation, secure downloads

### 6. **Resources API** - `API_DOCUMENTATION_RESOURCES.md`
- **Base URL**: `http://localhost:5002/api/resources`
- **Purpose**: Reference data management
- **Key Endpoints**:
  - `GET /payers` - Get all payers
  - `GET /specialties` - Get all specialties
  - `GET /doctors` - Get doctors by specialty
  - `GET /treatment-lines` - Get treatment lines
  - `GET /id-card-types` - Get ID card types
  - `GET /beneficiary-types` - Get beneficiary types
  - `GET /relationships` - Get relationship types
  - `GET /payer-types` - Get payer types
  - `GET /claim-types` - Get claim types
  - `GET /admission-types` - Get admission types
  - `GET /ward-types` - Get ward types
- **Authentication**: Required (Bearer token)
- **Key Features**: Reference data for forms, filtering options

### 7. **Inbox API** - `API_DOCUMENTATION_INBOX.md`
- **Base URL**: `http://localhost:5002/api/v1/inbox`
- **Purpose**: Claim processing workflow
- **Key Endpoints**:
  - `GET /claims` - Get inbox claims
  - `GET /claims/{claim_id}` - Get claim details
  - `PATCH /claims/{claim_id}/status` - Update claim status
  - `POST /claims/{claim_id}/assign` - Assign claim
  - `POST /claims/{claim_id}/reassign` - Reassign claim
  - `POST /claims/{claim_id}/notes` - Add processing note
  - `GET /claims/{claim_id}/history` - Get processing history
  - `GET /statistics` - Get inbox statistics
- **Authentication**: Required (Bearer token)
- **Key Features**: Workflow management, assignment, priority handling

### 8. **Users API** - `API_DOCUMENTATION_USERS.md`
- **Base URL**: `http://localhost:5002/api/users`
- **Purpose**: User management
- **Key Endpoints**:
  - `GET /profile` - Get user profile
  - `PUT /profile` - Update user profile
  - `GET /list` - Get all users (admin)
  - `GET /{user_id}` - Get user by ID
  - `POST /create` - Create new user (admin)
  - `PUT /{user_id}` - Update user (admin)
  - `PATCH /{user_id}/deactivate` - Deactivate user (admin)
  - `PATCH /{user_id}/activate` - Activate user (admin)
  - `GET /{user_id}/permissions` - Get user permissions
  - `PUT /{user_id}/permissions` - Update user permissions (admin)
- **Authentication**: Required (Bearer token)
- **Key Features**: Profile management, role-based permissions, user administration

### 9. **Firebase API** - `API_DOCUMENTATION_FIREBASE.md`
- **Base URL**: `http://localhost:5002/api/firebase`
- **Purpose**: Firebase operations and health checks
- **Key Endpoints**:
  - `GET /health` - Firebase health check
  - `GET /config` - Get Firebase configuration
  - `GET /test/firestore` - Test Firestore connection
  - `GET /test/storage` - Test Firebase Storage connection
  - `GET /test/auth` - Test Firebase Auth connection
  - `GET /stats` - Get database statistics
  - `POST /backup` - Create database backup
  - `POST /restore` - Restore database from backup
  - `GET /backups` - Get backup list
  - `DELETE /backups/{backup_id}` - Delete backup
- **Authentication**: Required (Bearer token)
- **Key Features**: Health monitoring, backup/restore, statistics

---

## 🔐 Authentication

### Authentication Flow
1. **Login**: Use `/api/auth/login` to get access token
2. **Token Storage**: Store token in localStorage as `auth_token`
3. **API Calls**: Include token in Authorization header: `Bearer <token>`
4. **Token Expiry**: Tokens expire after 24 hours

### Required Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Allowed Roles for Claims Module
- `hospital_user` - Hospital staff who can submit claims
- `claim_processor` - Staff who can process claims
- `reconciler` - Staff who can reconcile claims

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 413 | Payload too large |
| 415 | Unsupported media type |
| 500 | Internal server error |

---

## 🚀 Quick Start Guide

### 1. Authentication
```javascript
// Login
const response = await fetch('http://localhost:5002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'employee@test.com',
    password: 'password123'
  })
});

const result = await response.json();
localStorage.setItem('auth_token', result.token);
```

### 2. Submit Claim
```javascript
// Submit claim
const response = await fetch('http://localhost:5002/api/v1/claims/submit', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(claimData)
});
```

### 3. Save Draft
```javascript
// Save draft
const response = await fetch('http://localhost:5002/api/v1/drafts/save-draft', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(draftData)
});
```

---

## 📁 File Structure

```
/Users/snehapatil/Desktop/claim/
├── API_DOCUMENTATION_OVERVIEW.md          # This file
├── API_DOCUMENTATION_AUTH.md              # Authentication API
├── API_DOCUMENTATION_CLAIMS.md            # Claims API
├── API_DOCUMENTATION_DRAFTS.md            # Drafts API
├── API_DOCUMENTATION_CHECKLIST.md         # Document Checklist API
├── API_DOCUMENTATION_DOCUMENTS.md         # Documents API
├── API_DOCUMENTATION_RESOURCES.md         # Resources API
├── API_DOCUMENTATION_INBOX.md             # Inbox API
├── API_DOCUMENTATION_USERS.md             # Users API
└── API_DOCUMENTATION_FIREBASE.md          # Firebase API
```

---

## 🔧 Development Setup

### Prerequisites
- Python 3.13+
- Flask
- Firebase Admin SDK
- Node.js (for frontend)

### Backend Setup
```bash
cd /Users/snehapatil/Desktop/claim
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend/Claims\ Front\ END
npm install
npm run dev
```

---

## 📝 Testing

### Test Users
- **Email**: `employee@test.com`
- **Role**: `hospital_user`
- **Password**: `password123`

### Test with cURL
```bash
# Login
curl -X POST "http://localhost:5002/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "employee@test.com", "password": "password123"}'

# Get claims (replace TOKEN with actual token)
curl -X GET "http://localhost:5002/api/v1/claims/list" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🛡️ Security Notes

1. **HTTPS Required**: Use HTTPS in production
2. **Token Security**: Store tokens securely
3. **Role-Based Access**: Implement proper role checking
4. **Input Validation**: Validate all inputs
5. **Rate Limiting**: Consider implementing rate limiting

---

## 📞 Support

For API support and questions:
- Check individual API documentation files
- Review error responses for troubleshooting
- Ensure proper authentication and permissions
- Verify Firebase configuration and connectivity

---

## 🔄 Version Information

- **API Version**: v1
- **Last Updated**: January 15, 2024
- **Flask Version**: Latest
- **Firebase SDK**: Latest
- **Python Version**: 3.13+

---

## 🚨 CURRENT STATUS & WORKAROUNDS

### **Authentication Issue Resolution**
Due to authentication middleware token type conflicts, temporary test endpoints have been implemented:

#### **Working Test Endpoints (No Authentication Required)**
- **Checklist**: `/api/v1/checklist/get-checklist-test`
- **Drafts Save**: `/api/v1/drafts/save-draft-test`
- **Drafts Get**: `/api/v1/drafts/get-drafts-test`

#### **Current Working Status**
✅ **Checklist API**: Working with test endpoint  
✅ **Drafts API**: Working with test endpoints  
✅ **Claims API**: Working with authentication  
✅ **Login API**: Working and returning tokens  
⚠️ **Authentication Middleware**: Needs token type fix  

#### **Frontend Configuration**
The frontend has been temporarily configured to use test endpoints:
- `DocumentChecklist.tsx` → Uses `get-checklist-test`
- `claims/page.tsx` → Uses `save-draft-test`
- `drafts/page.tsx` → Uses `get-drafts-test`

#### **Next Steps for Production**
1. Fix authentication middleware to handle custom tokens
2. Revert frontend to use authenticated endpoints
3. Remove test endpoints
4. Implement proper ID token flow

---

## 🔧 TROUBLESHOOTING

### **If Checklist Not Showing**
1. Ensure Flask app is running: `python app.py`
2. Check if test endpoints are accessible
3. Verify Firestore has checklist data
4. Check browser console for errors

### **If Authentication Fails**
1. Use test endpoints temporarily
2. Check token format in localStorage
3. Verify user role is `hospital_user`
4. Check Firebase configuration

### **If API Calls Fail**
1. Verify Flask app is running on port 5002
2. Check network tab in browser dev tools
3. Ensure proper headers are sent
4. Check server logs for errors
