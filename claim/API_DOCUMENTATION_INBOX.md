# Inbox API Documentation

## Overview
Inbox API provides endpoints for managing claim processing workflow, including inbox management, claim assignments, and status updates in the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/v1/inbox`

**Authentication**: Required (Bearer token)

---

## Endpoints

### 1. Get Inbox Claims
**GET** `/claims`

**Purpose**: Get claims assigned to the current user's inbox

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (optional): Filter by claim status
- `priority` (optional): Filter by priority level
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Example Request**:
```
GET /api/v1/inbox/claims?status=pending&priority=high&limit=20
```

**Success Response (200)**:
```json
{
  "success": true,
  "claims": [
    {
      "claim_id": "claim_12345678",
      "claim_status": "pending",
      "priority": "high",
      "assigned_to": "user_123",
      "assigned_at": "2024-01-15T10:30:00Z",
      "due_date": "2024-01-20T10:30:00Z",
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
      "hospital_details": {
        "hospital_id": "hospital_123",
        "hospital_name": "Test Hospital"
      },
      "submission_date": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": false
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

**403 - Forbidden**:
```json
{
  "error": "Access denied"
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

### 2. Get Claim Details
**GET** `/claims/{claim_id}`

**Purpose**: Get detailed information about a specific claim in the inbox

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
  "claim": {
    "claim_id": "claim_12345678",
    "claim_status": "pending",
    "priority": "high",
    "assigned_to": "user_123",
    "assigned_at": "2024-01-15T10:30:00Z",
    "due_date": "2024-01-20T10:30:00Z",
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
    "hospital_details": {
      "hospital_id": "hospital_123",
      "hospital_name": "Test Hospital"
    },
    "submission_date": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "documents": [],
    "processing_history": [
      {
        "action": "assigned",
        "performed_by": "admin_123",
        "performed_at": "2024-01-15T10:30:00Z",
        "remarks": "Assigned to processor"
      }
    ]
  }
}
```

---

### 3. Update Claim Status
**PATCH** `/claims/{claim_id}/status`

**Purpose**: Update the status of a claim in the inbox

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `claim_id` (string): The ID of the claim

**Request Body**:
```json
{
  "status": "under_review",
  "remarks": "Claim is now under review",
  "priority": "medium"
}
```

**Valid Statuses**:
- `pending` - Claim is pending review
- `under_review` - Claim is being reviewed
- `approved` - Claim has been approved
- `rejected` - Claim has been rejected
- `settled` - Claim has been settled

**Valid Priorities**:
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `urgent` - Urgent priority

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim status updated successfully",
  "claim_id": "claim_12345678",
  "new_status": "under_review",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Error Responses**:

**400 - Bad Request**:
```json
{
  "success": false,
  "error": "Invalid status or priority"
}
```

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

### 4. Assign Claim
**POST** `/claims/{claim_id}/assign`

**Purpose**: Assign a claim to a specific user

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `claim_id` (string): The ID of the claim

**Request Body**:
```json
{
  "assigned_to": "user_456",
  "priority": "high",
  "due_date": "2024-01-20T10:30:00Z",
  "remarks": "Assigning to senior processor"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim assigned successfully",
  "claim_id": "claim_12345678",
  "assigned_to": "user_456",
  "assigned_at": "2024-01-15T11:00:00Z"
}
```

---

### 5. Reassign Claim
**POST** `/claims/{claim_id}/reassign`

**Purpose**: Reassign a claim to a different user

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `claim_id` (string): The ID of the claim

**Request Body**:
```json
{
  "assigned_to": "user_789",
  "priority": "medium",
  "due_date": "2024-01-22T10:30:00Z",
  "remarks": "Reassigning due to workload"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim reassigned successfully",
  "claim_id": "claim_12345678",
  "assigned_to": "user_789",
  "reassigned_at": "2024-01-15T11:30:00Z"
}
```

---

### 6. Add Processing Note
**POST** `/claims/{claim_id}/notes`

**Purpose**: Add a processing note to a claim

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `claim_id` (string): The ID of the claim

**Request Body**:
```json
{
  "note": "Additional documents required from hospital",
  "note_type": "internal",
  "is_visible_to_hospital": false
}
```

**Note Types**:
- `internal` - Internal note (not visible to hospital)
- `external` - External note (visible to hospital)
- `system` - System generated note

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Note added successfully",
  "note_id": "note_12345678",
  "claim_id": "claim_12345678"
}
```

---

### 7. Get Processing History
**GET** `/claims/{claim_id}/history`

**Purpose**: Get processing history for a claim

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
  "processing_history": [
    {
      "action": "submitted",
      "performed_by": "user_123",
      "performed_by_email": "user@example.com",
      "performed_at": "2024-01-15T10:30:00Z",
      "remarks": "Claim submitted by hospital",
      "status_before": null,
      "status_after": "pending"
    },
    {
      "action": "assigned",
      "performed_by": "admin_123",
      "performed_by_email": "admin@example.com",
      "performed_at": "2024-01-15T10:35:00Z",
      "remarks": "Assigned to processor",
      "status_before": "pending",
      "status_after": "pending"
    },
    {
      "action": "status_updated",
      "performed_by": "user_456",
      "performed_by_email": "processor@example.com",
      "performed_at": "2024-01-15T11:00:00Z",
      "remarks": "Claim is now under review",
      "status_before": "pending",
      "status_after": "under_review"
    }
  ],
  "total_actions": 3
}
```

---

### 8. Get Inbox Statistics
**GET** `/statistics`

**Purpose**: Get inbox statistics for the current user

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "statistics": {
    "total_claims": 25,
    "pending_claims": 15,
    "under_review_claims": 8,
    "approved_claims": 2,
    "rejected_claims": 0,
    "overdue_claims": 3,
    "priority_breakdown": {
      "urgent": 2,
      "high": 5,
      "medium": 12,
      "low": 6
    },
    "average_processing_time": "2.5 days",
    "claims_processed_today": 3,
    "claims_processed_this_week": 18
  }
}
```

---

## Frontend Integration

### Get Inbox Claims
```javascript
const getInboxClaims = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:5002/api/v1/inbox/claims?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.claims;
  } else {
    throw new Error(data.error);
  }
};
```

### Update Claim Status
```javascript
const updateClaimStatus = async (claimId, status, remarks, priority = null) => {
  const updateData = { status, remarks };
  if (priority) updateData.priority = priority;
  
  const response = await fetch(`http://localhost:5002/api/v1/inbox/claims/${claimId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Status updated:', result.new_status);
  } else {
    throw new Error(result.error);
  }
};
```

### Assign Claim
```javascript
const assignClaim = async (claimId, assignedTo, priority, dueDate, remarks) => {
  const assignData = {
    assigned_to: assignedTo,
    priority: priority,
    due_date: dueDate,
    remarks: remarks
  };
  
  const response = await fetch(`http://localhost:5002/api/v1/inbox/claims/${claimId}/assign`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(assignData)
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Claim assigned:', result.assigned_to);
  } else {
    throw new Error(result.error);
  }
};
```

### Add Processing Note
```javascript
const addProcessingNote = async (claimId, note, noteType = 'internal', isVisibleToHospital = false) => {
  const noteData = {
    note: note,
    note_type: noteType,
    is_visible_to_hospital: isVisibleToHospital
  };
  
  const response = await fetch(`http://localhost:5002/api/v1/inbox/claims/${claimId}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(noteData)
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Note added:', result.note_id);
  } else {
    throw new Error(result.error);
  }
};
```

### Get Inbox Statistics
```javascript
const getInboxStatistics = async () => {
  const response = await fetch('http://localhost:5002/api/v1/inbox/statistics', {
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

---

## Workflow Management

### Claim Processing Flow
1. **Submitted** → Claim submitted by hospital
2. **Assigned** → Claim assigned to processor
3. **Under Review** → Processor reviews claim
4. **Approved/Rejected** → Final decision made
5. **Settled** → Payment processed

### Priority Levels
- **Urgent**: Critical claims requiring immediate attention
- **High**: Important claims with tight deadlines
- **Medium**: Standard priority claims
- **Low**: Non-urgent claims

### Assignment Rules
- Claims can be assigned to users with appropriate roles
- Reassignment is allowed with proper authorization
- Due dates can be set for claim processing
- Priority levels can be adjusted based on urgency

---

## Error Handling

### Common Error Scenarios
1. **Claim Not Found**: Invalid claim ID
2. **Access Denied**: User doesn't have permission
3. **Invalid Status**: Status not allowed for current state
4. **Assignment Failed**: User not available for assignment
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
- Flask
- Python 3.13+
