#!/usr/bin/env python3
"""
Backend Integration Testing Script
Tests Razorpay and ShipRocket API integrations
"""

import asyncio
import httpx
import json
import hmac
import hashlib
from datetime import datetime
import uuid

# Test Configuration
BASE_URL = "https://commit-review.preview.emergentagent.com/api"
RAZORPAY_KEY_SECRET = "ob3lcfFkZz3A7w5uwjriR5GH"  # From backend .env

# Test Data
test_order_data = {
    "amount": 10000,  # ₹100 in paise
    "currency": "INR", 
    "receipt": f"test_receipt_{int(datetime.now().timestamp())}"
}

rate_calculation_data = {
    "pickup_postcode": "110001",  # Delhi
    "delivery_postcode": "560001",  # Bangalore
    "weight": 1.0,  # 1kg
    "cod": 0
}

async def test_razorpay_create_order():
    """Test Razorpay order creation endpoint"""
    print("🧪 Testing Razorpay Create Order...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BASE_URL}/payments/create-order",
                json=test_order_data
            )
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Order created successfully!")
                print(f"   Order ID: {data.get('order_id')}")
                print(f"   Amount: ₹{data.get('amount', 0) / 100}")
                print(f"   Key ID: {data.get('key_id')}")
                return data.get('order_id')
            else:
                print(f"   ❌ Failed: {response.text}")
                return None
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            return None

async def test_razorpay_verify_payment(order_id):
    """Test Razorpay payment verification with mock signature"""
    print("🧪 Testing Razorpay Payment Verification...")
    
    if not order_id:
        print("   ❌ Skipped: No order ID available")
        return False
        
    # Mock payment data
    mock_payment_id = f"pay_test_{int(datetime.now().timestamp())}"
    
    # Generate correct HMAC signature
    signature_payload = f"{order_id}|{mock_payment_id}"
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        signature_payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    verify_data = {
        "razorpay_order_id": order_id,
        "razorpay_payment_id": mock_payment_id,
        "razorpay_signature": generated_signature
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BASE_URL}/payments/verify-payment",
                json=verify_data
            )
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Payment verified successfully!")
                print(f"   Payment ID: {data.get('payment_id')}")
                return True
            else:
                print(f"   ❌ Failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            return False

async def test_razorpay_order_status(order_id):
    """Test Razorpay order status retrieval"""
    print("🧪 Testing Razorpay Order Status...")
    
    if not order_id:
        print("   ❌ Skipped: No order ID available")
        return False
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BASE_URL}/payments/order-status/{order_id}")
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Order status retrieved successfully!")
                print(f"   Status: {data.get('status')}")
                print(f"   Amount: ₹{data.get('amount', 0) / 100}")
                return True
            else:
                print(f"   ❌ Failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            return False

async def test_shiprocket_calculate_rates():
    """Test ShipRocket rate calculation endpoint"""
    print("🧪 Testing ShipRocket Calculate Rates...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BASE_URL}/shiprocket/calculate-rates",
                json=rate_calculation_data
            )
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Shipping rates calculated successfully!")
                
                # Check if we have rate data
                if 'data' in data and isinstance(data['data'], list):
                    rates = data['data']
                    print(f"   Available courier services: {len(rates)}")
                    
                    # Show first few rates
                    for i, rate in enumerate(rates[:3]):
                        courier_name = rate.get('courier_name', 'Unknown')
                        rate_value = rate.get('rate', 0)
                        print(f"   • {courier_name}: ₹{rate_value}")
                        
                elif 'available_courier_companies' in data:
                    companies = data['available_courier_companies']
                    print(f"   Available courier companies: {len(companies)}")
                    
                return True
            else:
                print(f"   ❌ Failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            return False

async def test_invalid_signature_verification(order_id):
    """Test payment verification with invalid signature (should fail)"""
    print("🧪 Testing Invalid Signature Verification...")
    
    if not order_id:
        print("   ❌ Skipped: No order ID available")
        return False
        
    # Use invalid signature
    verify_data = {
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_invalid_test",
        "razorpay_signature": "invalid_signature_12345"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BASE_URL}/payments/verify-payment",
                json=verify_data
            )
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 400:
                print(f"   ✅ Invalid signature properly rejected!")
                return True
            else:
                print(f"   ❌ Unexpected response: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            return False

async def main():
    """Run all integration tests"""
    print("🚀 Starting Razorpay & ShipRocket Integration Tests")
    print("=" * 60)
    
    test_results = []
    
    # Test 1: Razorpay Order Creation
    order_id = await test_razorpay_create_order()
    test_results.append(("Razorpay Create Order", order_id is not None))
    
    print("\n" + "-" * 40 + "\n")
    
    # Test 2: Razorpay Payment Verification
    verify_success = await test_razorpay_verify_payment(order_id)
    test_results.append(("Razorpay Verify Payment", verify_success))
    
    print("\n" + "-" * 40 + "\n")
    
    # Test 3: Razorpay Order Status
    status_success = await test_razorpay_order_status(order_id)
    test_results.append(("Razorpay Order Status", status_success))
    
    print("\n" + "-" * 40 + "\n")
    
    # Test 4: ShipRocket Rate Calculation
    rates_success = await test_shiprocket_calculate_rates()
    test_results.append(("ShipRocket Calculate Rates", rates_success))
    
    print("\n" + "-" * 40 + "\n")
    
    # Test 5: Invalid Signature (Security Test)
    invalid_sig_success = await test_invalid_signature_verification(order_id)
    test_results.append(("Invalid Signature Rejection", invalid_sig_success))
    
    # Final Results
    print("\n" + "=" * 60)
    print("📊 INTEGRATION TEST RESULTS:")
    print("=" * 60)
    
    passed = 0
    for test_name, success in test_results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if success:
            passed += 1
    
    print(f"\nSUMMARY: {passed}/{len(test_results)} tests passed")
    
    if passed == len(test_results):
        print("🎉 All integration tests passed!")
    else:
        print("⚠️  Some tests failed - check logs above")
    
    return test_results

if __name__ == "__main__":
    asyncio.run(main())