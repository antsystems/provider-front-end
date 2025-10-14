# Drafts API Documentation

## Overview
Drafts API provides endpoints for saving, managing, and submitting claim drafts in the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/v1/drafts`

**Authentication**: Required (Bearer token)

---

## Endpoints

### 1. Save Draft
**POST** `/save-draft`

**Purpose**: Save a claim as draft with minimum required fields

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "patient_name": "string",
  "age": "string",
  "age_unit": "string",
  "gender": "string",
  "id_card_type": "string",
  "id_card_number": "string",
  "patient_contact_number": "string",
  "patient_email_id": "string",
  "beneficiary_type": "string",
  "relationship": "string",
  "payer_patient_id": "string",
  "authorization_number": "string",
  "total_authorized_amount": "string",
  "payer_type": "string",
  "payer_name": "string",
  "insurer_name": "string",
  "policy_number": "string",
  "sponsorer_corporate_name": "string",
  "sponsorer_employee_id": "string",
  "sponsorer_employee_name": "string",
  "patient_registration_number": "string",
  "specialty": "string",
  "doctor": "string",
  "treatment_line": "string",
  "claim_type": "string",
  "service_start_date": "string",
  "service_end_date": "string",
  "inpatient_number": "string",
  "admission_type": "string",
  "hospitalization_type": "string",
  "ward_type": "string",
  "final_diagnosis": "string",
  "treatment_done": "string",
  "icd_10_code": "string",
  "pcs_code": "string",
  "bill_number": "string",
  "bill_date": "string",
  "security_deposit": "string",
  "total_bill_amount": "string",
  "patient_discount_amount": "string",
  "amount_paid_by_patient": "string",
  "total_patient_paid_amount": "string",
  "amount_charged_to_payer": "string",
  "mou_discount_amount": "string",
  "claimed_amount": "string",
  "submission_remarks": "string"
}
```

**Minimum Required Field**:
- `patient_name` (string) - Patient name to identify the draft

**Request Body Example**:
```json
{
  "patient_name": "John Doe",
  "age": "35",
  "age_unit": "YRS",
  "gender": "MALE",
  "id_card_type": "AADHAAR",
  "beneficiary_type": "SELF",
  "relationship": "SELF",
  "payer_patient_id": "PP123456",
  "authorization_number": "AUTH789",
  "total_authorized_amount": "50000",
  "payer_type": "INSURANCE",
  "payer_name": "Health Insurance Corp",
  "patient_registration_number": "REG789",
  "specialty": "Cardiology",
  "doctor": "Dr. John Smith",
  "service_start_date": "2024-01-01",
  "service_end_date": "2024-01-05",
  "inpatient_number": "IP001",
  "admission_type": "EMERGENCY",
  "hospitalization_type": "ACUTE",
  "ward_type": "ICU",
  "final_diagnosis": "Heart Attack",
  "treatment_done": "Angioplasty",
  "bill_number": "BILL123",
  "bill_date": "2024-01-05",
  "total_bill_amount": "45000",
  "claimed_amount": "29000"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "draft_id": "draft_12345678"
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Patient name is required to save a draft"
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

### 2. Get All Drafts
**GET** `/get-drafts`

**Purpose**: Get all drafts for the user's hospital

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "drafts": [
    {
      "draft_id": "draft_12345678",
      "status": "draft",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "patient_name": "John Doe",
      "claimed_amount": "29000",
      "specialty": "Cardiology"
    },
    {
      "draft_id": "draft_87654321",
      "status": "draft",
      "created_at": "2024-01-14T15:20:00Z",
      "updated_at": "2024-01-14T15:20:00Z",
      "patient_name": "Jane Smith",
      "claimed_amount": "35000",
      "specialty": "Orthopedics"
    }
  ]
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Hospital ID not found"
}
```

**401 - Unauthorized**:
```json
{
  "error": "No token provided"
}
```

---

### 3. Get Specific Draft
**GET** `/get-draft/{draft_id}`

**Purpose**: Get detailed information about a specific draft

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `draft_id` (string): The ID of the draft to retrieve

