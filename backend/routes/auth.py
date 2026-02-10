from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from models.user import User, UserCreate, UserLogin, Token, UserResponse
from utils.auth import get_password_hash, verify_password, create_access_token
import os

router = APIRouter(prefix='/api/auth', tags=['auth'])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post('/register', response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register new user
    """
    # Check if user already exists
    existing_user = await db.users.find_one({'email': user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email already registered'
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        phone=user_data.phone
    )
    
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(data={'sub': user.email, 'id': user.id})
    
    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        phone=user.phone
    )
    
    return Token(
        access_token=access_token,
        token_type='bearer',
        user=user_response
    )

@router.post('/login', response_model=Token)
async def login(credentials: UserLogin):
    """
    User login
    """
    # Find user
    user = await db.users.find_one({'email': credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password'
        )
    
    # Verify password
    if not verify_password(credentials.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password'
        )
    
    # Create access token
    access_token = create_access_token(data={'sub': user['email'], 'id': user['id']})
    
    user_response = UserResponse(
        id=user['id'],
        name=user['name'],
        email=user['email'],
        role=user['role'],
        phone=user.get('phone', '')
    )
    
    return Token(
        access_token=access_token,
        token_type='bearer',
        user=user_response
    )

@router.post('/admin/login', response_model=Token)
async def admin_login(credentials: UserLogin):
    """
    Admin login
    """
    # Find user
    user = await db.users.find_one({'email': credentials.email, 'role': 'admin'})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid admin credentials'
        )
    
    # Verify password
    if not verify_password(credentials.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid admin credentials'
        )
    
    # Create access token
    access_token = create_access_token(data={'sub': user['email'], 'id': user['id']})
    
    user_response = UserResponse(
        id=user['id'],
        name=user['name'],
        email=user['email'],
        role=user['role'],
        phone=user.get('phone', '')
    )
    
    return Token(
        access_token=access_token,
        token_type='bearer',
        user=user_response
    )
