# Claims API Documentation

## Overview
Claims API provides endpoints for submitting, managing, and processing insurance claims in the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/v1/claims`

**Authentication**: Required (Bearer token)

---

## Endpoints

### 1. Submit New Claim
**POST** `/submit`

**Purpose**: Submit a new IP (Inpatient) claim for processing

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
  "submission_remarks": "string",
  "hospital_id": "string",
  "submitted_by": "string",
  "submitted_by_email": "string",
  "documents": "array"
}
```

**Required Fields**:
- `patient_name`, `age`, `gender`, `id_card_type`, `beneficiary_type`, `relationship`
- `payer_patient_id`, `authorization_number`, `total_authorized_amount`, `payer_type`, `payer_name`
- `patient_registration_number`, `specialty`, `doctor`, `treatment_line`, `claim_type`
- `service_start_date`, `service_end_date`, `inpatient_number`, `admission_type`
- `hospitalization_type`, `ward_type`, `final_diagnosis`, `treatment_done`
- `bill_number`, `bill_date`, `total_bill_amount`, `claimed_amount`

**Request Body Example**:
```json
{
  "patient_name": "John Doe",
  "age": "35",
  "age_unit": "YRS",
  "gender": "MALE",
  "id_card_type": "AADHAAR",
  "id_card_number": "123456789012",
  "patient_contact_number": "+91-9876543210",
  "patient_email_id": "john@example.com",
  "beneficiary_type": "SELF",
  "relationship": "SELF",
  "payer_patient_id": "PP123456",
  "authorization_number": "AUTH789",
  "total_authorized_amount": "50000",
  "payer_type": "INSURANCE",
  "payer_name": "Health Insurance Corp",
  "insurer_name": "Insurance Company",
  "policy_number": "POL123456",
  "patient_registration_number": "REG789",
  "specialty": "Cardiology",
  "doctor": "Dr. John Smith",
  "treatment_line": "Cardiac Surgery",
  "claim_type": "INPATIENT",
  "service_start_date": "2024-01-01",
  "service_end_date": "2024-01-05",
  "inpatient_number": "IP001",
  "admission_type": "EMERGENCY",
  "hospitalization_type": "ACUTE",
  "ward_type": "ICU",
  "final_diagnosis": "Heart Attack",
  "treatment_done": "Angioplasty",
  "icd_10_code": "I21.9",
  "pcs_code": "PCS001",
  "bill_number": "BILL123",
  "bill_date": "2024-01-05",
  "security_deposit": "5000",
  "total_bill_amount": "45000",
  "patient_discount_amount": "2000",
  "amount_paid_by_patient": "10000",
  "total_patient_paid_amount": "15000",
  "amount_charged_to_payer": "30000",
  "mou_discount_amount": "1000",
  "claimed_amount": "29000",
  "submission_remarks": "Emergency case",
  "hospital_id": "hospital_123",
  "submitted_by": "user_123",
  "submitted_by_email": "user@example.com",
  "documents": []
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "claim_id": "claim_12345678",
  "claim_status": "pending",
  "submission_date": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Missing required fields: patient_name, age, gender"
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

### 2. Get Claims List
**GET** `/list`

**Purpose**: Get list of claims with filtering options

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `hospital_id` (optional): Filter by hospital ID
- `status` (optional): Filter by claim status
- `claim_type` (optional): Filter by claim type
- `module` (optional): Filter by module (default: 'claims')
- `limit` (optional): Number of results (default: 50)

**Example Request**:
```
GET /api/v1/claims/list?hospital_id=hospital_123&status=pending&limit=20
```

**Success Response (200)**:
```json
{
  "success": true,
  "claims": [
    {
      "claim_id": "claim_12345678",
      "claim_status": "pending",
      "submission_date": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "patient_details": {
        "patient_name": "John Doe",
        "age": 35,
        "gender": "MALE"
      },
      "payer_details": {
        "payer_name": "Health Insurance Corp",
        "payer_type": "INSURANCE"
      },
      "bill_details": {
        "total_bill_amount": 45000,
        "claimed_amount": 29000
      },
      "hospital_id": "hospital_123",
      "submitted_by": "user_123"
    }
  ],
  "total": 1
}
```

---

### 3. Get Specific Claim
**GET** `/{claim_id}`

**Purpose**: Get detailed information about a specific claim

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "claim": {
    "claim_id": "claim_12345678",
    "claim_status": "pending",
    "submission_date": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "patient_details": {
      "patient_name": "John Doe",
      "age": 35,
      "age_unit": "YRS",
      "gender": "MALE",
      "id_card_type": "AADHAAR",
      "id_card_number": "123456789012",
      "patient_contact_number": "+91-9876543210",
      "patient_email_id": "john@example.com",
      "beneficiary_type": "SELF",
      "relationship": "SELF"
    },
    "payer_details": {
      "payer_patient_id": "PP123456",
      "authorization_number": "AUTH789",
      "total_authorized_amount": 50000,
      "payer_type": "INSURANCE",
      "payer_name": "Health Insurance Corp",
      "insurer_name": "Insurance Company",
      "policy_number": "POL123456"
    },
    "provider_details": {
      "patient_registration_number": "REG789",
      "specialty": "Cardiology",
      "doctor": "Dr. John Smith",
      "treatment_line": "Cardiac Surgery",
      "claim_type": "INPATIENT",
      "service_start_date": "2024-01-01",
      "service_end_date": "2024-01-05",
      "inpatient_number": "IP001",
      "admission_type": "EMERGENCY",
      "hospitalization_type": "ACUTE",
      "ward_type": "ICU",
      "final_diagnosis": "Heart Attack",
      "treatment_done": "Angioplasty",
      "icd_10_code": "I21.9",
      "pcs_code": "PCS001"
    },
    "bill_details": {
      "bill_number": "BILL123",
      "bill_date": "2024-01-05",
      "security_deposit": 5000,
      "total_bill_amount": 45000,
      "patient_discount_amount": 2000,
      "amount_paid_by_patient": 10000,
      "total_patient_paid_amount": 15000,
      "amount_charged_to_payer": 30000,
      "mou_discount_amount": 1000,
      "claimed_amount": 29000,
      "submission_remarks": "Emergency case"
    },
    "hospital_id": "hospital_123",
    "submitted_by": "user_123",
    "submitted_by_email": "user@example.com",
    "documents": [],
    "show_in_claims": true,
    "show_in_preauth": false,
    "show_in_reimb": false,
    "created_in_module": "claims"
  }
}
```

