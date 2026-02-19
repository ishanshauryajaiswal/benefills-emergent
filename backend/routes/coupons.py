from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from models.coupon import Coupon, CouponCreate, CouponValidate, CouponValidateResponse
from typing import List
from datetime import datetime
import os

router = APIRouter(prefix='/api/coupons', tags=['coupons'])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get('/', response_model=List[Coupon])
async def get_active_coupons():
    """
    Get all active coupons
    """
    query = {'isActive': True}
    
    # Filter out expired coupons
    coupons = await db.coupons.find(query).to_list(100)
    active_coupons = []
    
    for coupon in coupons:
        coupon_obj = Coupon(**coupon)
        # Check if expired
        if coupon_obj.expiryDate and coupon_obj.expiryDate < datetime.utcnow():
            continue
        # Check if usage limit reached
        if coupon_obj.usageLimit and coupon_obj.usageCount >= coupon_obj.usageLimit:
            continue
        active_coupons.append(coupon_obj)
    
    return active_coupons

@router.post('/validate', response_model=CouponValidateResponse)
async def validate_coupon(data: CouponValidate):
    """
    Validate a coupon code and calculate discount
    """
    # Find coupon
    coupon_data = await db.coupons.find_one({'code': data.code.upper(), 'isActive': True})
    
    if not coupon_data:
        return CouponValidateResponse(
            valid=False,
            discountAmount=0,
            message='Invalid coupon code'
        )
    
    coupon = Coupon(**coupon_data)
    
    # Check expiry
    if coupon.expiryDate and coupon.expiryDate < datetime.utcnow():
        return CouponValidateResponse(
            valid=False,
            discountAmount=0,
            message='Coupon has expired'
        )
    
    # Check usage limit
    if coupon.usageLimit and coupon.usageCount >= coupon.usageLimit:
        return CouponValidateResponse(
            valid=False,
            discountAmount=0,
            message='Coupon usage limit reached'
        )
    
    # Check minimum order amount
    if data.orderAmount < coupon.minOrderAmount:
        return CouponValidateResponse(
            valid=False,
            discountAmount=0,
            message=f'Minimum order amount ₹{coupon.minOrderAmount} required'
        )
    
    # Calculate discount
    if coupon.discountType == 'percentage':
        discount = (data.orderAmount * coupon.discountValue) / 100
        if coupon.maxDiscountAmount:
            discount = min(discount, coupon.maxDiscountAmount)
    else:  # fixed
        discount = coupon.discountValue
    
    discount = round(discount, 2)
    
    return CouponValidateResponse(
        valid=True,
        discountAmount=discount,
        message=f'Coupon applied! You saved ₹{discount}',
        coupon=coupon
    )

@router.post('/', response_model=Coupon, status_code=status.HTTP_201_CREATED)
async def create_coupon(coupon: CouponCreate):
    """
    Create new coupon (Admin only)
    """
    # Check if code already exists
    existing = await db.coupons.find_one({'code': coupon.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail='Coupon code already exists')
    
    coupon_obj = Coupon(**coupon.dict(), code=coupon.code.upper())
    await db.coupons.insert_one(coupon_obj.dict())
    return coupon_obj

@router.delete('/{coupon_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_coupon(coupon_id: str):
    """
    Deactivate coupon (Admin only)
    """
    result = await db.coupons.update_one(
        {'id': coupon_id},
        {'$set': {'isActive': False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='Coupon not found')
    
    return None

@router.post('/{coupon_id}/increment-usage')
async def increment_coupon_usage(coupon_id: str):
    """
    Increment coupon usage count (called after successful order)
    """
    result = await db.coupons.update_one(
        {'id': coupon_id},
        {'$inc': {'usageCount': 1}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='Coupon not found')
    
    return {'message': 'Usage count updated'}
