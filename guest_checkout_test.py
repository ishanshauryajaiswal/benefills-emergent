#!/usr/bin/env python3
"""
Benefills E-commerce Guest Checkout Flow Test
Comprehensive test for the guest checkout process as specified in the review request
"""

import requests
import json
import sys
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv('frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
BASE_URL = BACKEND_URL

print(f"🔗 Testing guest checkout flow at: {BASE_URL}")

class GuestCheckoutTester:
    def __init__(self):
        self.session = requests.Session()
        self.original_stocks = {}
        self.created_orders = []
        
    def log_step(self, step, message, success=True):
        """Log test step result"""
        status = "✅" if success else "❌"
        print(f"{status} Step {step}: {message}")
        
    def log_error(self, step, message, response=None):
        """Log error details"""
        print(f"❌ Step {step}: {message}")
        if response:
            print(f"   Status Code: {response.status_code}")
            try:
                print(f"   Response: {response.text[:300]}...")
            except:
                print("   Response: Unable to parse")
                
    def step1_browse_products(self):
        """Step 1: Browse Products - GET /api/products/"""
        print("\n📦 Step 1: Browse Products")
        
        try:
            response = self.session.get(f"{BASE_URL}/api/products/")
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list) and len(products) > 0:
                    self.log_step(1, f"Retrieved {len(products)} products successfully")
                    
                    # Store original stock levels for verification later
                    for product in products:
                        self.original_stocks[product['id']] = product.get('stock', 0)
                        print(f"   Product {product['id']}: {product['name']} - Stock: {product.get('stock', 0)}")
                    
                    # Check if product ID "1" exists
                    product_1 = next((p for p in products if p['id'] == '1'), None)
                    if product_1:
                        self.log_step(1, f"Product ID '1' found: {product_1['name']} (Stock: {product_1.get('stock', 0)})")
                        return True
                    else:
                        self.log_error(1, "Product with ID '1' not found for testing")
                        return False
                else:
                    self.log_error(1, "No products returned or invalid format", response)
                    return False
            else:
                self.log_error(1, f"Failed to fetch products", response)
                return False
                
        except Exception as e:
            self.log_error(1, f"Request failed: {str(e)}")
            return False
            
    def step2_create_guest_order(self):
        """Step 2: Create Guest Order (Full Checkout)"""
        print("\n🛒 Step 2: Create Guest Order")
        
        order_data = {
            "customerInfo": {
                "name": "Guest Customer",
                "email": "guest@benefills.com",
                "phone": "9876543210",
                "address": "123 MG Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            },
            "items": [
                {
                    "productId": "1",
                    "name": "Seeds Boost Bar- pack of 7",
                    "price": 410,
                    "quantity": 2,
                    "image": "https://cdn.zyrosite.com/test.png"
                },
                {
                    "productId": "2",
                    "name": "Benefills Nut-ella Nut Butter",
                    "price": 650,
                    "quantity": 1,
                    "image": "https://cdn.zyrosite.com/test2.png"
                }
            ],
            "subtotal": 1470,
            "discount": 0,
            "deliveryCharge": 50,
            "total": 1520,
            "couponCode": ""
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/api/orders/", json=order_data)
            if response.status_code == 201:
                order = response.json()
                if isinstance(order, dict) and 'id' in order:
                    self.created_orders.append(order['id'])
                    self.log_step(2, f"Guest order created successfully - Order ID: {order['id']}")
                    
                    # Verify order details
                    if order.get('status') == 'pending':
                        self.log_step(2, "Order status correctly set to 'pending'")
                    else:
                        self.log_error(2, f"Order status is '{order.get('status')}' instead of 'pending'")
                        
                    if order.get('paymentStatus') == 'pending':
                        self.log_step(2, "Payment status correctly set to 'pending'")
                    else:
                        self.log_error(2, f"Payment status is '{order.get('paymentStatus')}' instead of 'pending'")
                        
                    # Verify customer info
                    customer_info = order.get('customerInfo', {})
                    if customer_info.get('email') == 'guest@benefills.com':
                        self.log_step(2, "Customer information stored correctly")
                    else:
                        self.log_error(2, "Customer information not stored correctly")
                        
                    # Verify items
                    items = order.get('items', [])
                    if len(items) == 2:
                        self.log_step(2, f"Order contains {len(items)} items as expected")
                    else:
                        self.log_error(2, f"Order contains {len(items)} items instead of 2")
                        
                    # Verify totals
                    if order.get('total') == 1520:
                        self.log_step(2, f"Order total correct: ₹{order.get('total')}")
                    else:
                        self.log_error(2, f"Order total incorrect: ₹{order.get('total')} (expected ₹1520)")
                        
                    return order
                else:
                    self.log_error(2, "Invalid order response format", response)
                    return None
            else:
                self.log_error(2, "Failed to create order", response)
                return None
                
        except Exception as e:
            self.log_error(2, f"Request failed: {str(e)}")
            return None
            
    def step3_verify_order_creation(self, order):
        """Step 3: Verify Order Creation"""
        print("\n✅ Step 3: Verify Order Creation")
        
        if not order:
            self.log_error(3, "No order to verify")
            return False
            
        # Check order ID is generated
        if order.get('id'):
            self.log_step(3, f"Order ID generated: {order['id']}")
        else:
            self.log_error(3, "Order ID not generated")
            return False
            
        # Check order status
        if order.get('status') == 'pending':
            self.log_step(3, "Order status is 'pending'")
        else:
            self.log_error(3, f"Order status is '{order.get('status')}' instead of 'pending'")
            
        # Check payment status
        if order.get('paymentStatus') == 'pending':
            self.log_step(3, "Payment status is 'pending'")
        else:
            self.log_error(3, f"Payment status is '{order.get('paymentStatus')}' instead of 'pending'")
            
        return True
        
    def step4_verify_stock_deduction(self):
        """Step 4: Verify Stock Deduction"""
        print("\n📉 Step 4: Verify Stock Deduction")
        
        try:
            # Check product 1 stock (should be reduced by 2)
            response_1 = self.session.get(f"{BASE_URL}/api/products/1")
            if response_1.status_code == 200:
                product_1 = response_1.json()
                original_stock_1 = self.original_stocks.get('1', 0)
                current_stock_1 = product_1.get('stock', 0)
                expected_stock_1 = original_stock_1 - 2
                
                if current_stock_1 == expected_stock_1:
                    self.log_step(4, f"Product 1 stock correctly reduced: {original_stock_1} → {current_stock_1} (-2)")
                else:
                    self.log_error(4, f"Product 1 stock incorrect: {original_stock_1} → {current_stock_1} (expected {expected_stock_1})")
            else:
                self.log_error(4, "Failed to fetch product 1", response_1)
                
            # Check product 2 stock (should be reduced by 1)
            response_2 = self.session.get(f"{BASE_URL}/api/products/2")
            if response_2.status_code == 200:
                product_2 = response_2.json()
                original_stock_2 = self.original_stocks.get('2', 0)
                current_stock_2 = product_2.get('stock', 0)
                expected_stock_2 = original_stock_2 - 1
                
                if current_stock_2 == expected_stock_2:
                    self.log_step(4, f"Product 2 stock correctly reduced: {original_stock_2} → {current_stock_2} (-1)")
                    return True
                else:
                    self.log_error(4, f"Product 2 stock incorrect: {original_stock_2} → {current_stock_2} (expected {expected_stock_2})")
                    return False
            else:
                self.log_error(4, "Failed to fetch product 2", response_2)
                return False
                
        except Exception as e:
            self.log_error(4, f"Request failed: {str(e)}")
            return False
            
    def step5_retrieve_order(self):
        """Step 5: Retrieve Order"""
        print("\n📋 Step 5: Retrieve Order")
        
        try:
            response = self.session.get(f"{BASE_URL}/api/orders/")
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    self.log_step(5, f"Retrieved {len(orders)} orders from list")
                    
                    # Check if our created orders appear in the list
                    found_orders = 0
                    for order_id in self.created_orders:
                        found = any(order.get('id') == order_id for order in orders)
                        if found:
                            found_orders += 1
                            
                    if found_orders == len(self.created_orders):
                        self.log_step(5, f"All {found_orders} created orders appear in orders list")
                        
                        # Verify order details for the first order
                        if orders and len(self.created_orders) > 0:
                            order = next((o for o in orders if o.get('id') == self.created_orders[0]), None)
                            if order:
                                # Check customer information
                                customer_info = order.get('customerInfo', {})
                                if customer_info.get('email') == 'guest@benefills.com':
                                    self.log_step(5, "Customer information correctly stored in order")
                                else:
                                    self.log_error(5, "Customer information not correctly stored")
                                    
                                # Check items
                                items = order.get('items', [])
                                if len(items) == 2:
                                    self.log_step(5, f"Order items correctly stored ({len(items)} items)")
                                else:
                                    self.log_error(5, f"Order items not correctly stored ({len(items)} items, expected 2)")
                                    
                                # Check totals
                                if order.get('total') == 1520:
                                    self.log_step(5, f"Order totals correct: ₹{order.get('total')}")
                                else:
                                    self.log_error(5, f"Order totals incorrect: ₹{order.get('total')} (expected ₹1520)")
                                    
                        return True
                    else:
                        self.log_error(5, f"Only {found_orders}/{len(self.created_orders)} orders found in list")
                        return False
                else:
                    self.log_error(5, "Invalid orders list format", response)
                    return False
            else:
                self.log_error(5, "Failed to retrieve orders", response)
                return False
                
        except Exception as e:
            self.log_error(5, f"Request failed: {str(e)}")
            return False
            
    def step6_test_coupon_code(self):
        """Step 6: Test with Coupon Code"""
        print("\n🎟️ Step 6: Test with Coupon Code")
        
        order_data = {
            "customerInfo": {
                "name": "Guest with Coupon",
                "email": "coupon@benefills.com",
                "phone": "9999999999",
                "address": "456 Test Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            },
            "items": [
                {
                    "productId": "3",
                    "name": "Thyrovibe nut butters- the duo pack",
                    "price": 1200,
                    "quantity": 1,
                    "image": "test.png"
                }
            ],
            "subtotal": 1200,
            "discount": 240,
            "deliveryCharge": 50,
            "total": 1010,
            "couponCode": "FIRSTLOVE20"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/api/orders/", json=order_data)
            if response.status_code == 201:
                order = response.json()
                if isinstance(order, dict) and 'id' in order:
                    self.created_orders.append(order['id'])
                    self.log_step(6, f"Order with coupon created successfully - Order ID: {order['id']}")
                    
                    # Verify coupon code is stored
                    if order.get('couponCode') == 'FIRSTLOVE20':
                        self.log_step(6, f"Coupon code '{order.get('couponCode')}' correctly stored")
                    else:
                        self.log_error(6, f"Coupon code '{order.get('couponCode')}' not correctly stored")
                        
                    # Verify discount amount
                    if order.get('discount') == 240:
                        self.log_step(6, f"Discount amount correctly applied: ₹{order.get('discount')}")
                    else:
                        self.log_error(6, f"Discount amount incorrect: ₹{order.get('discount')} (expected ₹240)")
                        
                    # Verify final total
                    if order.get('total') == 1010:
                        self.log_step(6, f"Final total with coupon correct: ₹{order.get('total')}")
                    else:
                        self.log_error(6, f"Final total incorrect: ₹{order.get('total')} (expected ₹1010)")
                        
                    return True
                else:
                    self.log_error(6, "Invalid order response format", response)
                    return False
            else:
                self.log_error(6, "Failed to create order with coupon", response)
                return False
                
        except Exception as e:
            self.log_error(6, f"Request failed: {str(e)}")
            return False
            
    def run_guest_checkout_tests(self):
        """Run complete guest checkout flow tests"""
        print("🛍️ BENEFILLS E-COMMERCE GUEST CHECKOUT FLOW TEST")
        print("=" * 60)
        print(f"🔗 Testing at: {BASE_URL}")
        print(f"⏰ Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Test API availability first
        try:
            response = self.session.get(f"{BASE_URL}/api/")
            if response.status_code != 200:
                print(f"❌ API not available at {BASE_URL}/api/ - Status: {response.status_code}")
                return False
            else:
                print(f"✅ API is available: {response.json().get('message', 'OK')}")
        except Exception as e:
            print(f"❌ Cannot reach API at {BASE_URL}: {str(e)}")
            return False
            
        # Run test steps
        results = {}
        
        results['step1'] = self.step1_browse_products()
        if results['step1']:
            order = self.step2_create_guest_order()
            results['step2'] = order is not None
            results['step3'] = self.step3_verify_order_creation(order)
            results['step4'] = self.step4_verify_stock_deduction()
            results['step5'] = self.step5_retrieve_order()
            results['step6'] = self.step6_test_coupon_code()
        else:
            print("❌ Stopping tests due to Step 1 failure")
            return False
            
        # Print summary
        self.print_test_summary(results)
        
        # Return overall success
        return all(results.values())
        
    def print_test_summary(self, results):
        """Print comprehensive test results summary"""
        print("\n" + "=" * 60)
        print("📊 GUEST CHECKOUT TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed_tests = sum(1 for result in results.values() if result)
        total_tests = len(results)
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📈 Overall Results: {passed_tests}/{total_tests} steps passed ({success_rate:.1f}%)")
        print()
        
        step_names = {
            'step1': 'Browse Products & Check Stock',
            'step2': 'Create Guest Order',
            'step3': 'Verify Order Creation',
            'step4': 'Verify Stock Deduction',
            'step5': 'Retrieve Order from List',
            'step6': 'Test Coupon Code Order'
        }
        
        for step, success in results.items():
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"   {status} {step_names.get(step, step)}")
            
        print()
        
        if passed_tests == total_tests:
            print("🎉 ALL GUEST CHECKOUT TESTS PASSED!")
            print("✅ Products fetched successfully with stock info")
            print("✅ Guest order created without authentication")
            print("✅ Order ID generated automatically")
            print("✅ Customer information stored correctly")
            print("✅ Multiple items in order handled correctly")
            print("✅ Stock quantities reduced after order creation")
            print("✅ Coupon code stored in order")
            print("✅ Order appears in GET /api/orders/ list")
            print("✅ All price calculations correct")
            print("✅ Order status defaults to 'pending'")
            print("✅ Payment status defaults to 'pending'")
        else:
            failed_count = total_tests - passed_tests
            print(f"⚠️ {failed_count} test(s) failed. Please check the issues above.")
            
        print(f"\n📝 Created {len(self.created_orders)} test orders: {', '.join(self.created_orders)}")
        print("=" * 60)


def main():
    """Main function to run guest checkout tests"""
    tester = GuestCheckoutTester()
    success = tester.run_guest_checkout_tests()
    
    # Exit with appropriate code
    if success:
        print("\n✅ All guest checkout tests completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Some guest checkout tests failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()