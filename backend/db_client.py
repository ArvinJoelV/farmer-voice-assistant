import os
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Atlas connection string
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://admin:0@farmer-app.tmrpugk.mongodb.net/?retryWrites=true&w=majority&appName=farmer-app")
DB_NAME = os.getenv("DB_NAME", "farmer_assistant")

_client: AsyncIOMotorClient | None = None

def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URI)
    return _client

def get_db():
    return get_client()[DB_NAME]

async def init_database():
    """
    Initialize database collections and indexes
    """
    db = get_db()
    
    # Create indexes for better performance
    await db.users.create_index("phone", unique=True)
    await db.users.create_index("createdAt")
    
    await db.otps.create_index("phone")
    await db.otps.create_index("expiresAt", expireAfterSeconds=0)  # TTL index for auto-cleanup
    await db.otps.create_index([("phone", 1), ("code", 1)])
    
    print("✅ Database initialized successfully!")
    print(f"📊 Database: {DB_NAME}")
    print("📋 Collections: users, otps")
    print("🔍 Indexes created for optimal performance")

async def test_connection():
    """
    Test database connection
    """
    try:
        client = get_client()
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False



