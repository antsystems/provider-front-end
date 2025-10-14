# Inbox Routes

## GET `/api/v1/inbox/claims/`

**Purpose**: Get inbox claims for processing

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

## GET `/api/v1/inbox/stats`

**Purpose**: Get inbox statistics

**Query Parameters**:
- `hospital_id`: Filter by hospital (optional)

**Success Response (200)**:
```json
{
  "success": true,
  "stats": {
    "total_claims": 100,
    "pending_claims": 50,
    "approved_claims": 30,
    "rejected_claims": 20
  }
}
```

## GET `/api/v1/inbox/claims/{claim_id}`

**Purpose**: Get specific claim details for inbox

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

## PUT `/api/v1/inbox/claims/{claim_id}/status`

**Purpose**: Update claim status

**Mandatory Fields**:
- `status` (string, valid values: "pending", "approved", "rejected", "processing")

**Request Body**:
```json
{
  "status": "approved"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim status updated successfully"
}
```

## DELETE `/api/v1/inbox/claims/{claim_id}`

**Purpose**: Delete claim from inbox

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Claim deleted successfully"
}
```
