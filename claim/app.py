"""
Main application entry point
Hospital Claim Management System
"""
from app import create_app
from app.config.config import Config

# Create Flask application
app = create_app()

# Add basic routes
@app.route('/')
def home():
    """Home endpoint with API information"""
    return {
        'message': 'Welcome to the Hospital Claim Management System',
        'version': '1.0.0',
        'description': 'This system is restricted to hospital users only',
        'endpoints': {
            'auth': '/api/auth',
            'users': '/api/users'
        },
        'registration': {
            'note': 'Hospital registration requires a valid hospital code',
            'valid_codes': Config.VALID_HOSPITAL_CODES
        }
    }

@app.route('/health')
def health():
    """Health check endpoint"""
    from datetime import datetime
    return {
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'service': 'Hospital Claim Management System'
    }

if __name__ == '__main__':
    app.run(
        debug=Config.DEBUG,
        host=Config.HOST,
        port=Config.PORT
    )
