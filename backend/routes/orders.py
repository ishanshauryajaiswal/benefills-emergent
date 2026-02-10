from fastapi import APIRouter, HTTPException, status, Depends, Header
from motor.motor_asyncio import AsyncIOMotorClient
from models.order import Order, OrderCreate, OrderStatusUpdate
from typing import List, Optional
import os

router = APIRouter(prefix='/api/orders', tags=['orders'])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post('/', response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    """
    Create new order (guest or authenticated user)
    """
    # Validate stock availability
    for item in order.items:
        product = await db.products.find_one({'id': item.productId})
        if not product:
            raise HTTPException(status_code=400, detail=f'Product {item.name} not found')
        if product['stock'] < item.quantity:
            raise HTTPException(status_code=400, detail=f'Insufficient stock for {item.name}')
    
    # Create order
    order_obj = Order(**order.dict())
    await db.orders.insert_one(order_obj.dict())
    
    # Update product stock
    for item in order.items:
        await db.products.update_one(
            {'id': item.productId},
            {'$inc': {'stock': -item.quantity}}
        )
    
    return order_obj

@router.get('/', response_model=List[Order])
async def get_orders(user_id: Optional[str] = None):
    """
    Get orders (filter by userId if provided)
    """
    query = {}
    if user_id:
        query['userId'] = user_id
    
    orders = await db.orders.find(query).sort('createdAt', -1).to_list(100)
    return [Order(**order) for order in orders]

@router.get('/{order_id}', response_model=Order)
async def get_order(order_id: str):
    """
    Get single order by ID
    """
    order = await db.orders.find_one({'id': order_id})
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    return Order(**order)

@router.put('/{order_id}/status', response_model=Order)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate):
    """
    Update order status (Admin only - will add auth later)
    """
    from datetime import datetime
    
    result = await db.orders.update_one(
        {'id': order_id},
        {'$set': {'status': status_update.status, 'updatedAt': datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='Order not found')
    
    updated_order = await db.orders.find_one({'id': order_id})
    return Order(**updated_order)
