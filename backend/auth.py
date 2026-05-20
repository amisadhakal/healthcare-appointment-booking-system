import os
import bcrypt
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# 1. Initialize the Blueprint for authentication
auth_bp = Blueprint('auth', __name__)

# ==========================================
# HELPER: DYNAMIC DB DATABASE ACCESS LINK
# ==========================================
def get_db():
    """
    Dynamically fetches the single unified database context pooled by app.py.
    This guarantees that connections never lock or collide across blueprints.
    """
    if not current_app:
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        return MongoClient(MONGO_URI)['habs_healthcare_db']
    
    # Import the active pool established centrally in app.py
    from app import db
    return db


# ==========================================
# USER REGISTRATION ENDPOINT (POST & OPTIONS)
# ==========================================
@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    # Handle the browser preflight request instantly to avoid CORS blockades
    if request.method == 'OPTIONS':
        return jsonify({"status": "CORS preflight OK"}), 200

    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role', 'patient')

        # 💡 NEW LOCK: Intercept doctor registration and validate against the .env file
        if role == 'doctor':
            provided_key = data.get('verificationKey')
            # This scans your new .env file for DOCTOR_SECRET_KEY
            secret_system_key = os.getenv("DOCTOR_SECRET_KEY", "HABS-DOC-2026")
            
            if not provided_key or provided_key != secret_system_key:
                return jsonify({"error": "Unauthorized: Invalid Medical Practitioner Verification Key."}), 401

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        db_instance = get_db()
        users_collection = db_instance['users']

        if users_collection.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 400

        # Securely hash the password string before storing
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        users_collection.insert_one({
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role
        })

        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# USER LOGIN ENDPOINT (POST & OPTIONS)
# ==========================================
@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    # Handle the browser preflight request instantly to avoid CORS blockades
    if request.method == 'OPTIONS':
        return jsonify({"status": "CORS preflight OK"}), 200

    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        db_instance = get_db()
        users_collection = db_instance['users']

        user = users_collection.find_one({"email": email})
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            
            # 1. Clean frontend identity dictionary payload
            identity_payload = {
                "id": str(user['_id']),
                "name": user.get('name'),
                "email": user.get('email'),
                "role": user.get('role', 'patient')
            }
            
            # 2. FIX: Recent flask_jwt_extended versions strictly require identity to be a clean string
            access_token = create_access_token(identity=str(user["_id"]))
            
            return jsonify({
                "message": "Login successful",
                "token": access_token,
                "user": identity_payload
            }), 200
        
        return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500