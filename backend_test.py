#!/usr/bin/env python3
"""
Benefills E-commerce Backend API Test Suite
Tests all API endpoints as requested by the user
"""

import asyncio
import json
import sys
from datetime import datetime
import uuid
import os
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    import requests
    import aiohttp
    from dotenv import load_dotenv
except ImportError as e:
    print(f"❌ Missing required packages: {e}")
    print("Please install: pip install requests aiohttp python-dotenv")
    sys.exit(1)

# Load environment variables
load_dotenv('frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
BASE_URL = BACKEND_URL

print(f"🔗 Testing backend at: {BASE_URL}")

class BenefillsAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.user_token = None
        self.admin_token = None
        self.test_user_email = f"test.user.{uuid.uuid4().hex[:8]}@benefills.com"
        self.results = {
            "products": {"passed": 0, "failed": 0, "details": []},
            "auth": {"passed": 0, "failed": 0, "details": []}, 
            "orders": {"passed": 0, "failed": 0, "details": []},
            "overall": {"passed": 0, "failed": 0}
        }

    def log_result(self, category, test_name, status, message, response=None):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        if response:
            result["status_code"] = response.status_code
            result["response_time"] = f"{response.elapsed.total_seconds():.3f}s"
        
        self.results[category]["details"].append(result)
        
        if status == "PASS":
            self.results[category]["passed"] += 1
            self.results["overall"]["passed"] += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.results[category]["failed"] += 1
            self.results["overall"]["failed"] += 1
            print(f"❌ {test_name}: {message}")
            if response:
                print(f"   Status: {response.status_code}, Time: {response.elapsed.total_seconds():.3f}s")
                try:
                    print(f"   Response: {response.text[:200]}...")
                except:
                    print("   Response: Unable to parse")

    def test_products_api(self):
        """Test Products API endpoints"""
        print("\n🛍️  Testing Products API...")
        
        # Test 1: GET /api/products/ - Get all products
        try:
            response = self.session.get(f"{BASE_URL}/api/products/")
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list) and len(products) > 0:
                    self.log_result("products", "GET /api/products/", "PASS", 
                                  f"Retrieved {len(products)} products successfully", response)
                else:
                    self.log_result("products", "GET /api/products/", "FAIL", 
                                  "No products returned or invalid format", response)
            else:
                self.log_result("products", "GET /api/products/", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("products", "GET /api/products/", "FAIL", f"Request failed: {str(e)}")

        # Test 2: GET /api/products/?sort=price-low - Sort by price low to high
        try:
            response = self.session.get(f"{BASE_URL}/api/products/?sort=price-low")
            if response.status_code == 200:
                products = response.json()
                if len(products) >= 2:
                    # Check if sorted by price ascending
                    is_sorted = all(products[i]['price'] <= products[i+1]['price'] 
                                  for i in range(len(products)-1))
                    if is_sorted:
                        self.log_result("products", "GET /api/products/?sort=price-low", "PASS", 
                                      f"Products sorted by price (low to high) correctly", response)
                    else:
                        self.log_result("products", "GET /api/products/?sort=price-low", "FAIL", 
                                      "Products not sorted by price correctly", response)
                else:
                    self.log_result("products", "GET /api/products/?sort=price-low", "PASS", 
                                  "Sorting endpoint works (insufficient products to verify order)", response)
            else:
                self.log_result("products", "GET /api/products/?sort=price-low", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("products", "GET /api/products/?sort=price-low", "FAIL", f"Request failed: {str(e)}")

        # Test 3: GET /api/products/?sort=price-high - Sort by price high to low
        try:
            response = self.session.get(f"{BASE_URL}/api/products/?sort=price-high")
            if response.status_code == 200:
                products = response.json()
                if len(products) >= 2:
                    # Check if sorted by price descending
                    is_sorted = all(products[i]['price'] >= products[i+1]['price'] 
                                  for i in range(len(products)-1))
                    if is_sorted:
                        self.log_result("products", "GET /api/products/?sort=price-high", "PASS", 
                                      f"Products sorted by price (high to low) correctly", response)
                    else:
                        self.log_result("products", "GET /api/products/?sort=price-high", "FAIL", 
                                      "Products not sorted by price correctly", response)
                else:
                    self.log_result("products", "GET /api/products/?sort=price-high", "PASS", 
                                  "Sorting endpoint works (insufficient products to verify order)", response)
            else:
                self.log_result("products", "GET /api/products/?sort=price-high", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("products", "GET /api/products/?sort=price-high", "FAIL", f"Request failed: {str(e)}")

        # Test 4: GET /api/products/1 - Get specific product by ID
        try:
            response = self.session.get(f"{BASE_URL}/api/products/1")
            if response.status_code == 200:
                product = response.json()
                if isinstance(product, dict) and 'id' in product and product['id'] == '1':
                    self.log_result("products", "GET /api/products/1", "PASS", 
                                  f"Retrieved specific product: {product.get('name', 'Unknown')}", response)
                else:
                    self.log_result("products", "GET /api/products/1", "FAIL", 
                                  "Invalid product format or ID mismatch", response)
            elif response.status_code == 404:
                self.log_result("products", "GET /api/products/1", "FAIL", 
                              "Product with ID '1' not found (check if database is seeded)", response)
            else:
                self.log_result("products", "GET /api/products/1", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("products", "GET /api/products/1", "FAIL", f"Request failed: {str(e)}")

    def test_auth_api(self):
        """Test Authentication API endpoints"""
        print("\n🔐 Testing Authentication API...")
        
        # Test 1: POST /api/auth/register - Register new user
        try:
            register_data = {
                "name": "Test User",
                "email": self.test_user_email,
                "password": "test123",
                "phone": "9876543210"
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/register", json=register_data)
            if response.status_code == 201:
                token_data = response.json()
                if 'access_token' in token_data and 'user' in token_data:
                    self.user_token = token_data['access_token']
                    self.log_result("auth", "POST /api/auth/register", "PASS", 
                                  f"User registered successfully: {token_data['user']['email']}", response)
                else:
                    self.log_result("auth", "POST /api/auth/register", "FAIL", 
                                  "Invalid response format - missing token or user", response)
            elif response.status_code == 400:
                self.log_result("auth", "POST /api/auth/register", "FAIL", 
                              "Registration failed - email may already exist or validation error", response)
            else:
                self.log_result("auth", "POST /api/auth/register", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("auth", "POST /api/auth/register", "FAIL", f"Request failed: {str(e)}")

        # Test 2: POST /api/auth/login - Login with the registered user
        try:
            login_data = {
                "email": self.test_user_email,
                "password": "test123"
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/login", json=login_data)
            if response.status_code == 200:
                token_data = response.json()
                if 'access_token' in token_data and 'user' in token_data:
                    self.user_token = token_data['access_token']
                    self.log_result("auth", "POST /api/auth/login", "PASS", 
                                  f"User login successful: {token_data['user']['email']}", response)
                else:
                    self.log_result("auth", "POST /api/auth/login", "FAIL", 
                                  "Invalid response format - missing token or user", response)
            elif response.status_code == 401:
                self.log_result("auth", "POST /api/auth/login", "FAIL", 
                              "Login failed - invalid credentials", response)
            else:
                self.log_result("auth", "POST /api/auth/login", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("auth", "POST /api/auth/login", "FAIL", f"Request failed: {str(e)}")

        # Test 3: POST /api/auth/admin/login - Admin login with retry logic
        import time
        max_retries = 3
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                admin_data = {
                    "email": "admin@benefills.com",
                    "password": "admin123"
                }
                
                # Add headers and timeout
                headers = {"Content-Type": "application/json"}
                response = self.session.post(
                    f"{BASE_URL}/api/auth/admin/login", 
                    json=admin_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    token_data = response.json()
                    if 'access_token' in token_data and 'user' in token_data:
                        user = token_data['user']
                        if user.get('role') == 'admin':
                            self.admin_token = token_data['access_token']
                            self.log_result("auth", "POST /api/auth/admin/login", "PASS", 
                                          f"Admin login successful: {user['email']}", response)
                            break
                        else:
                            self.log_result("auth", "POST /api/auth/admin/login", "FAIL", 
                                          "User authenticated but role is not admin", response)
                            break
                    else:
                        self.log_result("auth", "POST /api/auth/admin/login", "FAIL", 
                                      "Invalid response format - missing token or user", response)
                        break
                elif response.status_code == 401:
                    self.log_result("auth", "POST /api/auth/admin/login", "FAIL", 
                                  "Admin login failed - invalid credentials or admin not found", response)
                    break
                elif response.status_code == 520 and attempt < max_retries - 1:
                    print(f"   520 error on attempt {attempt + 1}, retrying...")
                    time.sleep(retry_delay)
                    continue
                else:
                    error_msg = f"Unexpected status code: {response.status_code}"
                    if attempt == max_retries - 1:
                        error_msg += f" (after {max_retries} attempts)"
                    self.log_result("auth", "POST /api/auth/admin/login", "FAIL", error_msg, response)
                    break
                    
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"   Request failed on attempt {attempt + 1}, retrying...")
                    time.sleep(retry_delay)
                    continue
                else:
                    self.log_result("auth", "POST /api/auth/admin/login", "FAIL", f"Request failed after {max_retries} attempts: {str(e)}")
                    break

    def test_orders_api(self):
        """Test Orders API endpoints"""
        print("\n📦 Testing Orders API...")
        
        # Test 1: POST /api/orders/ - Create test order
        try:
            order_data = {
                "customerInfo": {
                    "name": "Test Customer",
                    "email": "customer@test.com",
                    "phone": "9999999999",
                    "address": "123 Test Street",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "pincode": "400001"
                },
                "items": [
                    {
                        "productId": "1",
                        "name": "Seeds Boost Bar",
                        "price": 410,
                        "quantity": 2,
                        "image": "test.jpg"
                    }
                ],
                "subtotal": 820,
                "discount": 0,
                "deliveryCharge": 50,
                "total": 870
            }
            
            response = self.session.post(f"{BASE_URL}/api/orders/", json=order_data)
            if response.status_code == 201:
                order = response.json()
                if isinstance(order, dict) and 'id' in order and 'customerInfo' in order:
                    self.created_order_id = order['id']
                    self.log_result("orders", "POST /api/orders/", "PASS", 
                                  f"Order created successfully: {order['id']}", response)
                else:
                    self.log_result("orders", "POST /api/orders/", "FAIL", 
                                  "Invalid response format - missing required fields", response)
            elif response.status_code == 400:
                error_msg = "Order creation failed - likely stock issue or validation error"
                try:
                    error_detail = response.json().get('detail', 'Unknown error')
                    error_msg += f": {error_detail}"
                except:
                    pass
                self.log_result("orders", "POST /api/orders/", "FAIL", error_msg, response)
            else:
                self.log_result("orders", "POST /api/orders/", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("orders", "POST /api/orders/", "FAIL", f"Request failed: {str(e)}")

        # Test 2: GET /api/orders/ - Get all orders
        try:
            response = self.session.get(f"{BASE_URL}/api/orders/")
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    self.log_result("orders", "GET /api/orders/", "PASS", 
                                  f"Retrieved {len(orders)} orders successfully", response)
                else:
                    self.log_result("orders", "GET /api/orders/", "FAIL", 
                                  "Invalid response format - not a list", response)
            else:
                self.log_result("orders", "GET /api/orders/", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("orders", "GET /api/orders/", "FAIL", f"Request failed: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Benefills E-commerce Backend API Tests")
        print(f"📍 Base URL: {BASE_URL}")
        print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Test API availability
            response = self.session.get(f"{BASE_URL}/api/")
            if response.status_code != 200:
                print(f"❌ API not available at {BASE_URL}/api/ - Status: {response.status_code}")
                return False
            else:
                print(f"✅ API is available: {response.json().get('message', 'OK')}")
        except Exception as e:
            print(f"❌ Cannot reach API at {BASE_URL}: {str(e)}")
            return False

        # Run individual test suites
        self.test_products_api()
        self.test_auth_api()
        self.test_orders_api()
        
        # Print summary
        self.print_summary()
        return True

    def print_summary(self):
        """Print test results summary"""
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        
        total_passed = self.results["overall"]["passed"]
        total_failed = self.results["overall"]["failed"]
        total_tests = total_passed + total_failed
        
        print(f"📈 Overall: {total_passed}/{total_tests} tests passed ({(total_passed/total_tests*100):.1f}%)")
        
        for category in ["products", "auth", "orders"]:
            passed = self.results[category]["passed"]
            failed = self.results[category]["failed"]
            total = passed + failed
            if total > 0:
                print(f"   {category.title()}: {passed}/{total} passed ({(passed/total*100):.1f}%)")
        
        if total_failed > 0:
            print(f"\n❌ {total_failed} tests failed:")
            for category in ["products", "auth", "orders"]:
                for detail in self.results[category]["details"]:
                    if detail["status"] == "FAIL":
                        print(f"   • {detail['test']}: {detail['message']}")
        
        if total_passed == total_tests:
            print(f"\n🎉 ALL TESTS PASSED! Backend API is working correctly.")
        else:
            print(f"\n⚠️  Some tests failed. Please check the issues above.")
        
        print("="*60)


def main():
    """Main function to run tests"""
    tester = BenefillsAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    if not success or tester.results["overall"]["failed"] > 0:
        sys.exit(1)
    else:
        print("\n✅ All backend tests completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()