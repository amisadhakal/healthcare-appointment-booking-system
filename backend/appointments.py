import os
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity

appointments_bp = Blueprint('appointments', __name__)

# Connect to your local MongoDB instance
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['habs_healthcare_db']
appointments_collection = db['appointments']
users_collection = db['users']

# ==========================================
# 1. BOOK AN APPOINTMENT (POST)
# ==========================================
@appointments_bp.route('/book', methods=['POST'])
@jwt_required()
def book_appointment():
    try:
        identity = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided in the request body."}), 400

        doctor_name = data.get('doctor_name')
        date = data.get('date')
        
        # Determine the patient name from token or request body
        user_name = None
        if isinstance(identity, dict):
            user_name = identity.get('name')
        else:
            user_profile = users_collection.find_one({
                "$or": [
                    {"email": identity},
                    {"_id": ObjectId(identity) if ObjectId.is_valid(identity) else None}
                ]
            })
            if user_profile:
                user_name = user_profile.get('name')

        patient_name = data.get('patient_name') or user_name or "Patient"

        if not doctor_name or not date:
            return jsonify({"error": "Missing specialist choice or preferred date."}), 400

        # Create the appointment document
        new_appointment = {
            "patient_name": patient_name.strip(),
            "doctor_name": doctor_name.strip(),
            "date": date.strip(),
            "status": "pending"
        }

        appointments_collection.insert_one(new_appointment)
        return jsonify({"message": "Consultation slot successfully requested!"}), 201

    except Exception as e:
        print(f"CRITICAL BOOKING ERROR: {str(e)}")
        return jsonify({"error": f"Internal server error while booking: {str(e)}"}), 500


# ==========================================
# 2. FETCH APPOINTMENTS BASED ON USER ROLE (GET)
# ==========================================
@appointments_bp.route('/my-slots', methods=['GET'])
@jwt_required()
def get_my_appointments():
    try:
        identity = get_jwt_identity()
        
        user_role = None
        user_name = None

        if isinstance(identity, dict):
            user_role = identity.get('role')
            user_name = identity.get('name')
        else:
            user_profile = users_collection.find_one({
                "$or": [
                    {"email": identity},
                    {"_id": ObjectId(identity) if ObjectId.is_valid(identity) else None}
                ]
            })
            if user_profile:
                user_role = user_profile.get('role')
                user_name = user_profile.get('name')

        if not user_name or not user_role:
            return jsonify({"error": "Invalid token signature context mapping."}), 401

        query = {}
        
        if user_role == 'doctor':
            query = {"doctor_name": {"$regex": user_name, "$options": "i"}}
        else:
            query = {"patient_name": {"$regex": f"^{user_name}$", "$options": "i"}}

        appointments = list(appointments_collection.find(query).sort("_id", -1))

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
        user_role = identity.get('role') if isinstance(identity, dict) else None

        if not user_role:
            user_profile = users_collection.find_one({
                "$or": [
                    {"email": identity},
                    {"_id": ObjectId(identity) if ObjectId.is_valid(identity) else None}
                ]
            })
            if user_profile:
                user_role = user_profile.get('role')

        if user_role != 'doctor':
            return jsonify({"error": "Unauthorized Access. Patient accounts cannot modify clinical grids."}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing payload body data."}), 400
            
        new_status = data.get('status')

        if not new_status:
            return jsonify({"error": "Missing new status property."}), 400

        result = appointments_collection.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"status": new_status}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Target appointment object record could not be found."}), 404

        return jsonify({"message": f"Appointment status successfully synchronized to '{new_status}'."}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to modify record: {str(e)}"}), 500