**Success Response (200)**:
```json
{
  "success": true,
  "draft": {
    "draft_id": "draft_12345678",
    "status": "draft",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "created_by": "user_123",
    "created_by_email": "user@example.com",
    "hospital_id": "hospital_123",
    "hospital_name": "Test Hospital",
    "form_data": {
      "patient_name": "John Doe",
      "age": "35",
      "age_unit": "YRS",
      "gender": "MALE",
      "id_card_type": "AADHAAR",
      "beneficiary_type": "SELF",
      "relationship": "SELF",
      "payer_patient_id": "PP123456",
      "authorization_number": "AUTH789",
      "total_authorized_amount": "50000",
      "payer_type": "INSURANCE",
      "payer_name": "Health Insurance Corp",
      "patient_registration_number": "REG789",
      "specialty": "Cardiology",
      "doctor": "Dr. John Smith",
      "service_start_date": "2024-01-01",
      "service_end_date": "2024-01-05",
      "inpatient_number": "IP001",
      "admission_type": "EMERGENCY",
      "hospitalization_type": "ACUTE",
      "ward_type": "ICU",
      "final_diagnosis": "Heart Attack",
      "treatment_done": "Angioplasty",
      "bill_number": "BILL123",
      "bill_date": "2024-01-05",
      "total_bill_amount": "45000",
      "claimed_amount": "29000"
    },
    "is_draft": true
  }
}
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "success": false,
  "error": "Draft not found"
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

### 4. Update Draft
**PUT** `/update-draft/{draft_id}`

**Purpose**: Update an existing draft

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `draft_id` (string): The ID of the draft to update

**Request Body**:
```json
{
  "patient_name": "John Doe Updated",
  "age": "36",
  "claimed_amount": "30000",
  "specialty": "Cardiology",
  "doctor": "Dr. Jane Smith"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Draft updated successfully"
}
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "success": false,
  "error": "Draft not found"
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

### 5. Submit Draft
**POST** `/submit-draft/{draft_id}`

**Purpose**: Submit a draft as a claim (changes status from draft to pending)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `draft_id` (string): The ID of the draft to submit

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Draft submitted successfully",
  "claim_id": "claim_12345678"
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Missing required fields to submit: patient_name, age, gender, id_card_type"
}
```

**404 - Not Found**:
```json
{
  "success": false,
  "error": "Draft not found"
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

### 6. Delete Draft
**DELETE** `/delete-draft/{draft_id}`

**Purpose**: Delete a draft

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `draft_id` (string): The ID of the draft to delete

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "success": false,
  "error": "Draft not found"
}
```

**403 - Forbidden**:
```json
{
  "success": false,
  "error": "Access denied"
}
```

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "This is not a draft"
}
```

---

## Draft Status Flow

1. **Draft** → Initial status when saved (same collection as claims)
2. **Pending** → When draft is submitted (status changes from draft to pending)
3. **Under Review** → Claims processor reviews
4. **Approved/Rejected** → Final decision

---

## Frontend Integration

### Save Draft
```javascript
const draftData = {
  patient_name: "John Doe",
  age: "35",
  // ... other form fields (partial data allowed)
};

const response = await fetch('http://localhost:5002/api/v1/drafts/save-draft', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(draftData)
});

const result = await response.json();
if (result.success) {
  console.log('Draft saved:', result.draft_id);
}
```

### Get Drafts List
```javascript
const response = await fetch('http://localhost:5002/api/v1/drafts/get-drafts', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

const data = await response.json();
const drafts = data.drafts;
```

### Submit Draft
```javascript
const response = await fetch(`http://localhost:5002/api/v1/drafts/submit-draft/${draftId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

const result = await response.json();
if (result.success) {
  console.log('Draft submitted as claim:', result.claim_id);
}
```

### Update Draft
```javascript
const updateData = {
  patient_name: "John Doe Updated",
  claimed_amount: "30000"
};

const response = await fetch(`http://localhost:5002/api/v1/drafts/update-draft/${draftId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData)
});
```

### Delete Draft
```javascript
const response = await fetch(`http://localhost:5002/api/v1/drafts/delete-draft/${draftId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});
```

---

## Data Storage

### Draft Document Structure
Drafts are stored in the `claims` collection with the following structure:

```json
{
  "draft_id": "draft_12345678",
  "claim_status": "draft",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "created_by": "user_id",
  "created_by_email": "user@example.com",
  "hospital_id": "hospital_123",
  "hospital_name": "Hospital Name",
  "is_draft": true,
  "form_data": {
    // All form fields from request
  },
  "show_in_claims": true,
  "show_in_preauth": false,
  "show_in_reimb": false,
  "created_in_module": "claims"
}
```

---

## Validation Rules

### Save Draft
- **Minimum Required**: `patient_name` must be provided
- **All Other Fields**: Optional, partial data is allowed

### Submit Draft
- **All Required Fields**: Must be provided for submission
- **Same Validation**: As regular claim submission
- **Status Change**: Draft → Pending

---

## Error Handling

### Common Error Scenarios
1. **Missing Patient Name**: Required for draft identification
2. **Draft Not Found**: Invalid draft ID
3. **Access Denied**: User doesn't have permission
4. **Missing Required Fields**: When submitting draft
5. **Authentication Required**: User must be logged in

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
