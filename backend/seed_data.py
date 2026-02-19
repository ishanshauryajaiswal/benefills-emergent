"""
Seed script to populate initial data for Benefills store
Run with: python seed_data.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from utils.auth import get_password_hash
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initial products data
products = [
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
        'isActive': True
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
        'isActive': True
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
        'isActive': True
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
        'isActive': True
    }
]

# Coupons data
coupons = [
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

# Admin user
admin_user = {
    'id': 'admin-001',
    'name': 'Admin',
    'email': 'admin@benefills.com',
    'password': get_password_hash('admin123'),  # Change this in production!
    'role': 'admin',
    'phone': '',
    'addresses': []
}

async def seed_database():
    print("🌱 Starting database seeding...")
    
    # Clear existing data
    await db.products.delete_many({})
    await db.users.delete_many({})
    print("✓ Cleared existing data")
    
    # Insert products
    await db.products.insert_many(products)
    print(f"✓ Inserted {len(products)} products")
    
    # Insert admin user
    await db.users.insert_one(admin_user)
    print("✓ Inserted admin user")
    
    # Create indexes
    await db.products.create_index("id", unique=True)
    await db.orders.create_index("id", unique=True)
    await db.users.create_index("email", unique=True)
    print("✓ Created database indexes")
    
    print("\n✅ Database seeding completed!")
    print("\n📝 Admin credentials:")
    print("   Email: admin@benefills.com")
    print("   Password: admin123")
    print("\n⚠️  Remember to change the admin password in production!")

if __name__ == '__main__':
    asyncio.run(seed_database())
    client.close()
