from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
from typing import List, Optional
import razorpay
import hmac
import hashlib
import os
import logging
import json
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Log Razorpay configuration status at module load time
_rp_key_id = os.getenv("RAZORPAY_KEY_ID", "")
_rp_key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
logger.info(f"Razorpay KEY_ID configured: {bool(_rp_key_id)} (starts with: {_rp_key_id[:12]}...)" if _rp_key_id else "WARNING: RAZORPAY_KEY_ID is NOT set!")
logger.info(f"Razorpay KEY_SECRET configured: {bool(_rp_key_secret)}" if _rp_key_secret else "WARNING: RAZORPAY_KEY_SECRET is NOT set!")


def get_razorpay_client():
    """Lazy-initialize Razorpay client so env vars are always fresh."""
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        logger.error(f"Razorpay API keys missing! KEY_ID present: {bool(key_id)}, KEY_SECRET present: {bool(key_secret)}")
        raise HTTPException(
            status_code=500,
            detail="Razorpay API keys not configured. Please check server environment variables."
        )
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


@router.get("/health")
async def payment_health_check():
    """Check if Razorpay payment system is properly configured"""
    key_id = os.getenv("RAZORPAY_KEY_ID", "")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

    is_live = key_id.startswith("rzp_live_") if key_id else False
    is_test = key_id.startswith("rzp_test_") if key_id else False

    return {
        "status": "ok" if key_id and key_secret else "error",
        "key_id_configured": bool(key_id),
        "key_secret_configured": bool(key_secret),
        "webhook_secret_configured": bool(webhook_secret),
        "mode": "live" if is_live else ("test" if is_test else "unknown"),
        "key_id_prefix": key_id[:16] + "..." if key_id else "NOT SET",
    }


@router.post("/create-order")
async def create_razorpay_order(order_request: CreateOrderRequest):
    """Create a Razorpay order"""
    try:
        logger.info(f"Creating Razorpay order: amount={order_request.amount}, currency={order_request.currency}")
        razorpay_client = get_razorpay_client()
        order_data = {
            "amount": order_request.amount,
            "currency": order_request.currency,
            "receipt": order_request.receipt[:40],  # Razorpay limit: 40 chars
            "notes": order_request.notes or {}
        }

        razorpay_order = razorpay_client.order.create(data=order_data)
        logger.info(f"Razorpay order created successfully: {razorpay_order['id']}")

        # Store order in database
        try:
            await db.razorpay_orders.insert_one({
                "order_id": razorpay_order["id"],
                "amount": order_request.amount,
                "currency": order_request.currency,
                "receipt": order_request.receipt,
                "status": "created",
                "created_at": razorpay_order.get("created_at")
            })
        except Exception as db_err:
            logger.warning(f"Failed to store order in DB (non-critical): {db_err}")

        return {
            "success": True,
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": os.getenv("RAZORPAY_KEY_ID")
        }

    except HTTPException:
        raise
    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay BadRequestError: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except razorpay.errors.ServerError as e:
        logger.error(f"Razorpay ServerError: {str(e)}")
        raise HTTPException(status_code=502, detail="Payment gateway temporarily unavailable. Please try again.")
    except Exception as e:
        logger.error(f"create-order error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-payment")
async def verify_payment(verify_request: VerifyPaymentRequest):
    """Verify Razorpay payment signature"""
    try:
        key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        if not key_secret:
            logger.error("RAZORPAY_KEY_SECRET not set - cannot verify payment!")
            raise HTTPException(status_code=500, detail="Razorpay secret not configured")

        # Verify signature using HMAC-SHA256
        msg = f"{verify_request.razorpay_order_id}|{verify_request.razorpay_payment_id}".encode()
        generated_signature = hmac.new(
            key_secret.encode(),
            msg,
            hashlib.sha256
        ).hexdigest()

        if generated_signature != verify_request.razorpay_signature:
            logger.warning(f"Signature mismatch for order {verify_request.razorpay_order_id}")
            raise HTTPException(status_code=400, detail="Invalid payment signature")

        # Update order status in database
        try:
            await db.razorpay_orders.update_one(
                {"order_id": verify_request.razorpay_order_id},
                {"$set": {
                    "status": "paid",
                    "payment_id": verify_request.razorpay_payment_id,
                    "signature": verify_request.razorpay_signature
                }}
            )
        except Exception as db_err:
            logger.warning(f"Failed to update order in DB (non-critical): {db_err}")

        logger.info(f"Payment verified successfully: {verify_request.razorpay_payment_id}")
        return {
            "success": True,
            "message": "Payment verified successfully",
            "payment_id": verify_request.razorpay_payment_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"verify-payment error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def razorpay_webhook(request: Request, x_razorpay_signature: Optional[str] = Header(None)):
    """Handle Razorpay webhooks"""
    try:
        payload = await request.body()
        logger.info(f"Webhook received, payload size: {len(payload)} bytes")

        # Verify webhook signature
        webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
        if webhook_secret and x_razorpay_signature:
            expected_signature = hmac.new(
                webhook_secret.encode(),
                payload,
                hashlib.sha256
            ).hexdigest()

            if expected_signature != x_razorpay_signature:
                logger.warning("Webhook signature verification failed")
                raise HTTPException(status_code=400, detail="Invalid webhook signature")

        # Process webhook event
        event_data = json.loads(payload)

        event_type = event_data.get("event")
        payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
        logger.info(f"Webhook event: {event_type}, order_id: {payment_entity.get('order_id')}")

        # Update database based on event type
        if event_type == "payment.captured":
            await db.razorpay_orders.update_one(
                {"order_id": payment_entity.get("order_id")},
                {"$set": {"status": "captured", "webhook_event": event_type}}
            )
            # Also update the main order
            await db.orders.update_one(
                {"paymentId": payment_entity.get("id")},
                {"$set": {"paymentStatus": "completed", "status": "processing"}}
            )
            logger.info(f"Payment captured for order {payment_entity.get('order_id')}")
        elif event_type == "payment.failed":
            await db.razorpay_orders.update_one(
                {"order_id": payment_entity.get("order_id")},
                {"$set": {"status": "failed", "webhook_event": event_type}}
            )
            logger.info(f"Payment failed for order {payment_entity.get('order_id')}")

        return {"status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {type(e).__name__}: {str(e)}")
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
