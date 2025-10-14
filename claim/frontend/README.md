# IP Claim Submission Frontend

A modern React-based frontend for submitting IP (Inpatient) claims to the Hospital Claim Management System.

## Features

✅ **Comprehensive Form** - All 51 required fields organized into 4 sections  
✅ **Real-time Validation** - Form validation with required field indicators  
✅ **Beautiful UI** - Modern, gradient-based design with smooth animations  
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile  
✅ **Error Handling** - Clear success/error messages for user feedback  
✅ **Auto-reset** - Form automatically clears after successful submission  

## Form Sections

### 1. Patient Details
- Patient Name, Age, Gender
- ID Card Type & Number
- Contact Information
- Beneficiary Type & Relationship

### 2. Payer Details
- Payer Patient ID & Authorization
- Payer Type & Name
- Insurance Information
- Corporate/Sponsorer Details

### 3. Provider Details
- Registration & Patient Numbers
- Specialty & Doctor
- Treatment Details
- Admission Information
- Diagnosis & Treatment Codes

### 4. Bill Details
- Bill Number & Date
- Amount Breakdowns
- Discounts & Payments
- Claimed Amount
- Submission Remarks

## Installation

```bash
# Navigate to frontend directory
cd /Users/snehapatil/Desktop/claim/frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## Backend Setup

Make sure your Flask backend is running on `http://localhost:5000`

```bash
# In the main project directory
cd /Users/snehapatil/Desktop/claim
source venv/bin/activate
python main.py
```

## API Endpoint

The form submits to: `POST http://localhost:5000/api/claims/submit`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Technologies Used

- **React 18.2** - UI Framework
- **CSS3** - Modern styling with gradients and animations
- **Fetch API** - HTTP requests to backend

## Form Validation

All fields marked with `*` are required. The form will not submit until all required fields are filled.

## Success/Error Handling

- **Success**: Green alert with Claim ID
- **Error**: Red alert with error message
- Form automatically resets after successful submission

## Customization

### Change Colors

Edit `src/IPClaimForm.css` - look for gradient colors:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add New Fields

1. Add to `formData` state in `IPClaimForm.jsx`
2. Add input field in the appropriate section
3. Backend will automatically receive the new field

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Hospital Claim Management System - MedVerve
