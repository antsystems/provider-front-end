# Resources Routes

## GET `/api/resources/specialties`

**Purpose**: Get specialties for a hospital

**Mandatory Query Parameters**:
- `hospital_id` (string, required): Hospital ID

**Query Parameters**:
- `hospital_id`: Hospital ID (required)

**Success Response (200)**:
```json
{
  "success": true,
  "specialties": [
    {
      "id": "specialty_123",
      "name": "Cardiology",
      "description": "Heart care",
      "code": "CARD001"
    }
  ],
  "total": 1
}
```

**Error Response (400)**:
```json
{
  "message": "No specialties found for this hospital",
  "specialties": [],
  "success": true
}
```

## GET `/api/resources/doctors`

**Purpose**: Get doctors for a hospital

**Mandatory Query Parameters**:
- `hospital_id` (string, required): Hospital ID

**Query Parameters**:
- `hospital_id`: Hospital ID (required)

**Success Response (200)**:
```json
{
  "success": true,
  "doctors": [
    {
      "id": "doctor_123",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "qualification": "MD"
    }
  ],
  "total": 1
}
```

## GET `/api/resources/payers`

**Purpose**: Get payers for a hospital

**Mandatory Query Parameters**:
- `hospital_id` (string, required): Hospital ID

**Query Parameters**:
- `hospital_id`: Hospital ID (required)

**Success Response (200)**:
```json
{
  "success": true,
  "payers": [
    {
      "id": "payer_123",
      "name": "Insurance Company",
      "type": "Private",
      "code": "INS001"
    }
  ],
  "total": 1
}
```

## GET `/api/resources/insurers`

**Purpose**: Get insurers for a hospital

**Mandatory Query Parameters**:
- `hospital_id` (string, required): Hospital ID

**Query Parameters**:
- `hospital_id`: Hospital ID (required)

**Success Response (200)**:
```json
{
  "success": true,
  "insurers": [
    {
      "id": "insurer_123",
      "name": "Health Insurance Corp",
      "type": "Government",
      "code": "GOV001"
    }
  ],
  "total": 1
}
```

## GET `/api/resources/wards`

**Purpose**: Get wards for a hospital

**Mandatory Query Parameters**:
- `hospital_id` (string, required): Hospital ID

**Query Parameters**:
- `hospital_id`: Hospital ID (required)

**Success Response (200)**:
```json
{
  "success": true,
  "wards": [
    {
      "id": "ward_123",
      "name": "ICU",
      "type": "Intensive Care",
      "capacity": 10
    }
  ],
  "total": 1
}
```
