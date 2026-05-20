import os
from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity

appointments_bp = Blueprint('appointments', __name__)

# ==========================================
# HELPER: DYNAMIC DB DATABASE ACCESS LINK
# ==========================================
def get_db():
    """
    Dynamically fetches the single unified database context pooled by app.py.
    This guarantees that connections never lock or collide.
    """
    # Fallback to a local instance only if running outside a live Flask server context
    if not current_app:
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        return MongoClient(MONGO_URI)['habs_healthcare_db']
    
    # Imports the clean, established pool directly from your central app script
    from app import db
    return db

# ==========================================
# 1. BOOK AN APPOINTMENT (POST)
# ==========================================
@appointments_bp.route('/book', methods=['POST'])
@jwt_required()
def book_appointment():
    try:
        identity = get_jwt_identity()
        data = request.get_json()
        db_instance = get_db()

        if not data:
            return jsonify({"error": "No data provided in the request body."}), 400

        doctor_name = data.get('doctor_name')
        date = data.get('date')
        incoming_email = data.get('patient_email')

        user_name = None
        user_email = None

        if isinstance(identity, dict):
            user_name = identity.get('name')
            user_email = identity.get('email')
        else:
            user_profile = db_instance['users'].find_one({
                "$or": [
                    {"email": identity},
                    {"_id": ObjectId(identity) if ObjectId.is_valid(identity) else None}
                ]
            })
            if user_profile:
                user_name = user_profile.get('name')
                user_email = user_profile.get('email')

        final_email = incoming_email or user_email or "unknown@healthcare.com"
        final_patient_name = user_name or "Patient"

        if not doctor_name or not date:
            return jsonify({"error": "Missing specialist choice or preferred date."}), 400

        new_appointment = {
            "patient_name": str(final_patient_name).strip(),
            "patient_email": str(final_email).strip().lower(),
            "doctor_name": str(doctor_name).strip(),
            "date": str(date).strip(),
            "status": "pending"
        }

        db_instance['appointments'].insert_one(new_appointment)
        return jsonify({"message": "Consultation slot successfully requested!"}), 201

    except Exception as e:
        print(f"CRITICAL BOOKING ERROR: {str(e)}")
        return jsonify({"error": f"Internal server error while booking: {str(e)}"}), 500


# ==========================================
# 2. FETCH APPOINTMENTS VIA IDENTIFIER MATRIX (GET)
# ==========================================
@appointments_bp.route('/my-slots', methods=['GET'])
@jwt_required()
def get_my_appointments():
    try:
        identity = get_jwt_identity()
        db_instance = get_db()
        
        user_role = None
        user_name = None
        user_email = None

        if isinstance(identity, dict):
            user_role = identity.get('role')
            user_name = identity.get('name')
            user_email = identity.get('email')
        else:
            user_profile = db_instance['users'].find_one({
                "$or": [
                    {"email": identity},
                    {"_id": ObjectId(identity) if ObjectId.is_valid(identity) else None}
                ]
            })
            if user_profile:
                user_role = user_profile.get('role')
                user_name = user_profile.get('name')
                user_email = user_profile.get('email')

        if not user_email and isinstance(identity, str) and "@" in identity:
            user_email = identity

        query = {}
        
        if str(user_role).lower() == 'doctor':
            query = {"doctor_name": {"$regex": user_name or "", "$options": "i"}}
        else:
            query = {"patient_email": str(user_email or "").strip().lower()}

        appointments = list(db_instance['appointments'].find(query).sort("_id", -1))

        for app in appointments:
            app['_id'] = str(app['_id'])

        return jsonify(appointments), 200

    except Exception as e:
        print(f"CRITICAL FETCH ERROR: {str(e)}")
        return jsonify({"error": f"Internal database fetch crash: {str(e)}"}), 500


# ==========================================
# 3. UPDATE APPOINTMENT STATUS (DOCTORS ONLY)
# ==========================================
@appointments_bp.route('/update/<appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment_status(appointment_id):
    try:
        identity = get_jwt_identity()
        db_instance = get_db()
        
        user_role = identity.get('role') if isinstance(identity, dict) else None

        if not user_role:
            user_profile = db_instance['users'].find_one({
                "$or": [
                    {"email": identity},
                    {"_id": ObjectId(identity) if ObjectId.is_valid(identity) else None}
                ]
            })
            if user_profile:
                user_role = user_profile.get('role')

        if str(user_role).lower() != 'doctor':
            return jsonify({"error": "Unauthorized Access. Patient accounts cannot modify clinical grids."}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing payload body data."}), 400
            
        new_status = data.get('status')

        if not new_status:
            return jsonify({"error": "Missing new status property."}), 400

        result = db_instance['appointments'].update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"status": new_status}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Target appointment object record could not be found."}), 404

        return jsonify({"message": f"Appointment status successfully synchronized to '{new_status}'."}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to modify record: {str(e)}"}), 500