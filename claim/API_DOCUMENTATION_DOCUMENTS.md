# Documents API Documentation

## Overview
Documents API provides endpoints for uploading, managing, and downloading claim-related documents in the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/v1/documents`

**Authentication**: Required (Bearer token)

---

## Endpoints

### 1. Upload Document
**POST** `/upload`

**Purpose**: Upload a document for a specific claim

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**:
- `file` (file, required): The document file to upload
- `claim_id` (string, required): The ID of the claim
- `document_name` (string, required): Name/type of the document
- `document_type` (string, optional): Type of document (required/optional)

**Request Example**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('claim_id', 'claim_12345678');
formData.append('document_name', 'Discharge Summary');
formData.append('document_type', 'required');
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "document_id": "doc_12345678",
    "claim_id": "claim_12345678",
    "document_name": "Discharge Summary",
    "document_type": "required",
    "file_name": "discharge_summary_20240115.pdf",
    "file_size": 2048576,
    "file_type": "application/pdf",
    "upload_date": "2024-01-15T10:30:00Z",
    "uploaded_by": "user_123",
    "storage_path": "IP CLAIMS/claim_12345678/discharge_summary_20240115.pdf",
    "download_url": "https://storage.googleapis.com/bucket/IP%20CLAIMS/claim_12345678/discharge_summary_20240115.pdf"
  }
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Missing required fields: file, claim_id, document_name"
}
```

**413 - Payload Too Large**:
```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 10MB"
}
```

**415 - Unsupported Media Type**:
```json
{
  "success": false,
  "error": "File type not supported. Allowed types: pdf, jpg, jpeg, png"
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
  "error": "Upload failed"
}
```

---

### 2. Get Claim Documents
**GET** `/get-claim-documents/{claim_id}`

**Purpose**: Get all documents associated with a specific claim

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `claim_id` (string): The ID of the claim

**Success Response (200)**:
```json
{
  "success": true,
  "claim_id": "claim_12345678",
  "documents": [
    {
      "document_id": "doc_12345678",
      "document_name": "Discharge Summary",
      "document_type": "required",
      "file_name": "discharge_summary_20240115.pdf",
      "file_size": 2048576,
      "file_type": "application/pdf",
      "upload_date": "2024-01-15T10:30:00Z",
      "uploaded_by": "user_123",
      "storage_path": "IP CLAIMS/claim_12345678/discharge_summary_20240115.pdf",
      "download_url": "https://storage.googleapis.com/bucket/IP%20CLAIMS/claim_12345678/discharge_summary_20240115.pdf"
    },
    {
      "document_id": "doc_87654321",
      "document_name": "Lab Reports",
      "document_type": "optional",
      "file_name": "lab_reports_20240115.pdf",
      "file_size": 1536000,
      "file_type": "application/pdf",
      "upload_date": "2024-01-15T11:00:00Z",
      "uploaded_by": "user_123",
      "storage_path": "IP CLAIMS/claim_12345678/lab_reports_20240115.pdf",
      "download_url": "https://storage.googleapis.com/bucket/IP%20CLAIMS/claim_12345678/lab_reports_20240115.pdf"
    }
  ],
  "total_documents": 2,
  "required_documents": 1,
  "optional_documents": 1
}
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "success": false,
  "error": "Claim not found"
}
```

**403 - Forbidden**:
```json
{
  "success": false,
  "error": "Access denied"
}
```

---

### 3. Delete Document
**DELETE** `/delete-document/{document_id}`

**Purpose**: Delete a specific document

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `document_id` (string): The ID of the document to delete

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "document_id": "doc_12345678"
}
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "success": false,
  "error": "Document not found"
}
```

**403 - Forbidden**:
```json
{
  "success": false,
  "error": "Access denied"
}
```

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Failed to delete document"
}
```

---

### 4. Download Document
**GET** `/download/{document_id}`

**Purpose**: Download a specific document

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `document_id` (string): The ID of the document to download

**Success Response (200)**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="discharge_summary_20240115.pdf"
Content-Length: 2048576

[Binary file content]
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "success": false,
  "error": "Document not found"
}
```

**403 - Forbidden**:
```json
{
  "success": false,
  "error": "Access denied"
}
```

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Download failed"
}
```

---

## File Upload Specifications

