from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
from typing import List, Optional
import razorpay
import hmac
import hashlib
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

def get_razorpay_client():
    """Lazy-initialize Razorpay client so env vars are always fresh."""
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise HTTPException(status_code=500, detail="Razorpay API keys not configured")
    return razorpay.Client(auth=(key_id, key_secret))

class CreateOrderRequest(BaseModel):
    amount: int  # Amount in paise (multiply rupees by 100)
    currency: str = "INR"
    receipt: str
    notes: Optional[dict] = {}

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create-order")
async def create_razorpay_order(order_request: CreateOrderRequest):
    """Create a Razorpay order"""
    try:
        razorpay_client = get_razorpay_client()
        order_data = {
            "amount": order_request.amount,
            "currency": order_request.currency,
            "receipt": order_request.receipt[:40],  # Razorpay limit: 40 chars
            "notes": order_request.notes
        }
        
        razorpay_order = razorpay_client.order.create(data=order_data)
        logger.info(f"Razorpay order created: {razorpay_order['id']}")
        
        # Store order in database
        await db.razorpay_orders.insert_one({
            "order_id": razorpay_order["id"],
            "amount": order_request.amount,
            "currency": order_request.currency,
            "receipt": order_request.receipt,
            "status": "created",
            "created_at": razorpay_order["created_at"]
        })
        
        return {
            "success": True,
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": os.getenv("RAZORPAY_KEY_ID")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"create-order error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_payment(verify_request: VerifyPaymentRequest):
    """Verify Razorpay payment signature"""
    try:
        key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        if not key_secret:
            raise HTTPException(status_code=500, detail="Razorpay secret not configured")

        # Verify signature using HMAC-SHA256
        msg = f"{verify_request.razorpay_order_id}|{verify_request.razorpay_payment_id}".encode()
        generated_signature = hmac.new(
            key_secret.encode(),
            msg,
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != verify_request.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Update order status in database
        await db.razorpay_orders.update_one(
            {"order_id": verify_request.razorpay_order_id},
            {"$set": {
                "status": "paid",
                "payment_id": verify_request.razorpay_payment_id,
                "signature": verify_request.razorpay_signature
            }}
        )
        
        logger.info(f"Payment verified: {verify_request.razorpay_payment_id}")
        return {
            "success": True,
            "message": "Payment verified successfully",
            "payment_id": verify_request.razorpay_payment_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"verify-payment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def razorpay_webhook(request: Request, x_razorpay_signature: Optional[str] = Header(None)):
    """Handle Razorpay webhooks"""
    try:
        payload = await request.body()
        
        # Verify webhook signature
        webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
        if webhook_secret and x_razorpay_signature:
            expected_signature = hmac.new(
                webhook_secret.encode(),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            if expected_signature != x_razorpay_signature:
                raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
        # Process webhook event
        import json
        event_data = json.loads(payload)
        
        event_type = event_data.get("event")
        payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
        
        # Update database based on event type
        if event_type == "payment.captured":
            await db.razorpay_orders.update_one(
                {"order_id": payment_entity.get("order_id")},
                {"$set": {"status": "captured", "webhook_event": event_type}}
            )
        elif event_type == "payment.failed":
            await db.razorpay_orders.update_one(
                {"order_id": payment_entity.get("order_id")},
                {"$set": {"status": "failed", "webhook_event": event_type}}
            )
        
        return {"status": "success"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/order-status/{order_id}")
async def get_order_status(order_id: str):
    """Get Razorpay order status"""
    try:
        order = await db.razorpay_orders.find_one({"order_id": order_id})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Remove MongoDB _id field
        order.pop("_id", None)
        
        return order
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
