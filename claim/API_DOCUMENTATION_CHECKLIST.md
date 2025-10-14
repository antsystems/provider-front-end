# Document Checklist API Documentation

## Overview
Document Checklist API provides endpoints for managing document requirements based on payer and specialty combinations in the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/v1/checklist`

**Authentication**: Required (Bearer token)

---

## Endpoints

### 1. Get Document Checklist
**GET** `/get-checklist`

**Purpose**: Get document requirements for a specific payer and specialty combination

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `payer_name` (string, required): Name of the payer (e.g., "CGHS", "Health Insurance Corp")
- `specialty` (string, required): Medical specialty (e.g., "Cardiology", "Orthopedics")

**Example Request**:
```
GET /api/v1/checklist/get-checklist?payer_name=CGHS&specialty=Cardiology
```

**Success Response (200)**:
```json
{
  "success": true,
  "checklist": [
    {
      "id": "doc_001",
      "name": "Discharge Summary",
      "type": "required",
      "description": "Complete discharge summary with diagnosis and treatment details",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 5
    },
    {
      "id": "doc_002", 
      "name": "Lab Reports",
      "type": "required",
      "description": "All relevant laboratory test reports",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 10
    },
    {
      "id": "doc_003",
      "name": "Prescription",
      "type": "optional",
      "description": "Doctor's prescription for medications",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 2
    }
  ],
  "payer_name": "CGHS",
  "specialty": "Cardiology",
  "total_documents": 3,
  "required_documents": 2,
  "optional_documents": 1
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "payer_name and specialty are required"
}
```

**404 - Not Found**:
```json
{
  "success": false,
  "error": "No specific checklist found for CGHS - Cardiology",
  "message": "Please contact your administrator to set up document requirements"
}
```

**401 - Unauthorized**:
```json
{
  "error": "No token provided"
}
```

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### 2. Create New Checklist
**POST** `/create-checklist`

**Purpose**: Create a new document checklist for a payer-specialty combination

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "payer_name": "string",
  "specialty": "string",
  "documents": [
    {
      "name": "string",
      "type": "required|optional",
      "description": "string",
      "file_types": ["string"],
      "max_size_mb": "number"
    }
  ]
}
```

**Request Body Example**:
```json
{
  "payer_name": "CGHS",
  "specialty": "Neurology",
  "documents": [
    {
      "name": "MRI Report",
      "type": "required",
      "description": "Magnetic Resonance Imaging report",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 10
    },
    {
      "name": "CT Scan",
      "type": "required", 
      "description": "Computed Tomography scan report",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 8
    },
    {
      "name": "Doctor's Notes",
      "type": "optional",
      "description": "Additional doctor's notes and observations",
      "file_types": ["pdf"],
      "max_size_mb": 3
    }
  ]
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Checklist created successfully",
  "checklist_id": "checklist_12345678",
  "payer_name": "CGHS",
  "specialty": "Neurology",
  "total_documents": 3
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "payer_name, specialty, and documents are required"
}
```

**409 - Conflict**:
```json
{
  "success": false,
  "error": "Checklist already exists for CGHS - Neurology"
}
```

---

### 3. List All Checklists
**GET** `/list-checklists`

**Purpose**: Get all available document checklists

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `payer_name` (optional): Filter by payer name
- `specialty` (optional): Filter by specialty
- `limit` (optional): Number of results (default: 50)

**Example Request**:
```
GET /api/v1/checklist/list-checklists?payer_name=CGHS&limit=10
```

**Success Response (200)**:
```json
{
  "success": true,
  "checklists": [
    {
      "checklist_id": "checklist_12345678",
      "payer_name": "CGHS",
      "specialty": "Cardiology",
      "total_documents": 3,
      "required_documents": 2,
      "optional_documents": 1,
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "checklist_id": "checklist_87654321",
      "payer_name": "CGHS",
      "specialty": "Orthopedics",
      "total_documents": 4,
      "required_documents": 3,
      "optional_documents": 1,
      "status": "active",
      "created_at": "2024-01-14T15:20:00Z",
      "updated_at": "2024-01-14T15:20:00Z"
    }
  ],
  "total": 2
}
```

---

### 4. Update Checklist
**PUT** `/update-checklist/{checklist_id}`

**Purpose**: Update an existing document checklist

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `checklist_id` (string): The ID of the checklist to update

