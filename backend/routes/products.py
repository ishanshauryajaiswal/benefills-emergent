from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from models.product import Product, ProductCreate, ProductUpdate
from typing import List, Optional
import os

router = APIRouter(prefix='/api/products', tags=['products'])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get('/', response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    sort: Optional[str] = 'default'
):
    """
    Get all active products with optional filtering and sorting
    """
    query = {'isActive': True}
    
    if category:
        query['category'] = category
    
    # Determine sort order
    sort_by = [('createdAt', -1)]  # default: newest first
    if sort == 'price-low':
        sort_by = [('price', 1)]
    elif sort == 'price-high':
        sort_by = [('price', -1)]
    elif sort == 'recent':
        sort_by = [('createdAt', -1)]
    
    products = await db.products.find(query).sort(sort_by).to_list(100)
    return [Product(**product) for product in products]

@router.get('/{product_id}', response_model=Product)
async def get_product(product_id: str):
    """
    Get single product by ID
    """
    product = await db.products.find_one({'id': product_id, 'isActive': True})
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    return Product(**product)

@router.post('/', response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    """
    Create new product (Admin only - will add auth later)
    """
    product_obj = Product(**product.dict())
    await db.products.insert_one(product_obj.dict())
    return product_obj

@router.put('/{product_id}', response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    """
    Update product (Admin only - will add auth later)
    """
    existing_product = await db.products.find_one({'id': product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail='Product not found')
    
    # Update only provided fields
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    
    if update_data:
        from datetime import datetime
        update_data['updatedAt'] = datetime.utcnow()
        await db.products.update_one({'id': product_id}, {'$set': update_data})
    
    updated_product = await db.products.find_one({'id': product_id})
    return Product(**updated_product)

@router.delete('/{product_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """
    Soft delete product by setting isActive to False (Admin only)
    """
    result = await db.products.update_one(
        {'id': product_id},
        {'$set': {'isActive': False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='Product not found')
    
    return None
