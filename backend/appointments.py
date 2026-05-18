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

# ==========================================
# 1. FETCH APPOINTMENTS BASED ON USER ROLE
# ==========================================
@appointments_bp.route('/my-slots', methods=['GET'])
@jwt_required()
def get_my_appointments():
    try:
        # get_jwt_identity() retrieves the user dict passed during login/auth
        current_user = get_jwt_identity()
        user_role = current_user.get('role')
        user_name = current_user.get('name')

        query = {}
        
        # Filter data based on who is asking
        if user_role == 'doctor':
            # Match the exact string selected in the dropdown menu (e.g., "Dr. Smith (Cardiologist)")
            # If your doctor registers with just their name, we check if their name is contained inside the selection string
            query = {"doctor_name": {"$regex": user_name, "$options": "i"}}
        else:
            # If they are a patient, query using their full registered name
            query = {"patient_name": user_name}

        # Fetch records and reverse list so newest submissions show up at the top
        appointments = list(appointments_collection.find(query).sort("_id", -1))

        # Format MongoDB ObjectIds to strings so React can read them as keys
        for app in appointments:
            app['_id'] = str(app['_id'])

        return jsonify(appointments), 200

    except Exception as e:
        return jsonify({"error": f"Internal database fetch crash: {str(e)}"}), 500


# ==========================================
# 2. UPDATE APPOINTMENT STATUS (DOCTORS ONLY)
# ==========================================
@appointments_bp.route('/update/<appointment_id>', methods=['REST', 'PUT'])
@jwt_required()
def update_appointment_status(appointment_id):
    try:
        current_user = get_jwt_identity()
        
        # Protection guard: Only doctors can edit appointment states
        if current_user.get('role') != 'doctor':
            return jsonify({"error": "Unauthorized Access. Patient accounts cannot modify clinical grids."}), 403

        data = request.get_json()
        new_status = data.get('status') # Expecting 'Approved' or 'Completed'

        if not new_status:
            return jsonify({"error": "Missing new status property."}), 400

        # Run updating operation inside MongoDB
        result = appointments_collection.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"status": new_status}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Target appointment object record could not be found."}), 404

        return jsonify({"message": f"Appointment status successfully synchronized to '{new_status}'."}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to modify record: {str(e)}"}), 500