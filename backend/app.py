import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# Ensure the current directory path is available to Flask for relative imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 1. Import the shared jwt manager instance from your extensions bridge
from extensions import jwt

# 2. Import your blueprints 
from auth import auth_bp
from appointments import appointments_bp 

load_dotenv()

app = Flask(__name__)

# ==========================================
# SYSTEM CORE SECURITY CONFIGURATIONS
# ==========================================
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this")

# Explicitly declare token lookup arrays to match frontend fetch standards
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

# CRITICAL LINK: Bind the shared jwt extension instance into active server memory
jwt.init_app(app)

# REMOVED: @jwt.user_identity_loader hook has been dropped to prevent token subject conflicts!

# Global CORS rules covering all route paths cleanly
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:5173", 
        "http://127.0.0.1:5173"
    ],
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}}, supports_credentials=True)

# ==========================================
# DATABASE ENGINE CONTEXT
# ==========================================
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['habs_healthcare_db']

# ==========================================
# BLUEPRINT ROUTE REGISTRATIONS
# ==========================================
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(appointments_bp, url_prefix='/api/appointments') 

# ==========================================
# CORE MONITORING ENDPOINTS
# ==========================================
@app.route('/')
def home():
    try:
        # Trigger quick server heartbeat check
        client.server_info()
        db_status = True
    except Exception:
        db_status = False

    return jsonify({
        "status": "HABS System Core Online",
        "database_connected": db_status
    }), 200

if __name__ == '__main__':
    # Enabled the auto-reloader so changes apply automatically when files save
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=True)