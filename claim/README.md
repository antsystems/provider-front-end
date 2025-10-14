# Hospital Claims Management System

A comprehensive hospital claims management system built with Flask (Python) backend and Next.js (React) frontend, integrated with Firebase for authentication, database, and file storage.

## 🚀 Features

### ✅ Core Functionality
- **Claims Management**: Submit, track, and manage insurance claims
- **Draft System**: Save incomplete claims and submit later
- **Document Checklist**: Dynamic document requirements based on payer and specialty
- **Document Upload**: Secure file upload and management
- **Authentication**: Role-based access control with Firebase Auth
- **Workflow Management**: Inbox system for claim processing
- **User Management**: Complete user administration system

### ✅ API Modules (9 Complete Modules)
1. **Authentication API** - User login and token management
2. **Claims API** - Claim submission and management
3. **Drafts API** - Draft save/retrieve/submit functionality
4. **Checklist API** - Document requirements management
5. **Documents API** - File upload/download management
6. **Resources API** - Reference data (payers, specialties, doctors)
7. **Inbox API** - Workflow and assignment management
8. **Users API** - User profile and administration
9. **Firebase API** - Health checks and system monitoring

## 🛠️ Technology Stack

### Backend
- **Python 3.13+**
- **Flask** - Web framework
- **Firebase Admin SDK** - Authentication and database
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Shadcn/ui** - UI components

## 📋 Prerequisites

- Python 3.13+
- Node.js 18+
- Firebase project with Firestore and Storage enabled
- Firebase service account key

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/medverve/Claims.git
cd Claims
```

### 2. Backend Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add Firebase service account key
# Place your ServiceAccountKey.json in the root directory

# Start the backend server
python app.py
```

The backend will be available at `http://localhost:5002`

### 3. Frontend Setup
```bash
cd frontend/Claims\ Front\ END

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

Complete API documentation is available in the following files:

- **`API_DOCUMENTATION_OVERVIEW.md`** - Master overview and quick start
- **`API_DOCUMENTATION_AUTH.md`** - Authentication API
- **`API_DOCUMENTATION_CLAIMS.md`** - Claims API
- **`API_DOCUMENTATION_DRAFTS.md`** - Drafts API
- **`API_DOCUMENTATION_CHECKLIST.md`** - Document Checklist API
- **`API_DOCUMENTATION_DOCUMENTS.md`** - Documents API
- **`API_DOCUMENTATION_RESOURCES.md`** - Resources API
- **`API_DOCUMENTATION_INBOX.md`** - Inbox API
- **`API_DOCUMENTATION_USERS.md`** - Users API
- **`API_DOCUMENTATION_FIREBASE.md`** - Firebase API

## 🔐 Authentication

### Test Credentials
- **Email**: `employee@test.com`
- **Password**: `password123`
- **Role**: `hospital_user`

### Allowed Roles
- `hospital_user` - Hospital staff who can submit claims
- `claim_processor` - Staff who can process claims
- `reconciler` - Staff who can reconcile claims

## 🧪 Testing

### Test API Endpoints
```bash
# Login
curl -X POST "http://localhost:5002/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "employee@test.com", "password": "password123"}'

# Get Checklist (Test endpoint)
curl -X GET "http://localhost:5002/api/v1/checklist/get-checklist-test?payer_name=CGHS&specialty=Cardiology"

# Get Drafts (Test endpoint)
curl -X GET "http://localhost:5002/api/v1/drafts/get-drafts-test"
```

## 📊 Current Status

### ✅ Working Components
- **Authentication System** - Login and token generation
- **Checklist System** - Document requirements display
- **Drafts System** - Save and retrieve drafts
- **Claims System** - Submit and manage claims
- **Document Management** - Upload and download files
- **User Management** - Profile and administration

### ⚠️ Development Notes
- Test endpoints are active for development
- Authentication middleware needs token type fix for production
- All core functionality is working

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
FIREBASE_CREDENTIALS_PATH=ServiceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Enable Firebase Storage
4. Generate service account key
5. Place `ServiceAccountKey.json` in root directory

## 📁 Project Structure

```
├── app/                          # Flask backend
│   ├── routes/                   # API endpoints
│   ├── middleware/               # Authentication middleware
│   ├── config/                   # Configuration files
│   └── utils/                    # Utility functions
├── frontend/Claims Front END/    # Next.js frontend
│   ├── src/app/                  # App pages
│   ├── src/components/           # React components
│   ├── src/services/             # API services
│   └── src/types/                # TypeScript types
├── API_DOCUMENTATION_*.md        # Complete API docs
├── CURRENT_STATUS_AND_FIXES.md   # Current status
└── README.md                     # This file
```

## 🚀 Deployment

### Production Checklist
1. Fix authentication middleware token type handling
2. Remove test endpoints
3. Configure production Firebase project
4. Set up environment variables
5. Configure HTTPS
6. Set up monitoring and logging

## 📞 Support

For support and questions:
- Check the API documentation files
- Review `CURRENT_STATUS_AND_FIXES.md` for current issues
- Check troubleshooting guides in documentation

## 📄 License

This project is proprietary software developed for MedVerve.

## 🔄 Version

- **Version**: 1.0.0
- **Last Updated**: January 15, 2024
- **Status**: Development Ready
