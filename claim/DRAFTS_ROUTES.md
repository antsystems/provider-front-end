# Draft Routes

## POST `/api/v1/drafts/save-draft`

**Purpose**: Save a claim as draft

**Minimum Required Fields**:
- `patient_name` (string) - Patient name to identify the draft

**Optional Fields**:
- Any other form fields can be included (partial data is allowed)
- All fields from the claims form can be saved as draft

**Request Body**:
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

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "draft_id": "draft_123"
}
```

## GET `/api/v1/drafts/get-drafts`

**Purpose**: Get all drafts for the user's hospital

**Success Response (200)**:
```json
{
  "success": true,
  "drafts": [
    {
      "draft_id": "draft_123",
      "status": "draft",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "patient_name": "John Doe",
      "claimed_amount": "29000",
      "specialty": "Cardiology"
    }
  ]
}
```

## GET `/api/v1/drafts/get-draft/{draft_id}`

**Purpose**: Get specific draft by ID

**Success Response (200)**:
```json
{
  "success": true,
  "draft": {
    "draft_id": "draft_123",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "created_by": "user_123",
    "created_by_email": "user@example.com",
    "hospital_id": "hospital_123",
    "hospital_name": "Hospital Name",
    "form_data": {
      "patient_name": "John Doe",
      "age": "35",
      "gender": "MALE"
    },
    "is_draft": true
  }
}
```

## PUT `/api/v1/drafts/update-draft/{draft_id}`

**Purpose**: Update an existing draft

**Request Body**:
```json
{
  "patient_name": "John Doe Updated",
  "age": "36",
  "claimed_amount": "30000"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Draft updated successfully"
}
```

## POST `/api/v1/drafts/submit-draft/{draft_id}`

**Purpose**: Submit a draft as a claim (changes status from draft to pending)

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Draft submitted successfully",
  "claim_id": "claim_123"
}
```

## DELETE `/api/v1/drafts/delete-draft/{draft_id}`

**Purpose**: Delete a draft

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

## Draft Status Flow

1. **Draft**: Initial status when saved (same collection as claims)
2. **Pending**: When draft is submitted (status changes from draft to pending)
3. **Under Review**: Claims processor reviews
4. **Approved/Rejected**: Final decision

## Frontend Integration

### Drafts Page (`/drafts`)
- List all saved drafts
- Search and filter drafts
- Edit, submit, or delete drafts
- View draft details

### Claims Form Integration
- **Save Draft** button saves incomplete forms
- **Submit Claim** button submits complete forms
- Drafts can be loaded and edited later
- Status tracking: Draft → Submitted → Pending
