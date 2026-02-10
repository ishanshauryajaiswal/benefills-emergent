# Benefills E-commerce Backend Contracts

## API Endpoints

### Products API
- `GET /api/products` - Get all products with optional filters (category, sort)
- `GET /api/products/{id}` - Get single product details
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Cart & Orders API
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status (Admin only)

### Authentication API
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/admin/login` - Admin login

### Inventory API (Admin)
- `GET /api/inventory` - Get all products with stock levels
- `PUT /api/inventory/{id}` - Update stock quantity

### Payment API
- `POST /api/payment/razorpay/create` - Create Razorpay order
- `POST /api/payment/razorpay/verify` - Verify payment signature

### Shipping API
- `POST /api/shipping/calculate` - Calculate shipping cost
- `POST /api/shipping/create` - Create shipment order (Shiprocket)

## Data Models

### Product
```python
{
    id: str (uuid)
    name: str
    description: str
    price: float
    originalPrice: float
    image: str (URL)
    category: str
    badge: str (optional)
    stock: int
    ingredients: List[str]
    rating: float
    reviews: int
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
}
```

### Order
```python
{
    id: str (uuid)
    userId: str (optional - guest checkout)
    customerInfo: {
        name, email, phone, address, city, state, pincode
    }
    items: List[{productId, name, price, quantity, image}]
    subtotal: float
    discount: float
    deliveryCharge: float
    total: float
    couponCode: str (optional)
    status: str (pending, processing, shipped, delivered, cancelled)
    paymentId: str (optional)
    paymentStatus: str (pending, completed, failed)
    shipmentId: str (optional)
    createdAt: datetime
    updatedAt: datetime
}
```

### User
```python
{
    id: str (uuid)
    name: str
    email: str (unique)
    password: str (hashed)
    role: str (customer, admin)
    phone: str (optional)
    addresses: List[Address]
    createdAt: datetime
}
```

## Mock Data to Replace

### Frontend (mockData.js)
- `products[]` → Replace with API call to `/api/products`
- `testimonials[]` → Keep as static (or create testimonials API later)
- `benefits[]` → Keep as static content
- `howItWorks[]` → Keep as static content
- `instagramPosts[]` → Keep as static

## Frontend Changes Required

### Context Updates
1. **CartContext** - Keep localStorage for now, optionally sync with backend later
2. **AuthContext** - Update to use real JWT tokens from API

### Page Updates
1. **Home.jsx** - Fetch products from `/api/products`
2. **Shop.jsx** - Fetch and filter products from API
3. **Login.jsx** - Call `/api/auth/login`
4. **Register.jsx** - Call `/api/auth/register`
5. **Checkout.jsx** - Submit order to `/api/orders`

## Integration Flow

### Guest Checkout Flow
1. User adds items to cart (localStorage)
2. User proceeds to checkout
3. User fills shipping info (no login required)
4. Order created with customerInfo
5. Payment gateway initiated (Razorpay)
6. On payment success, order confirmed

### Registered User Flow
1. User logs in → receives JWT token
2. Token stored in localStorage
3. All API calls include Authorization header
4. Cart can be synced to backend (optional)
5. Previous orders accessible via API

### Admin Flow
1. Admin logs in with admin credentials
2. Access `/admin` dashboard
3. Can create/edit/delete products
4. Can view all orders and update status
5. Can manage inventory levels

## Security Notes
- Password hashing with bcrypt
- JWT tokens with expiration
- Admin endpoints protected with role check
- Input validation with Pydantic
- CORS configured for frontend domain

## Payment Integration (Razorpay)
- API keys to be added in backend .env
- Create order on backend
- Payment verification on backend
- Order status updated based on payment

## Shipping Integration (Shiprocket)
- API token to be added in backend .env
- Create shipment after payment confirmation
- Track shipment status
- Update order with tracking details
