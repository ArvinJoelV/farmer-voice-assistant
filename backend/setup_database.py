#!/usr/bin/env python3
"""
Database Initialization Script for Farmer Assistant
This script sets up the MongoDB database with proper collections and indexes.
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db_client import get_db, test_connection, init_database

async def setup_database():
    """
    Set up the database with collections and sample data
    """
    print("🔧 Setting up Farmer Assistant Database...")
    print("=" * 50)
    
    # Test connection first
    if not await test_connection():
        print("❌ Cannot connect to MongoDB. Please check your connection string.")
        return False
    
    # Initialize database
    await init_database()
    
    # Add some sample data for testing
    await add_sample_data()
    
    print("=" * 50)
    print("✅ Database setup completed successfully!")
    print("🎉 You can now start the backend server!")
    
    return True

async def add_sample_data():
    """
    Add some sample data for testing
    """
    db = get_db()
    
    # Sample OTP data (will expire automatically)
    sample_otp = {
        "phone": "+919876543210",
        "code": "123456",
        "expiresAt": int(datetime.now().timestamp()) + 300  # 5 minutes from now
    }
    
    # Sample user data
    sample_user = {
        "phone": "+919876543210",
        "name": "Test Farmer",
        "role": "farmer",
        "region": "Tamil Nadu",
        "landSize": 2.5,
        "landUnit": "acres",
        "preferredLanguage": "ta",
        "createdAt": int(datetime.now().timestamp())
    }
    
    try:
        # Insert sample OTP (always insert new OTP for testing)
        await db.otps.insert_one(sample_otp)
        print("📱 Sample OTP added for testing")
        
        # Check if sample user already exists
        existing_user = await db.users.find_one({"phone": sample_user["phone"]})
        if not existing_user:
            await db.users.insert_one(sample_user)
            print("👤 Sample user added for testing")
        else:
            print("👤 Sample user already exists")
        
        print("🧪 Test credentials:")
        print("   Phone: +919876543210")
        print("   OTP: 123456")
        
    except Exception as e:
        print(f"⚠️  Sample data error: {e}")

async def show_database_info():
    """
    Show database information
    """
    db = get_db()
    
    print("\n📊 Database Information:")
    print(f"   Database: {db.name}")
    
    # Count documents in collections
    user_count = await db.users.count_documents({})
    otp_count = await db.otps.count_documents({})
    
    print(f"   Users: {user_count}")
    print(f"   OTPs: {otp_count}")
    
    # Show indexes
    print("\n🔍 Indexes:")
    user_indexes = await db.users.list_indexes().to_list(length=None)
    otp_indexes = await db.otps.list_indexes().to_list(length=None)
    
    print("   Users collection:")
    for index in user_indexes:
        print(f"     - {index['name']}")
    
    print("   OTPs collection:")
    for index in otp_indexes:
        print(f"     - {index['name']}")

async def main():
    """
    Main function to run setup and show info
    """
    print("🌱 Farmer Assistant Database Setup")
    print("=" * 50)
    
    # Run the setup
    success = await setup_database()
    
    if success:
        # Show database info
        await show_database_info()
        
        print("\n🚀 Next steps:")
        print("   1. Start the backend server: python main.py")
        print("   2. Test the authentication endpoints")
        print("   3. Run the frontend app")
    else:
        print("\n❌ Setup failed. Please check your MongoDB connection.")
        return False
    
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed with error: {e}")
        sys.exit(1)
