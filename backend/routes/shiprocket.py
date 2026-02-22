from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import httpx
import os
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/shiprocket", tags=["shiprocket"])

# ShipRocket Configuration
SHIPROCKET_EMAIL = os.getenv("SHIPROCKET_EMAIL")
SHIPROCKET_PASSWORD = os.getenv("SHIPROCKET_PASSWORD")
SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1"

# Token cache
token_cache = {"token": None, "expires_at": None}

class OrderItem(BaseModel):
    name: str
    sku: str
    units: int
    selling_price: float
    discount: float = 0
    tax: float = 0

class Address(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    address_2: Optional[str] = ""
    city: str
    state: str
    country: str = "India"
    pincode: str

class CreateShipmentRequest(BaseModel):
    order_id: str
    billing_address: Address
    shipping_address: Address
    order_items: List[OrderItem]
    payment_method: str = "Prepaid"
    sub_total: float
    length: float
    breadth: float
    height: float
    weight: float
    pickup_location: str = "Primary"

class RateCalculationRequest(BaseModel):
    pickup_postcode: str
    delivery_postcode: str
    weight: float
    cod: int = 0

async def get_shiprocket_token():
    """Get or refresh ShipRocket authentication token"""
    now = datetime.now()
    
    # Check if token is still valid
    if token_cache["token"] and token_cache["expires_at"] and now < token_cache["expires_at"]:
        return token_cache["token"]
    
    # Get new token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SHIPROCKET_BASE_URL}/external/auth/login",
            json={
                "email": SHIPROCKET_EMAIL,
                "password": SHIPROCKET_PASSWORD
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to authenticate with ShipRocket")
        
        data = response.json()
        token_cache["token"] = data["token"]
        token_cache["expires_at"] = now + timedelta(hours=239)  # Token valid for 240 hours
        
        return token_cache["token"]

@router.post("/create-shipment")
async def create_shipment(shipment: CreateShipmentRequest):
    """Create a new shipment in ShipRocket"""
    try:
        token = await get_shiprocket_token()
        
        payload = {
            "order_id": shipment.order_id,
            "order_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "pickup_location": shipment.pickup_location,
            "billing_customer_name": shipment.billing_address.name,
            "billing_last_name": "",
            "billing_address": shipment.billing_address.address,
            "billing_address_2": shipment.billing_address.address_2,
            "billing_city": shipment.billing_address.city,
            "billing_pincode": shipment.billing_address.pincode,
            "billing_state": shipment.billing_address.state,
            "billing_country": shipment.billing_address.country,
            "billing_email": shipment.billing_address.email,
            "billing_phone": shipment.billing_address.phone,
            "shipping_is_billing": False,
            "shipping_customer_name": shipment.shipping_address.name,
            "shipping_last_name": "",
            "shipping_address": shipment.shipping_address.address,
            "shipping_address_2": shipment.shipping_address.address_2,
            "shipping_city": shipment.shipping_address.city,
            "shipping_pincode": shipment.shipping_address.pincode,
            "shipping_state": shipment.shipping_address.state,
            "shipping_country": shipment.shipping_address.country,
            "shipping_email": shipment.shipping_address.email,
            "shipping_phone": shipment.shipping_address.phone,
            "order_items": [
                {
                    "name": item.name,
                    "sku": item.sku,
                    "units": item.units,
                    "selling_price": str(item.selling_price),
                    "discount": str(item.discount),
                    "tax": str(item.tax)
                }
                for item in shipment.order_items
            ],
            "payment_method": shipment.payment_method,
            "sub_total": shipment.sub_total,
            "length": shipment.length,
            "breadth": shipment.breadth,
            "height": shipment.height,
            "weight": shipment.weight
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/external/orders/create/adhoc",
                json=payload,
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            return response.json()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/track/{awb_code}")
async def track_shipment(awb_code: str):
    """Track shipment by AWB code"""
    try:
        token = await get_shiprocket_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SHIPROCKET_BASE_URL}/external/courier/track/awb/{awb_code}",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            return response.json()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate-rates")
async def calculate_shipping_rates(rate_request: RateCalculationRequest):
    """Calculate shipping rates between pincodes"""
    try:
        token = await get_shiprocket_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SHIPROCKET_BASE_URL}/external/courier/serviceability/",
                params={
                    "pickup_postcode": rate_request.pickup_postcode,
                    "delivery_postcode": rate_request.delivery_postcode,
                    "weight": rate_request.weight,
                    "cod": rate_request.cod
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            return response.json()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
