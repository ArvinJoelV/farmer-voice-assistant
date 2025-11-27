#!/usr/bin/env python3
"""
Clear old OTPs and add a fresh test OTP
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db_client import get_db

async def clear_and_add_test_otp():
    """
    Clear old OTPs and add a fresh test OTP
    """
    print("🧹 Clearing old OTPs and adding fresh test OTP...")
    
    db = get_db()
    
    # Clear all old OTPs
    result = await db.otps.delete_many({})
    print(f"🗑️  Cleared {result.deleted_count} old OTPs")
    
    # Add fresh test OTP
    test_otp = {
        "phone": "+919876543210",
        "code": "123456",
        "expiresAt": int(datetime.now().timestamp()) + 300  # 5 minutes from now
    }
    
    await db.otps.insert_one(test_otp)
    print("✅ Fresh test OTP added")
    print("🧪 Test credentials:")
    print("   Phone: +919876543210")
    print("   OTP: 123456")
    print("   Valid for: 5 minutes")

if __name__ == "__main__":
    try:
        asyncio.run(clear_and_add_test_otp())
        print("\n🎉 Ready for testing!")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)



