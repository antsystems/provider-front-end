# Resources API Documentation

## Overview
Resources API provides endpoints for managing hospital resources, including payers, specialties, doctors, and other reference data in the Hospital Claims Management System.

**Base URL**: `http://localhost:5002/api/resources`

**Authentication**: Required (Bearer token)

---

## Endpoints

### 1. Get All Payers
**GET** `/payers`

**Purpose**: Get list of all available payers

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "payers": [
    {
      "payer_id": "payer_001",
      "payer_name": "CGHS",
      "payer_type": "GOVERNMENT",
      "description": "Central Government Health Scheme",
      "status": "active",
      "contact_info": {
        "phone": "+91-11-12345678",
        "email": "support@cghs.nic.in",
        "website": "https://cghs.nic.in"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "payer_id": "payer_002",
      "payer_name": "Health Insurance Corp",
      "payer_type": "INSURANCE",
      "description": "Private Health Insurance Company",
      "status": "active",
      "contact_info": {
        "phone": "+91-22-87654321",
        "email": "claims@hic.com",
        "website": "https://hic.com"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 2
}
```

---

### 2. Get All Specialties
**GET** `/specialties`

**Purpose**: Get list of all available medical specialties

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "specialties": [
    {
      "specialty_id": "spec_001",
      "specialty_name": "Cardiology",
      "description": "Heart and cardiovascular system",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "specialty_id": "spec_002",
      "specialty_name": "Orthopedics",
      "description": "Bones, joints, and musculoskeletal system",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "specialty_id": "spec_003",
      "specialty_name": "Neurology",
      "description": "Nervous system and brain",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 3
}
```

---

### 3. Get Doctors by Specialty
**GET** `/doctors`

**Purpose**: Get list of doctors, optionally filtered by specialty

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `specialty` (optional): Filter doctors by specialty
- `hospital_id` (optional): Filter doctors by hospital

**Example Request**:
```
GET /api/resources/doctors?specialty=Cardiology&hospital_id=hospital_123
```

**Success Response (200)**:
```json
{
  "success": true,
  "doctors": [
    {
      "doctor_id": "doc_001",
      "doctor_name": "Dr. John Smith",
      "specialty": "Cardiology",
      "qualification": "MD, DM Cardiology",
      "experience_years": 15,
      "hospital_id": "hospital_123",
      "hospital_name": "Test Hospital",
      "contact_info": {
        "phone": "+91-9876543210",
        "email": "dr.john@hospital.com"
      },
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "doctor_id": "doc_002",
      "doctor_name": "Dr. Jane Doe",
      "specialty": "Cardiology",
      "qualification": "MD, DM Cardiology",
      "experience_years": 12,
      "hospital_id": "hospital_123",
      "hospital_name": "Test Hospital",
      "contact_info": {
        "phone": "+91-9876543211",
        "email": "dr.jane@hospital.com"
      },
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 2
}
```

---

### 4. Get Treatment Lines
**GET** `/treatment-lines`

**Purpose**: Get list of available treatment lines

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `specialty` (optional): Filter treatment lines by specialty

**Success Response (200)**:
```json
{
  "success": true,
  "treatment_lines": [
    {
      "treatment_line_id": "tl_001",
      "treatment_line_name": "Cardiac Surgery",
      "specialty": "Cardiology",
      "description": "Surgical procedures for heart conditions",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "treatment_line_id": "tl_002",
      "treatment_line_name": "Interventional Cardiology",
      "specialty": "Cardiology",
      "description": "Non-surgical heart procedures",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 2
}
```

---

### 5. Get ID Card Types
**GET** `/id-card-types`

**Purpose**: Get list of available ID card types

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "id_card_types": [
    {
      "id_card_type_id": "id_001",
      "id_card_type_name": "AADHAAR",
      "description": "Aadhaar Card",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id_card_type_id": "id_002",
      "id_card_type_name": "PAN",
      "description": "Permanent Account Number",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id_card_type_id": "id_003",
      "id_card_type_name": "PASSPORT",
      "description": "Passport",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 3
}
```

---

### 6. Get Beneficiary Types
**GET** `/beneficiary-types`

**Purpose**: Get list of available beneficiary types

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "beneficiary_types": [
    {
      "beneficiary_type_id": "bt_001",
      "beneficiary_type_name": "SELF",
      "description": "Self",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "beneficiary_type_id": "bt_002",
      "beneficiary_type_name": "SPOUSE",
      "description": "Spouse",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "beneficiary_type_id": "bt_003",
      "beneficiary_type_name": "CHILD",
      "description": "Child",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 3
}
```

---

### 7. Get Relationships
**GET** `/relationships`

**Purpose**: Get list of available relationship types

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "relationships": [
    {
      "relationship_id": "rel_001",
      "relationship_name": "SELF",
      "description": "Self",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "relationship_id": "rel_002",
      "relationship_name": "SPOUSE",
      "description": "Spouse",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "relationship_id": "rel_003",
      "relationship_name": "CHILD",
      "description": "Child",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 3
}
```

---

### 8. Get Payer Types
**GET** `/payer-types`

**Purpose**: Get list of available payer types

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "payer_types": [
    {
      "payer_type_id": "pt_001",
      "payer_type_name": "INSURANCE",
      "description": "Insurance Company",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "payer_type_id": "pt_002",
      "payer_type_name": "TPA",
      "description": "Third Party Administrator",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "payer_type_id": "pt_003",
      "payer_type_name": "GOVERNMENT",
      "description": "Government Scheme",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 3
}
```

---

### 9. Get Claim Types
**GET** `/claim-types`

**Purpose**: Get list of available claim types

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "claim_types": [
    {
      "claim_type_id": "ct_001",
      "claim_type_name": "INPATIENT",
      "description": "Inpatient Claim",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "claim_type_id": "ct_002",
      "claim_type_name": "OUTPATIENT",
      "description": "Outpatient Claim",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 2
}
```

---

### 10. Get Admission Types
**GET** `/admission-types`

**Purpose**: Get list of available admission types

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "admission_types": [
    {
      "admission_type_id": "at_001",
      "admission_type_name": "EMERGENCY",
      "description": "Emergency Admission",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "admission_type_id": "at_002",
      "admission_type_name": "PLANNED",
      "description": "Planned Admission",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 2
}
```

---

### 11. Get Ward Types
**GET** `/ward-types`

**Purpose**: Get list of available ward types

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "ward_types": [
    {
      "ward_type_id": "wt_001",
      "ward_type_name": "ICU",
      "description": "Intensive Care Unit",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "ward_type_id": "wt_002",
      "ward_type_name": "GENERAL",
      "description": "General Ward",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "ward_type_id": "wt_003",
      "ward_type_name": "PRIVATE",
      "description": "Private Room",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 3
}
```

---

## Frontend Integration

### Get All Payers
```javascript
const getPayers = async () => {
  const response = await fetch('http://localhost:5002/api/resources/payers', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.payers;
  } else {
    throw new Error(data.error);
  }
};
```

### Get Specialties
```javascript
const getSpecialties = async () => {
  const response = await fetch('http://localhost:5002/api/resources/specialties', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.specialties;
  } else {
    throw new Error(data.error);
  }
};
```

### Get Doctors by Specialty
```javascript
const getDoctors = async (specialty = null, hospitalId = null) => {
  const params = new URLSearchParams();
  if (specialty) params.append('specialty', specialty);
  if (hospitalId) params.append('hospital_id', hospitalId);
  
  const response = await fetch(`http://localhost:5002/api/resources/doctors?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.doctors;
  } else {
    throw new Error(data.error);
  }
};
```

### Get Treatment Lines
```javascript
const getTreatmentLines = async (specialty = null) => {
  const params = new URLSearchParams();
  if (specialty) params.append('specialty', specialty);
  
  const response = await fetch(`http://localhost:5002/api/resources/treatment-lines?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.treatment_lines;
  } else {
    throw new Error(data.error);
  }
};
```

---

## Data Structure

### Payer Object
```json
{
  "payer_id": "string",
  "payer_name": "string",
  "payer_type": "string",
  "description": "string",
  "status": "active|inactive",
  "contact_info": {
    "phone": "string",
    "email": "string",
    "website": "string"
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Doctor Object
```json
{
  "doctor_id": "string",
  "doctor_name": "string",
  "specialty": "string",
  "qualification": "string",
  "experience_years": "number",
  "hospital_id": "string",
  "hospital_name": "string",
  "contact_info": {
    "phone": "string",
    "email": "string"
  },
  "status": "active|inactive",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## Error Handling

### Common Error Scenarios
1. **Authentication Required**: User must be logged in
2. **Invalid Parameters**: Invalid query parameters
3. **No Data Found**: No resources available
4. **Access Denied**: User doesn't have permission

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
