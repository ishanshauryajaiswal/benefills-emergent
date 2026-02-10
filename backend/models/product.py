from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    originalPrice: float
    image: str
    category: str
    badge: Optional[str] = ''
    stock: int = 0
    ingredients: List[str] = []
    rating: float = 5.0
    reviews: int = 0
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    originalPrice: float
    image: str
    category: str
    badge: Optional[str] = ''
    stock: int = 0
    ingredients: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    originalPrice: Optional[float] = None
    image: Optional[str] = None
    category: Optional[str] = None
    badge: Optional[str] = None
    stock: Optional[int] = None
    ingredients: Optional[List[str]] = None
    isActive: Optional[bool] = None
