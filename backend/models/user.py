from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class Address(BaseModel):
    street: str
    city: str
    state: str
    pincode: str
    isDefault: bool = False

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password: str  # hashed
    role: str = 'customer'  # customer, admin
    phone: Optional[str] = ''
    addresses: List[Address] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = ''

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    phone: Optional[str] = ''

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
