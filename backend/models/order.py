from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class OrderItem(BaseModel):
    productId: str
    name: str
    price: float
    quantity: int
    image: str

class CustomerInfo(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: Optional[str] = None
    customerInfo: CustomerInfo
    items: List[OrderItem]
    subtotal: float
    discount: float = 0
    deliveryCharge: float = 50
    total: float
    couponCode: Optional[str] = ''
    status: str = 'pending'  # pending, processing, shipped, delivered, cancelled
    paymentId: Optional[str] = ''
    paymentStatus: str = 'pending'  # pending, completed, failed
    shipmentId: Optional[str] = ''
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    customerInfo: CustomerInfo
    items: List[OrderItem]
    subtotal: float
    discount: float = 0
    deliveryCharge: float = 0
    total: float
    couponCode: Optional[str] = ''
    userId: Optional[str] = None
    paymentId: Optional[str] = ''
    paymentStatus: Optional[str] = 'pending'

class OrderStatusUpdate(BaseModel):
    status: str