---

### 4. Update Claim
**PUT** `/{claim_id}`

**Purpose**: Update an existing claim

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "patient_details": {
    "patient_name": "John Doe Updated",
    "age": 36
  },
  "bill_details": {
    "claimed_amount": 30000
  },
  "claim_status": "under_review"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim updated successfully",
  "claim_id": "claim_12345678"
}
```

---

### 5. Update Claim Status
**PATCH** `/{claim_id}/status`

**Purpose**: Update claim status

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "under_review",
  "remarks": "Claim is now under review"
}
```

**Valid Statuses**:
- `submitted`
- `pending`
- `under_review`
- `approved`
- `rejected`
- `settled`

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim status updated successfully",
  "claim_id": "claim_12345678",
  "new_status": "under_review"
}
```

---

### 6. Move Preauth to Claims
**PUT** `/move-to-claims/{claim_id}`

**Purpose**: Move a preauthorization to claims module

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim moved to claims module successfully",
  "claim_id": "claim_12345678"
}
```

---

### 7. Delete Claim
**DELETE** `/{claim_id}`

**Purpose**: Delete a claim

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim deleted successfully"
}
```

---

## Frontend Integration

### Submit Claim
```javascript
const claimData = {
  patient_name: "John Doe",
  age: "35",
  // ... other required fields
};

const response = await fetch('http://localhost:5002/api/v1/claims/submit', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(claimData)
});

const result = await response.json();
if (result.success) {
  console.log('Claim submitted:', result.claim_id);
}
```

### Get Claims List
```javascript
const response = await fetch('http://localhost:5002/api/v1/claims/list?status=pending', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

const data = await response.json();
const claims = data.claims;
```

---

## Status Flow

1. **Draft** → User saves incomplete form
2. **Pending** → User submits complete form
3. **Under Review** → Processor reviews claim
4. **Approved/Rejected** → Final decision
5. **Settled** → Payment processed

---

## Error Handling

### Common Error Scenarios
1. **Missing Required Fields**: Check all mandatory fields are provided
2. **Invalid Data Types**: Ensure numeric fields are numbers
3. **Authentication Required**: User must be logged in
4. **Claim Not Found**: Invalid claim ID
5. **Access Denied**: User doesn't have permission

---

## Validation Rules

### Required Fields Validation
- Patient details: name, age, gender, ID type, beneficiary type, relationship
- Payer details: patient ID, authorization number, amount, payer type/name
- Provider details: registration number, specialty, doctor, dates, diagnosis
- Bill details: bill number/date, amounts

### Conditional Validation
- `insurer_name` required only if `payer_type` is "TPA"
- `claimed_amount` cannot exceed `total_authorized_amount`

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request |
| 401 | Unauthorized |
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
