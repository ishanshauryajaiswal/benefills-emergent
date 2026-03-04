from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
import logging
from pathlib import Path

# Add backend directory to Python path
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

load_dotenv(ROOT_DIR / '.env')

# Import routes
from routes import products, orders, auth, coupons, payments, shiprocket

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Benefills E-commerce API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Benefills API is running", "status": "healthy"}

# Include all routers
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(auth.router)
app.include_router(coupons.router)
app.include_router(payments.router)
app.include_router(shiprocket.router)
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Benefills API starting up...")
    try:
        # Create indexes
        await db.products.create_index("id", unique=True)
        await db.orders.create_index("id", unique=True)
        await db.users.create_index("email", unique=True)
        await db.coupons.create_index("code", unique=True)
        await db.coupons.create_index("id", unique=True)
        logger.info("Database indexes created")
    except Exception as e:
        logger.error(f"Failed to create database indexes: {e}")
        logger.warning("Backend starting in degraded mode without MongoDB connection")

    # Auto-seed if products collection is empty
    product_count = await db.products.count_documents({})
    if product_count == 0:
        logger.info("No products found. Auto-seeding database...")
        await auto_seed_database()
        logger.info("Auto-seeding complete.")

async def auto_seed_database():
    from utils.auth import get_password_hash
    from datetime import datetime

    products_data = [
        {
            'id': '1',
            'name': 'Thyrovibe Seeds Boost Bar- pack of 7',
            'description': 'Crunchy, chewy energy bars packed with thyroid-supporting seeds and nutrients. Perfect grab-and-go snack.',
            'price': 410,
            'originalPrice': 490,
            'image': 'https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=768,fit=crop,q=100/cdn-ecommerce/store_01JV34HD4RNHZAHYNVCHTPM6QH/assets/d7dfeaea-8b58-4050-af66-914067979d02.png',
            'category': 'bars',
            'badge': 'most repurchased',
            'stock': 50,
            'ingredients': ['Pumpkin Seeds', 'Sunflower Seeds', 'Selenium', 'Zinc', 'No refined sugar'],
            'rating': 5.0,
            'reviews': 42,
            'isActive': True,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        },
        {
            'id': '2',
            'name': 'Thyrovibe Nut-ella Nut Butter',
            'description': 'Rich, creamy nut butter with adaptogens and thyroid-supporting minerals. Spread it, spoon it, love it.',
            'price': 650,
            'originalPrice': 750,
            'image': 'https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=768,fit=crop,q=100/cdn-ecommerce/store_01JV34HD4RNHZAHYNVCHTPM6QH/assets/da53d612-dd3d-4e7a-9df2-73c297921502.png',
            'category': 'nut-butter',
            'badge': 'bestseller',
            'stock': 35,
            'ingredients': ['Cacao', 'Hazelnuts', 'Ashwagandha', 'Pumpkin Seeds', 'No preservatives'],
            'rating': 5.0,
            'reviews': 89,
            'isActive': True,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        },
        {
            'id': '3',
            'name': 'Thyrovibe nut butters- the duo pack',
            'description': 'Two jars of thyroid-loving goodness. Mix and match your favorites for complete hormone support.',
            'price': 1200,
            'originalPrice': 1590,
            'image': 'https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=375,fit=crop,q=100/cdn-ecommerce/store_01JV34HD4RNHZAHYNVCHTPM6QH/assets/29648e82-16b5-4fa6-b8c0-c382f34e2144.png',
            'category': 'combo',
            'badge': '',
            'stock': 20,
            'ingredients': ['Premium Nut Butters', 'Selenium', 'Zinc', 'Adaptogens'],
            'rating': 5.0,
            'reviews': 67,
            'isActive': True,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        },
        {
            'id': '4',
            'name': 'Benefills Monthly Pack',
            'description': 'Complete monthly supply of bars and nut butters. Everything you need for consistent thyroid nourishment.',
            'price': 1900,
            'originalPrice': 2200,
            'image': 'https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=375,fit=crop,q=100/cdn-ecommerce/store_01JV34HD4RNHZAHYNVCHTPM6QH/assets/eb35c973-f306-4874-8c62-e5b5b8c371de.webp',
            'category': 'combo',
            'badge': '',
            'stock': 15,
            'ingredients': ['Complete variety pack', 'Full spectrum nutrients', '30-day supply'],
            'rating': 5.0,
            'reviews': 34,
            'isActive': True,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        },
        {
            'id': '5',
            'name': 'Thyrovibe Wellness Digital Ritual',
            'description': 'A complete digital guide and wellness ritual to support your daily thyroid health journey.',
            'price': 1,
            'originalPrice': 99,
            'image': 'https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=375,fit=crop,q=100/cdn-ecommerce/store_01JV34HD4RNHZAHYNVCHTPM6QH/assets/eb35c973-f306-4874-8c62-e5b5b8c371de.webp',
            'category': 'digital',
            'badge': 'new',
            'stock': 999,
            'ingredients': ['Digital Guide', 'Daily Ritual Tracker', 'Wellness Tips'],
            'rating': 5.0,
            'reviews': 15,
            'isActive': True,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
    ]

    coupons_data = [
        {
            'id': 'coupon-001',
            'code': 'FIRSTLOVE20',
            'discountType': 'percentage',
            'discountValue': 20.0,
            'minOrderAmount': 0,
            'maxDiscountAmount': 500,
            'description': '20% off on your first order',
            'isActive': True,
            'usageLimit': None,
            'usageCount': 0,
            'expiryDate': None
        },
        {
            'id': 'coupon-002',
            'code': 'THYROCARE15',
            'discountType': 'percentage',
            'discountValue': 15.0,
            'minOrderAmount': 1000,
            'maxDiscountAmount': 300,
            'description': '15% off on orders above ₹1000',
            'isActive': True,
            'usageLimit': 100,
            'usageCount': 0,
            'expiryDate': None
        },
        {
            'id': 'coupon-003',
            'code': 'FLAT100',
            'discountType': 'fixed',
            'discountValue': 100.0,
            'minOrderAmount': 500,
            'maxDiscountAmount': None,
            'description': 'Flat ₹100 off on orders above ₹500',
            'isActive': True,
            'usageLimit': None,
            'usageCount': 0,
            'expiryDate': None
        }
    ]

    try:
        await db.products.insert_many(products_data)
        logger.info(f"Seeded {len(products_data)} products")
    except Exception as e:
        logger.warning(f"Products seeding skipped (may already exist): {e}")

    coupon_count = await db.coupons.count_documents({})
    if coupon_count == 0:
        try:
            await db.coupons.insert_many(coupons_data)
            logger.info(f"Seeded {len(coupons_data)} coupons")
        except Exception as e:
            logger.warning(f"Coupons seeding skipped: {e}")

    admin_count = await db.users.count_documents({'role': 'admin'})
    if admin_count == 0:
        try:
            await db.users.insert_one({
                'id': 'admin-001',
                'name': 'Admin',
                'email': 'admin@benefills.com',
                'password': get_password_hash('admin123'),
                'role': 'admin',
                'phone': '',
                'addresses': []
            })
            logger.info("Seeded admin user")
        except Exception as e:
            logger.warning(f"Admin seeding skipped: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Database connection closed")
