# Document Checklist & File Upload System

## Overview

The document checklist and file upload system ensures that all required documents are collected before claim submission. The system dynamically shows required documents based on the payer name and specialty selected in the claims form.

## Features

### 1. Dynamic Document Checklist
- **Trigger**: Appears when both `payer_name` and `specialty` are selected
- **Data Source**: `document_checklist` collection in Firestore
- **Fallback**: Default checklist if no specific checklist is found
- **Validation**: Prevents claim submission until all required documents are checked

### 2. File Upload System
- **Storage**: Firebase Storage with organized folder structure
- **Path Structure**: `IP_Claims/{hospital_id}/{claim_id}/{document_type}/{filename}`
- **Supported Formats**: PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, XLSX
- **Security**: Hospital-based access control

### 3. Document Management
- **Viewing**: Download and view uploaded documents
- **Deletion**: Remove documents if needed
- **Tracking**: Complete audit trail of document uploads

## API Endpoints

### Checklist Management
- `GET /api/v1/checklist/get-checklist?payer_name={name}&specialty={specialty}`
- `POST /api/v1/checklist/create-checklist` (Admin only)
- `GET /api/v1/checklist/list-checklists`

### Document Management
- `POST /api/v1/documents/upload`
- `GET /api/v1/documents/get-claim-documents/{claim_id}`
- `DELETE /api/v1/documents/delete-document/{document_id}`
- `GET /api/v1/documents/download/{document_id}`

## Database Structure

### Document Checklist Collection
```json
{
  "payer_name": "Health Insurance Corp",
  "specialty": "Cardiology",
  "documents": [
    {
      "id": "discharge_summary",
      "name": "Discharge Summary",
      "required": true,
      "description": "Complete discharge summary from the hospital"
    }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Documents Collection
```json
{
  "document_id": "doc_12345678",
  "claim_id": "claim_12345678",
  "document_type": "discharge_summary",
  "document_name": "Discharge Summary",
  "original_filename": "discharge.pdf",
  "storage_path": "IP_Claims/hospital_123/claim_123/discharge_summary/unique_filename.pdf",
  "download_url": "https://storage.googleapis.com/...",
  "file_size": 1024000,
  "file_type": "application/pdf",
  "uploaded_by": "user_id",
  "hospital_id": "hospital_123",
  "uploaded_at": "timestamp",
  "status": "uploaded"
}
```

## Setup Instructions

### 1. Firebase Storage Configuration
Add to your `.env` file:
```
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### 2. Create Sample Checklist Data
Run the sample data script:
```bash
python sample_checklist_data.py
```

### 3. Frontend Integration
The `DocumentChecklist` component is automatically integrated into the claims form and appears when both payer name and specialty are selected.

## User Workflow

1. **Fill Claims Form**: User enters patient and claim details
2. **Select Payer & Specialty**: When both are selected, document checklist appears
3. **Review Requirements**: System shows required and optional documents
4. **Upload Documents**: User uploads documents for each checklist item
5. **Check Items**: User checks off completed items
6. **Submit Claim**: Submit button is enabled only when all required documents are checked

## File Storage Structure

```
IP_Claims/
├── hospital_123/
│   ├── claim_abc123/
│   │   ├── discharge_summary/
│   │   │   └── unique_filename.pdf
│   │   ├── medical_records/
│   │   │   └── unique_filename.pdf
│   │   └── bill_receipt/
│   │       └── unique_filename.pdf
│   └── claim_def456/
│       └── ...
└── hospital_456/
    └── ...
```

## Security Features

- **Hospital Isolation**: Each hospital can only access their own documents
- **Role-Based Access**: Only authorized roles can upload/manage documents
- **File Type Validation**: Only allowed file types can be uploaded
- **Size Limits**: File size validation (configurable)

## Error Handling

- **Missing Checklist**: Shows default checklist if no specific one found
- **Upload Failures**: Clear error messages for upload issues
- **Access Denied**: Proper error handling for unauthorized access
- **File Validation**: Client and server-side file type validation

## Future Enhancements

- **Document Preview**: In-browser document preview
- **Bulk Upload**: Multiple file upload at once
- **Document Templates**: Pre-defined document templates
- **OCR Integration**: Automatic text extraction from documents
- **Digital Signatures**: Document signing capabilities
