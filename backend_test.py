#!/usr/bin/env python3
"""
Backend API Testing Suite for Benefills E-commerce Razorpay Integration
Tests all payment endpoints as specified in the review request
"""

import requests
import json
import time
import sys
import logging
from urllib.parse import urljoin

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Backend URL from frontend environment
BACKEND_URL = "https://checkout-verify-5.preview.emergentagent.com/api"

class RazorpayAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.timeout = 30
        
    def test_api_health(self):
        """Test basic API health check endpoint"""
        logger.info("Testing API Health Check...")
        
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ API Health Check: {response.status_code}")
                logger.info(f"Response: {data}")
                
                # Verify expected response structure
                if data.get("message") == "Benefills API is running" and data.get("status") == "healthy":
                    return True, "API health check passed"
                else:
                    return False, f"Unexpected response structure: {data}"
            else:
                logger.error(f"❌ API Health Check failed: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False, f"Status: {response.status_code}, Response: {response.text}"
                
        except Exception as e:
            logger.error(f"❌ API Health Check exception: {str(e)}")
            return False, f"Exception: {str(e)}"
    
    def test_payment_health(self):
        """Test Razorpay configuration health check"""
        logger.info("Testing Payment Health Check...")
        
        try:
            response = self.session.get(f"{self.base_url}/payments/health")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Payment Health Check: {response.status_code}")
                logger.info(f"Response: {json.dumps(data, indent=2)}")
                
                # Verify expected response structure from review request
                expected_status = "ok"
                expected_key_configured = True
                expected_secret_configured = True
                expected_mode = "live"
                
                success = True
                issues = []
                
                if data.get("status") != expected_status:
                    success = False
                    issues.append(f"Status: expected '{expected_status}', got '{data.get('status')}'")
                    
                if data.get("key_id_configured") != expected_key_configured:
                    success = False
                    issues.append(f"Key ID configured: expected {expected_key_configured}, got {data.get('key_id_configured')}")
                    
                if data.get("key_secret_configured") != expected_secret_configured:
                    success = False
                    issues.append(f"Key secret configured: expected {expected_secret_configured}, got {data.get('key_secret_configured')}")
                    
                if data.get("mode") != expected_mode:
                    success = False
                    issues.append(f"Mode: expected '{expected_mode}', got '{data.get('mode')}'")
                
                if success:
                    return True, "Payment health check passed with all expected values"
                else:
                    return False, f"Payment health check failed: {'; '.join(issues)}"
            else:
                logger.error(f"❌ Payment Health Check failed: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False, f"Status: {response.status_code}, Response: {response.text}"
                
        except Exception as e:
            logger.error(f"❌ Payment Health Check exception: {str(e)}")
            return False, f"Exception: {str(e)}"
    
    def test_create_order(self):
        """Test Razorpay order creation"""
        logger.info("Testing Create Order...")
        
        # Test data from review request
        order_data = {
            "amount": 41000,  # ₹410 in paise
            "currency": "INR",
            "receipt": "test_receipt_123",
            "notes": {}
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/payments/create-order",
                json=order_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Create Order: {response.status_code}")
                logger.info(f"Response: {json.dumps(data, indent=2)}")
                
                # Verify expected response structure from review request
                success = True
                issues = []
                
                if not data.get("success"):
                    success = False
                    issues.append("success field should be true")
                    
                if not data.get("order_id"):
                    success = False
                    issues.append("order_id field missing")
                    
                if data.get("amount") != order_data["amount"]:
                    success = False
                    issues.append(f"Amount mismatch: expected {order_data['amount']}, got {data.get('amount')}")
                    
                if data.get("currency") != order_data["currency"]:
                    success = False
                    issues.append(f"Currency mismatch: expected {order_data['currency']}, got {data.get('currency')}")
                    
                if not data.get("key_id"):
                    success = False
                    issues.append("key_id field missing")
                
                if success:
                    # Store order_id for later tests
                    self.created_order_id = data.get("order_id")
                    return True, f"Order created successfully with ID: {self.created_order_id}"
                else:
                    return False, f"Create order response validation failed: {'; '.join(issues)}"
            else:
                logger.error(f"❌ Create Order failed: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False, f"Status: {response.status_code}, Response: {response.text}"
                
        except Exception as e:
            logger.error(f"❌ Create Order exception: {str(e)}")
            return False, f"Exception: {str(e)}"
    
    def test_verify_payment_invalid(self):
        """Test payment verification with invalid data (should return 400)"""
        logger.info("Testing Payment Verification (Invalid Data)...")
        
        # Test data from review request - intentionally invalid
        verify_data = {
            "razorpay_order_id": "order_test",
            "razorpay_payment_id": "pay_test",
            "razorpay_signature": "invalid_sig"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/payments/verify-payment",
                json=verify_data,
                headers={"Content-Type": "application/json"}
            )
            
            # Should return 400 error for invalid signature as per review request
            if response.status_code == 400:
                logger.info(f"✅ Verify Payment (Invalid): {response.status_code} (Expected)")
                logger.info(f"Response: {response.text}")
                return True, "Payment verification correctly rejected invalid signature"
            else:
                logger.warning(f"⚠️ Verify Payment (Invalid): {response.status_code} (Expected 400)")
                logger.warning(f"Response: {response.text}")
                return False, f"Expected 400 status code for invalid signature, got {response.status_code}"
                
        except Exception as e:
            logger.error(f"❌ Verify Payment (Invalid) exception: {str(e)}")
            return False, f"Exception: {str(e)}"
    
    def test_order_status(self):
        """Test order status retrieval"""
        logger.info("Testing Order Status...")
        
        # Use order_id from create-order test if available
        if not hasattr(self, 'created_order_id') or not self.created_order_id:
            return False, "No order_id available from create-order test"
        
        try:
            response = self.session.get(f"{self.base_url}/payments/order-status/{self.created_order_id}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Order Status: {response.status_code}")
                logger.info(f"Response: {json.dumps(data, indent=2)}")
                
                # Verify DB storage works - should have order data
                if data.get("order_id") == self.created_order_id:
                    return True, "Order status retrieved successfully, DB storage working"
                else:
                    return False, f"Order ID mismatch in status response: expected {self.created_order_id}, got {data.get('order_id')}"
            elif response.status_code == 404:
                logger.warning(f"⚠️ Order Status: {response.status_code} - Order not found in DB")
                return False, "Order not found in database - DB storage may not be working"
            else:
                logger.error(f"❌ Order Status failed: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False, f"Status: {response.status_code}, Response: {response.text}"
                
        except Exception as e:
            logger.error(f"❌ Order Status exception: {str(e)}")
            return False, f"Exception: {str(e)}"
    
    def run_all_tests(self):
        """Run all backend API tests"""
        logger.info("="*60)
        logger.info("STARTING RAZORPAY BACKEND API TESTS")
        logger.info("="*60)
        
        tests = [
            ("API Health Check", self.test_api_health),
            ("Payment Health Check", self.test_payment_health),
            ("Create Order", self.test_create_order),
            ("Verify Payment (Invalid)", self.test_verify_payment_invalid),
            ("Order Status", self.test_order_status)
        ]
        
        results = []
        
        for test_name, test_func in tests:
            logger.info(f"\n{'='*40}")
            logger.info(f"Running: {test_name}")
            logger.info('='*40)
            
            try:
                success, message = test_func()
                results.append({
                    "test": test_name,
                    "success": success,
                    "message": message
                })
                
                if success:
                    logger.info(f"✅ {test_name}: PASSED - {message}")
                else:
                    logger.error(f"❌ {test_name}: FAILED - {message}")
                    
            except Exception as e:
                logger.error(f"❌ {test_name}: EXCEPTION - {str(e)}")
                results.append({
                    "test": test_name,
                    "success": False,
                    "message": f"Exception: {str(e)}"
                })
        
        # Summary
        logger.info("\n" + "="*60)
        logger.info("TEST SUMMARY")
        logger.info("="*60)
        
        passed = sum(1 for r in results if r["success"])
        total = len(results)
        
        for result in results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            logger.info(f"{status}: {result['test']}")
            if not result["success"]:
                logger.info(f"   Reason: {result['message']}")
        
        logger.info(f"\nResults: {passed}/{total} tests passed")
        
        return results

def main():
    """Main test runner"""
    print("Razorpay Backend API Test Suite")
    print(f"Testing backend at: {BACKEND_URL}")
    
    tester = RazorpayAPITester(BACKEND_URL)
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    failed_tests = [r for r in results if not r["success"]]
    if failed_tests:
        print(f"\n❌ {len(failed_tests)} test(s) failed")
        return 1
    else:
        print("\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())