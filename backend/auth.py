import os
import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# 1. Initialize the Blueprint for authentication
auth_bp = Blueprint('auth', __name__)

# 2. Connect to the same MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["habs_healthcare_db"]
users_collection = db["users"]

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role', 'patient')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        if users_collection.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 400

        # Securely hash the password
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

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        user = users_collection.find_one({"email": email})
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            access_token = create_access_token(identity={"id": str(user['_id']), "role": user['role']})
            return jsonify({
                "message": "Login successful",
                "token": access_token,
                "user": {
                    "name": user.get('name'),
                    "email": user.get('email'),
                    "role": user.get('role')
                }
            }), 200
        
        return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500