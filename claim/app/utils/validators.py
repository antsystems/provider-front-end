"""
Validation utilities for the application
"""
import re
from typing import Dict, List, Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> Dict[str, bool]:
    """Validate password strength"""
    return {
        'has_min_length': len(password) >= 8,
        'has_uppercase': any(c.isupper() for c in password),
        'has_lowercase': any(c.islower() for c in password),
        'has_digit': any(c.isdigit() for c in password),
        'has_special': any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)
    }

def validate_hospital_code(code: str, valid_codes: List[str]) -> bool:
    """Validate hospital code"""
    return code in valid_codes

def validate_claim_data(data: Dict) -> Dict[str, str]:
    """Validate claim data"""
    errors = {}
    
    required_fields = ['title', 'description', 'amount', 'patientName']
    for field in required_fields:
        if field not in data or not data[field]:
            errors[field] = f'{field} is required'
    
    # Validate amount
    if 'amount' in data:
        try:
            amount = float(data['amount'])
            if amount <= 0:
                errors['amount'] = 'Amount must be greater than 0'
        except (ValueError, TypeError):
            errors['amount'] = 'Amount must be a valid number'
    
    return errors
