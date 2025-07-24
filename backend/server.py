from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
import bcrypt
import jwt
import uuid
from typing import List, Optional
import random
import math

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'courier_db')
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# JWT configuration
SECRET_KEY = "courier_delivery_secret_key_2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Security
security = HTTPBearer()

# Database collections
users_collection = db.users
packages_collection = db.packages
tracking_collection = db.tracking

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "customer"  # customer, admin, delivery_agent

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Address(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    postal_code: str
    country: str = "India"

class PackageDetails(BaseModel):
    type: str  # document, parcel
    weight: float  # in kg
    length: float  # in cm
    width: float
    height: float
    description: str

class PackageCreate(BaseModel):
    sender: Address
    receiver: Address
    package_details: PackageDetails
    service_type: str  # standard, express, international
    pickup_date: str

class TrackingUpdate(BaseModel):
    tracking_id: str
    status: str
    location: str
    notes: str = ""

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = users_collection.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_distance(sender_city: str, receiver_city: str) -> float:
    # Mock distance calculation - in real app, use Google Maps API
    city_coordinates = {
        "mumbai": (19.0760, 72.8777),
        "delhi": (28.7041, 77.1025),
        "bangalore": (12.9716, 77.5946),
        "chennai": (13.0827, 80.2707),
        "kolkata": (22.5726, 88.3639),
        "hyderabad": (17.3850, 78.4867),
        "pune": (18.5204, 73.8567),
        "ahmedabad": (23.0225, 72.5714)
    }
    
    sender_lower = sender_city.lower()
    receiver_lower = receiver_city.lower()
    
    # Default coordinates if city not found
    sender_coords = city_coordinates.get(sender_lower, (20.0, 77.0))
    receiver_coords = city_coordinates.get(receiver_lower, (21.0, 78.0))
    
    # Haversine formula for distance calculation
    R = 6371  # Earth's radius in kilometers
    lat1, lon1 = math.radians(sender_coords[0]), math.radians(sender_coords[1])
    lat2, lon2 = math.radians(receiver_coords[0]), math.radians(receiver_coords[1])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c
    
    return max(distance, 50)  # Minimum 50km for local deliveries

def calculate_price(weight: float, distance: float, service_type: str) -> float:
    base_price = 100
    weight_rate = 20  # per kg
    distance_rate = 2  # per km
    
    service_multiplier = {
        "standard": 1.0,
        "express": 1.5,
        "international": 2.5
    }
    
    price = (base_price + (weight * weight_rate) + (distance * distance_rate)) * service_multiplier.get(service_type, 1.0)
    return round(price, 2)

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "courier-delivery-api"}

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create user document
    user_doc = {
        "user_id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": user.role,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = users_collection.insert_one(user_doc)
    if result.inserted_id:
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        return {
            "message": "User registered successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": user_doc["user_id"],
                "name": user_doc["name"],
                "email": user_doc["email"],
                "role": user_doc["role"]
            }
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to create user")

@app.post("/api/auth/login")
async def login(user_credentials: UserLogin):
    # Find user
    user = users_collection.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"]
    }

# Package endpoints
@app.post("/api/packages/calculate-price")
async def calculate_package_price(data: dict, current_user: dict = Depends(get_current_user)):
    sender_city = data.get("sender_city")
    receiver_city = data.get("receiver_city")
    weight = data.get("weight", 1.0)
    service_type = data.get("service_type", "standard")
    
    distance = calculate_distance(sender_city, receiver_city)
    price = calculate_price(weight, distance, service_type)
    
    return {
        "distance_km": round(distance, 2),
        "estimated_price": price,
        "service_type": service_type,
        "weight_kg": weight
    }

@app.post("/api/packages/create")
async def create_package(package_data: PackageCreate, current_user: dict = Depends(get_current_user)):
    # Generate tracking ID
    tracking_id = f"CD{random.randint(100000, 999999)}"
    
    # Calculate distance and price
    distance = calculate_distance(package_data.sender.city, package_data.receiver.city)
    price = calculate_price(package_data.package_details.weight, distance, package_data.service_type)
    
    # Create package document
    package_doc = {
        "package_id": str(uuid.uuid4()),
        "tracking_id": tracking_id,
        "user_id": current_user["user_id"],
        "sender": package_data.sender.dict(),
        "receiver": package_data.receiver.dict(),
        "package_details": package_data.package_details.dict(),
        "service_type": package_data.service_type,
        "pickup_date": package_data.pickup_date,
        "distance_km": distance,
        "price": price,
        "status": "order_placed",
        "created_at": datetime.utcnow(),
        "estimated_delivery": datetime.utcnow() + timedelta(days=3 if package_data.service_type == "standard" else 1)
    }
    
    result = packages_collection.insert_one(package_doc)
    
    if result.inserted_id:
        # Create initial tracking entry
        tracking_doc = {
            "tracking_id": tracking_id,
            "package_id": package_doc["package_id"],
            "status": "order_placed",
            "location": package_data.sender.city,
            "timestamp": datetime.utcnow(),
            "notes": "Order has been placed successfully"
        }
        tracking_collection.insert_one(tracking_doc)
        
        return {
            "message": "Package created successfully",
            "tracking_id": tracking_id,
            "package_id": package_doc["package_id"],
            "estimated_price": price,
            "estimated_delivery": package_doc["estimated_delivery"].isoformat()
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to create package")

@app.get("/api/packages/my-packages")
async def get_user_packages(current_user: dict = Depends(get_current_user)):
    packages = list(packages_collection.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1))
    
    return {"packages": packages}

@app.get("/api/packages/track/{tracking_id}")
async def track_package(tracking_id: str):
    # Get package details
    package = packages_collection.find_one({"tracking_id": tracking_id}, {"_id": 0})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Get tracking history
    tracking_history = list(tracking_collection.find(
        {"tracking_id": tracking_id},
        {"_id": 0}
    ).sort("timestamp", 1))
    
    return {
        "package": package,
        "tracking_history": tracking_history
    }

# Admin endpoints
@app.get("/api/admin/packages")
async def get_all_packages(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "delivery_agent"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    packages = list(packages_collection.find({}, {"_id": 0}).sort("created_at", -1))
    return {"packages": packages}

@app.post("/api/admin/update-status")
async def update_package_status(update_data: TrackingUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "delivery_agent"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update package status
    packages_collection.update_one(
        {"tracking_id": update_data.tracking_id},
        {"$set": {"status": update_data.status}}
    )
    
    # Add tracking entry
    tracking_doc = {
        "tracking_id": update_data.tracking_id,
        "status": update_data.status,
        "location": update_data.location,
        "timestamp": datetime.utcnow(),
        "notes": update_data.notes,
        "updated_by": current_user["user_id"]
    }
    tracking_collection.insert_one(tracking_doc)
    
    return {"message": "Status updated successfully"}

@app.get("/api/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_packages = packages_collection.count_documents({})
    delivered_packages = packages_collection.count_documents({"status": "delivered"})
    pending_packages = packages_collection.count_documents({"status": {"$ne": "delivered"}})
    total_users = users_collection.count_documents({"role": "customer"})
    
    return {
        "total_packages": total_packages,
        "delivered_packages": delivered_packages,
        "pending_packages": pending_packages,
        "total_users": total_users
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)