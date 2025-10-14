# Claims Routes

## POST `/api/v1/claims/submit`

**Purpose**: Submit a new claim

**Mandatory Fields**:
- `patient_name` (string) - Patient full name
- `age` (string) - Patient age
- `age_unit` (string) - Age unit (YRS/MONTHS/DAYS)
- `gender` (string) - Patient gender
- `id_card_type` (string) - ID card type
- `beneficiary_type` (string) - Beneficiary type
- `relationship` (string) - Relationship to patient
- `payer_patient_id` (string) - Payer patient ID
- `authorization_number` (string) - Authorization number
- `total_authorized_amount` (string) - Total authorized amount
- `payer_type` (string) - Payer type
- `payer_name` (string) - Payer name
- `patient_registration_number` (string) - Patient registration number
- `specialty` (string) - Medical specialty
- `doctor` (string) - Doctor name
- `service_start_date` (string) - Service start date
- `service_end_date` (string) - Service end date
- `inpatient_number` (string) - Inpatient number
- `admission_type` (string) - Admission type
- `hospitalization_type` (string) - Hospitalization type
- `ward_type` (string) - Ward type
- `final_diagnosis` (string) - Final diagnosis
- `treatment_done` (string) - Treatment done
- `bill_number` (string) - Bill number
- `bill_date` (string) - Bill date
- `total_bill_amount` (string) - Total bill amount
- `claimed_amount` (string) - Claimed amount

**Optional Fields**:
- `id_card_number` (string) - ID card number
- `patient_contact_number` (string) - Patient contact number
- `patient_email_id` (string) - Patient email
- `insurer_name` (string) - Insurer name (required if payer_type is TPA)
- `policy_number` (string) - Policy number
- `sponsorer_corporate_name` (string) - Corporate name
- `sponsorer_employee_id` (string) - Employee ID
- `sponsorer_employee_name` (string) - Employee name
- `treatment_line` (string) - Treatment line
- `icd_10_code` (string) - ICD-10 code
- `pcs_code` (string) - PCS code
- `security_deposit` (string) - Security deposit
- `patient_discount_amount` (string) - Patient discount amount
- `amount_paid_by_patient` (string) - Amount paid by patient
- `total_patient_paid_amount` (string) - Total patient paid amount
- `amount_charged_to_payer` (string) - Amount charged to payer
- `mou_discount_amount` (string) - MOU discount amount
- `submission_remarks` (string) - Submission remarks

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
  "sponsorer_corporate_name": "ABC Corp",
  "sponsorer_employee_id": "EMP001",
  "sponsorer_employee_name": "Jane Smith",
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
  "icd_10_code": "I21.9",
  "treatment_done": "Angioplasty",
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
  "submission_remarks": "Emergency case"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "claim_id": "claim_123"
}
```

## GET `/api/v1/claims/`

**Purpose**: Get list of claims

**Query Parameters**:
- `hospital_id`: Filter by hospital (optional)
- `status`: Filter by status (optional)
- `limit`: Number of results (default: 100)
- `offset`: Pagination offset (default: 0)

**Success Response (200)**:
```json
{
  "success": true,
  "claims": [
    {
      "id": "claim_123",
      "patient_name": "John Doe",
      "status": "pending",
      "total_amount": 5000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

## GET `/api/v1/claims/{claim_id}`

**Purpose**: Get specific claim details

**Success Response (200)**:
```json
{
  "success": true,
  "claim": {
    "id": "claim_123",
    "patient_name": "John Doe",
    "patient_id": "P123456",
    "admission_date": "2024-01-01",
    "discharge_date": "2024-01-05",
    "diagnosis": "Fever",
    "treatment": "Medication",
    "total_amount": 5000,
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## PUT `/api/v1/claims/{claim_id}`

**Purpose**: Update claim

**Request Body**:
```json
{
  "patient_name": "John Doe Updated",
  "diagnosis": "Updated Diagnosis",
  "total_amount": 6000
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim updated successfully"
}
```

## DELETE `/api/v1/claims/{claim_id}`

**Purpose**: Delete claim

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim deleted successfully"
}
```
