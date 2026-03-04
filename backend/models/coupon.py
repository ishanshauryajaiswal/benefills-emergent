from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Coupon(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str  # e.g., "FIRSTLOVE20"
    discountType: str  # "percentage" or "fixed"
    discountValue: float  # 20 for 20% or 100 for ₹100
    minOrderAmount: float = 0  # Minimum order amount to apply
    maxDiscountAmount: Optional[float] = None  # Max discount cap
    description: str
    isActive: bool = True
    usageLimit: Optional[int] = None  # Total usage limit
    usageCount: int = 0  # Current usage count
    expiryDate: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class CouponCreate(BaseModel):
    code: str
    discountType: str
    discountValue: float
    minOrderAmount: float = 0
    maxDiscountAmount: Optional[float] = None
    description: str
    usageLimit: Optional[int] = None
    expiryDate: Optional[datetime] = None

class CouponValidate(BaseModel):
    code: str
    orderAmount: float

class CouponValidateResponse(BaseModel):
    valid: bool
    discountAmount: float
    message: str
    coupon: Optional[Coupon] = None
