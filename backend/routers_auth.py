from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from db_client import get_db
from utils_jwt import create_token, require_user
import random, time

router = APIRouter(prefix="/auth", tags=["auth"])

class RequestOtp(BaseModel):
    phone: str

class VerifyOtp(BaseModel):
    phone: str
    code: str

class ProfileUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    region: str | None = None
    landSize: float | None = None
    landUnit: str | None = None
    preferredLanguage: str | None = None

@router.post("/request-otp")
async def request_otp(body: RequestOtp):
    # mock OTP for dev
    db = get_db()
    code = str(random.randint(100000, 999999))
    await db.otps.insert_one({"phone": body.phone, "code": code, "expiresAt": int(time.time()) + 300})
    return {"ok": True, "dev_code": code}

@router.post("/verify-otp")
async def verify_otp(body: VerifyOtp):
    db = get_db()
    rec = await db.otps.find_one({"phone": body.phone, "code": body.code})
    if not rec or rec.get("expiresAt", 0) < int(time.time()):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = await db.users.find_one({"phone": body.phone})
    if not user:
        res = await db.users.insert_one({"phone": body.phone, "createdAt": int(time.time())})
        user_id = str(res.inserted_id)
        user = {"_id": ObjectId(user_id), "phone": body.phone}
    token = create_token({"userId": str(user["_id"])})
    return {"token": token, "user": {"id": str(user["_id"]), "phone": user["phone"]}}

@router.get("/me")
async def me(claims = Depends(require_user)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(claims["userId"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = str(user.pop("_id"))
    return user

@router.patch("/me")
async def update_me(body: ProfileUpdate, claims = Depends(require_user)):
    db = get_db()
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if updates:
        await db.users.update_one({"_id": ObjectId(claims["userId"])}, {"$set": updates})
    user = await db.users.find_one({"_id": ObjectId(claims["userId"])})
    user["id"] = str(user.pop("_id"))
    return user


