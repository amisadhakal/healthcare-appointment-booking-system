import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

# 1. Import your blueprints
from auth import auth_bp
from appointments import appointments_bp  # <--- Added our new blueprint import

load_dotenv()

app = Flask(__name__)

# Setup JWT security keys
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this")
jwt = JWTManager(app)

# Allow React to communicate across origins
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# 2. Register Blueprints under clean prefixes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(appointments_bp, url_prefix='/api/appointments')  # <--- Added route registration

# Connect to MongoDB Local Server
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['habs_healthcare_db']

@app.route('/')
def home():
    return jsonify({"status": "HABS System Core Online"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)