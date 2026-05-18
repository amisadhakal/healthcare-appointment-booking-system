import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, jwt_required

# Import the blueprint from your new auth.py file
from auth import auth_bp

load_dotenv()

app = Flask(__name__)

# Setup JWT security keys
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this")
jwt = JWTManager(app)

# Allow React to communicate across origins
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Register the Authentication Blueprint under the '/api/auth' prefix
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Connect to MongoDB Local Server
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["habs_healthcare_db"]
appointments_collection = db["appointments"]

# Keep your appointment booking route right here in app.py
@app.route('/api/appointments/book', methods=['POST'])
@jwt_required() # Optional: Protects the route so only logged-in users can book
def book_appointment():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        result = appointments_collection.insert_one(data)
        return jsonify({
            "message": "Appointment booked successfully!",
            "appointment_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)