### Supported File Types
- **PDF**: `.pdf` - Preferred for documents
- **Images**: `.jpg`, `.jpeg`, `.png` - For scanned documents

### File Size Limits
- **Maximum Size**: 10MB per file
- **Minimum Size**: 1KB

### File Naming Convention
Files are automatically renamed with timestamp to avoid conflicts:
```
{original_name}_{timestamp}.{extension}
```

### Storage Structure
Documents are stored in Firebase Storage with the following structure:
```
IP CLAIMS/
  └── {claim_id}/
      ├── discharge_summary_20240115.pdf
      ├── lab_reports_20240115.pdf
      └── prescription_20240115.jpg
```

---

## Frontend Integration

### Upload Document
```javascript
const uploadDocument = async (file, claimId, documentName, documentType = 'required') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('claim_id', claimId);
  formData.append('document_name', documentName);
  formData.append('document_type', documentType);

  const response = await fetch('http://localhost:5002/api/v1/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: formData
  });

  const result = await response.json();
  if (result.success) {
    console.log('Document uploaded:', result.document);
    return result.document;
  } else {
    throw new Error(result.error);
  }
};
```

### Get Claim Documents
```javascript
const getClaimDocuments = async (claimId) => {
  const response = await fetch(`http://localhost:5002/api/v1/documents/get-claim-documents/${claimId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });

  const data = await response.json();
  if (data.success) {
    return data.documents;
  } else {
    throw new Error(data.error);
  }
};
```

### Delete Document
```javascript
const deleteDocument = async (documentId) => {
  const response = await fetch(`http://localhost:5002/api/v1/documents/delete-document/${documentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });

  const result = await response.json();
  if (result.success) {
    console.log('Document deleted:', result.document_id);
  } else {
    throw new Error(result.error);
  }
};
```

### Download Document
```javascript
const downloadDocument = async (documentId, fileName) => {
  const response = await fetch(`http://localhost:5002/api/v1/documents/download/${documentId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    throw new Error('Download failed');
  }
};
```

---

## Document Management Flow

### 1. Document Upload Process
1. User selects file from device
2. Frontend validates file type and size
3. File is uploaded to Firebase Storage
4. Document metadata is stored in Firestore
5. Download URL is generated and returned

### 2. Document Retrieval Process
1. User requests documents for a claim
2. System queries Firestore for document metadata
3. Download URLs are generated for each document
4. Documents are returned with metadata

### 3. Document Deletion Process
1. User requests document deletion
2. System verifies user permissions
3. Document is deleted from Firebase Storage
4. Metadata is removed from Firestore

---

## Database Structure

### Document Metadata
```json
{
  "document_id": "doc_12345678",
  "claim_id": "claim_12345678",
  "document_name": "Discharge Summary",
  "document_type": "required",
  "file_name": "discharge_summary_20240115.pdf",
  "file_size": 2048576,
  "file_type": "application/pdf",
  "upload_date": "2024-01-15T10:30:00Z",
  "uploaded_by": "user_123",
  "uploaded_by_email": "user@example.com",
  "hospital_id": "hospital_123",
  "storage_path": "IP CLAIMS/claim_12345678/discharge_summary_20240115.pdf",
  "download_url": "https://storage.googleapis.com/bucket/IP%20CLAIMS/claim_12345678/discharge_summary_20240115.pdf"
}
```

---

## Security Considerations

### Access Control
- Only authenticated users can upload/download documents
- Users can only access documents from their hospital
- Document access is tied to claim ownership

### File Validation
- File type validation on upload
- File size limits enforced
- Malware scanning (recommended for production)

### Storage Security
- Firebase Storage provides built-in security
- Signed URLs for secure downloads
- Access control through Firebase rules

---

## Error Handling

### Common Error Scenarios
1. **File Too Large**: Exceeds 10MB limit
2. **Invalid File Type**: Not PDF, JPG, JPEG, or PNG
3. **Missing Required Fields**: claim_id, document_name required
4. **Storage Full**: Firebase Storage quota exceeded
5. **Network Issues**: Upload/download failures

### Error Response Format
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details (optional)"
}
```

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
| 413 | Payload too large |
| 415 | Unsupported media type |
| 500 | Internal server error |

---

## Rate Limiting
- No rate limiting implemented
- Consider implementing in production

---

## Dependencies
- Firebase Admin SDK
- Firebase Storage
- Flask
- Python 3.13+