**Request Body**:
```json
{
  "documents": [
    {
      "name": "Updated Document Name",
      "type": "required",
      "description": "Updated description",
      "file_types": ["pdf", "jpg"],
      "max_size_mb": 5
    }
  ],
  "status": "active|inactive"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Checklist updated successfully",
  "checklist_id": "checklist_12345678"
}
```

---

### 5. Delete Checklist
**DELETE** `/delete-checklist/{checklist_id}`

**Purpose**: Delete a document checklist

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `checklist_id` (string): The ID of the checklist to delete

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Checklist deleted successfully"
}
```

---

## Document Types

### Required Documents
Documents that must be uploaded before claim submission:
- `type: "required"`
- Cannot submit claim without these documents
- Frontend should validate completion

### Optional Documents
Documents that can be uploaded but are not mandatory:
- `type: "optional"`
- Can submit claim without these documents
- May improve claim processing speed

---

## File Upload Specifications

### Supported File Types
- **PDF**: `.pdf` - Preferred for documents
- **Images**: `.jpg`, `.jpeg`, `.png` - For scanned documents
- **Maximum Size**: Configurable per document (default: 10MB)

### File Naming Convention
Files are stored in Firebase Storage with the following structure:
```
IP CLAIMS/{claim_id}/{document_name}_{timestamp}.{extension}
```

---

## Frontend Integration

### Get Checklist
```javascript
const getChecklist = async (payerName, specialty) => {
  const response = await fetch(
    `http://localhost:5002/api/v1/checklist/get-checklist?payer_name=${encodeURIComponent(payerName)}&specialty=${encodeURIComponent(specialty)}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    }
  );
  
  const data = await response.json();
  if (data.success) {
    return data.checklist;
  } else {
    throw new Error(data.error);
  }
};
```

### Create Checklist
```javascript
const createChecklist = async (checklistData) => {
  const response = await fetch('http://localhost:5002/api/v1/checklist/create-checklist', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(checklistData)
  });
  
  const result = await response.json();
  return result;
};
```

### List Checklists
```javascript
const listChecklists = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `http://localhost:5002/api/v1/checklist/list-checklists?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    }
  );
  
  const data = await response.json();
  return data.checklists;
};
```

---

## Database Structure

### Checklist Document
```json
{
  "checklist_id": "checklist_12345678",
  "payer_name": "CGHS",
  "specialty": "Cardiology",
  "documents": [
    {
      "id": "doc_001",
      "name": "Discharge Summary",
      "type": "required",
      "description": "Complete discharge summary",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 5
    }
  ],
  "status": "active",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "created_by": "user_id"
}
```

---

## Sample Checklist Data

### CGHS - Cardiology
```json
{
  "payer_name": "CGHS",
  "specialty": "Cardiology",
  "documents": [
    {
      "name": "Discharge Summary",
      "type": "required",
      "description": "Complete discharge summary with cardiac diagnosis",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 5
    },
    {
      "name": "ECG Report",
      "type": "required",
      "description": "Electrocardiogram report",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 3
    },
    {
      "name": "Echocardiogram",
      "type": "required",
      "description": "Echocardiogram report",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 8
    },
    {
      "name": "Lab Reports",
      "type": "optional",
      "description": "Cardiac enzyme and other lab reports",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 10
    }
  ]
}
```

### CGHS - Orthopedics
```json
{
  "payer_name": "CGHS",
  "specialty": "Orthopedics",
  "documents": [
    {
      "name": "Discharge Summary",
      "type": "required",
      "description": "Complete discharge summary with orthopedic diagnosis",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 5
    },
    {
      "name": "X-Ray Reports",
      "type": "required",
      "description": "X-Ray images and reports",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 8
    },
    {
      "name": "MRI/CT Scan",
      "type": "required",
      "description": "Magnetic Resonance Imaging or CT scan reports",
      "file_types": ["pdf", "jpg", "png"],
      "max_size_mb": 10
    },
    {
      "name": "Surgery Notes",
      "type": "optional",
      "description": "Detailed surgery notes and procedure details",
      "file_types": ["pdf"],
      "max_size_mb": 5
    }
  ]
}
```

---

## Error Handling

### Common Error Scenarios
1. **Missing Parameters**: payer_name and specialty are required
2. **Checklist Not Found**: No checklist exists for the combination
3. **Invalid Document Type**: Must be "required" or "optional"
4. **File Type Not Supported**: Only specified file types allowed
5. **File Size Exceeded**: File exceeds maximum size limit

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 409 | Conflict (already exists) |
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
