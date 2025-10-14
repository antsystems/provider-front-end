# Frontend Developer Guide

## 🎯 Application Overview

This is a **Claims Management System** with a Flask backend and Next.js frontend. The application handles hospital claims submission, processing, and management.

## 🏗️ Architecture

- **Backend**: Flask API (Python) - Port 5002
- **Frontend**: Next.js (React/TypeScript) - Port 3000
- **Database**: Firestore (Firebase)
- **Authentication**: Firebase Admin SDK + Custom Auth

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Firebase project with ServiceAccountKey.json

### Backend Setup
```bash
cd /Users/snehapatil/Desktop/claim-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd /Users/snehapatil/Desktop/claim/frontend/Claims\ Front\ END
npm install
npm run dev
```

## 🔐 Authentication System

### Allowed Roles
Only these roles can access the application:
- `hospital_user`
- `claim_processor` 
- `reconciler`

### Blocked Roles
These roles are completely blocked:
- `admin`
- `super_admin`
- `system_admin`
- `hospital_admin`
- `rm`
- `rp`
- `employee`

### Login Flow
1. User enters email/password
2. Backend validates credentials and role
3. If role is blocked → "Access denied" error
4. If role is allowed → Login successful with user data

## 📁 Frontend Structure

```
frontend/Claims Front END/src/
├── app/                    # Next.js app router pages
│   ├── claims/            # Claims submission page
│   ├── claims-inbox/      # Claims inbox/processing
│   ├── dashboard/          # Hospital dashboard
│   ├── login/             # Login page
│   └── profile/            # User profile page
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── forms/             # Form components
│   ├── tables/            # Table components
│   └── ui/                # UI components (shadcn/ui)
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── services/              # API services
│   ├── auth.ts           # Authentication service
│   ├── claimsApi.ts      # Claims API service
│   └── firebaseClient.ts # Firebase client
├── types/                 # TypeScript types
│   ├── auth.ts           # Authentication types
│   └── claims.ts         # Claims types
└── providers/            # React providers
    └── AuthProvider.tsx  # Authentication provider
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:5002/api
```

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /firebase/verify-token` - Firebase token verification

### Claims Endpoints
- `POST /v1/claims/submit` - Submit new claim
- `GET /v1/claims/` - List claims
- `GET /v1/claims/{id}` - Get claim details
- `PUT /v1/claims/{id}` - Update claim
- `DELETE /v1/claims/{id}` - Delete claim

### Inbox Endpoints
- `GET /v1/inbox/claims/` - Get inbox claims
- `GET /v1/inbox/stats` - Get inbox statistics
- `PUT /v1/inbox/claims/{id}/status` - Update claim status

### Resources Endpoints
- `GET /resources/specialties?hospital_id={id}` - Get specialties
- `GET /resources/doctors?hospital_id={id}` - Get doctors
- `GET /resources/payers?hospital_id={id}` - Get payers
- `GET /resources/insurers?hospital_id={id}` - Get insurers
- `GET /resources/wards?hospital_id={id}` - Get wards

## 🏥 Hospital Data Flow

### User Hospital Assignment
Users are assigned to hospitals via `entity_assignments`:
```typescript
user.entity_assignments = {
  hospitals: [
    {
      id: "CMRI_BMB",
      name: "BMB",
      city: "Bangalore",
      code: "BMB123"
    }
  ]
}
```

### Hospital ID Usage
Both profile and claims form use the same hospital source:
```typescript
const hospitalId = user.entity_assignments?.hospitals?.[0]?.id
const hospitalName = user.entity_assignments?.hospitals?.[0]?.name
```

## 📋 Key Pages

### 1. Login Page (`/login`)
- Email/password authentication
- Role validation
- Error handling for blocked roles

### 2. Dashboard (`/dashboard`)
- Hospital summary
- Uses user's hospital data from AuthContext
- No external API calls

### 3. Claims Submission (`/claims`)
- Submit new inpatient claims
- Dropdowns populated from hospital-specific data
- Uses same hospital as profile page

### 4. Claims Inbox (`/claims-inbox`)
- Process and manage claims
- Status updates
- Filtering and pagination

### 5. Profile (`/profile`)
- User information
- Hospital assignments
- Role information

## 🔧 Development Guidelines

### Authentication Context
```typescript
const { user, login, logout, isAuthenticated } = useAuth()
```

### API Calls
```typescript
// Claims API
import { claimsApi } from '@/services/claimsApi'
const claims = await claimsApi.getClaims()

// Auth API  
import authService from '@/services/auth'
const response = await authService.loginDirect(credentials)
```

### Error Handling
- 401: Token expired → Redirect to login
- 403: Access denied → Show error message
- Network errors → Show generic error

### State Management
- Use React Context for global state (AuthContext)
- Use local state for component-specific data
- No external state management library needed

## 🎨 UI Components

### Component Library
- **shadcn/ui**: Primary component library
- **Lucide React**: Icons
- **Sonner**: Toast notifications
- **Tailwind CSS**: Styling

### Key Components
- `ProtectedRoute`: Route protection
- `RoleProtectedRoute`: Role-based protection
- `ClaimsTable`: Claims data table
- `AddIPClaimDialog`: Claim submission form

## 🚨 Important Notes

### Hospital Data Consistency
- **Profile page**: Shows `entity_assignments` hospital
- **Claims form**: Uses same `entity_assignments` hospital
- **No fallback logic**: If hospital has no data, show empty dropdowns

### Role Validation
- Backend enforces role restrictions
- Frontend shows "Access denied" for blocked roles
- No access to any pages for blocked users

### API Configuration
- Backend runs on port 5002
- Frontend runs on port 3000
- CORS enabled for localhost:3000

## 🐛 Common Issues

### 1. Empty Dropdowns
- Check if hospital has data in Firestore
- Verify hospital_id is correct
- Check API endpoints return data

### 2. Authentication Issues
- Clear browser storage if stuck
- Check role assignments in Firestore
- Verify backend is running on port 5002

### 3. CORS Errors
- Ensure backend CORS is configured
- Check API base URLs in services
- Verify port numbers match

## 📝 Development Workflow

1. **Start Backend**: `python app.py` (port 5002)
2. **Start Frontend**: `npm run dev` (port 3000)
3. **Test Login**: Use valid credentials
4. **Check Role**: Ensure user has allowed role
5. **Test Features**: Submit claims, view profile, etc.

## 🔍 Debugging

### Console Logs
- Authentication flow logs in browser console
- API request/response logs
- Error messages for failed requests

### Network Tab
- Check API calls in browser dev tools
- Verify request/response data
- Look for 403/401 errors

### Backend Logs
- Flask app logs in terminal
- Database query logs
- Authentication logs

## 📞 Support

For backend issues, check:
- Flask app logs
- Firestore data
- API endpoint responses

For frontend issues, check:
- Browser console
- Network tab
- Component state
- Authentication context
