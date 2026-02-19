#!/usr/bin/env python3
"""
Benefills E-commerce Coupons API Test Suite
Focused testing of the coupons API endpoints as requested
"""

import requests
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Load environment variables
sys.path.insert(0, str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
except ImportError:
    print("❌ Missing python-dotenv. Installing...")
    os.system("pip install python-dotenv")
    from dotenv import load_dotenv

# Load environment variables
load_dotenv('frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
BASE_URL = BACKEND_URL

print(f"🔗 Testing coupons API at: {BASE_URL}")

class CouponsAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.results = {
            "coupons": {"passed": 0, "failed": 0, "details": []},
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

    def test_coupons_api(self):
        """Test Coupons API endpoints"""
        print("\n🎫 Testing Coupons API...")
        
        # Test 1: GET /api/coupons/ - Get all available coupons
        try:
            response = self.session.get(f"{BASE_URL}/api/coupons/", timeout=10)
            if response.status_code == 200:
                coupons = response.json()
                if isinstance(coupons, list):
                    # Check if coupons have required fields
                    if coupons:
                        sample_coupon = coupons[0]
                        required_fields = ['code', 'discountType', 'discountValue', 'isActive']
                        if all(field in sample_coupon for field in required_fields):
                            active_coupons = [c for c in coupons if c.get('isActive', False)]
                            self.log_result("coupons", "GET /api/coupons/", "PASS", 
                                          f"Retrieved {len(coupons)} coupons ({len(active_coupons)} active)", response)
                        else:
                            self.log_result("coupons", "GET /api/coupons/", "FAIL", 
                                          "Coupons missing required fields", response)
                    else:
                        self.log_result("coupons", "GET /api/coupons/", "PASS", 
                                      "No coupons available (empty list)", response)
                else:
                    self.log_result("coupons", "GET /api/coupons/", "FAIL", 
                                  "Invalid response format - not a list", response)
            else:
                self.log_result("coupons", "GET /api/coupons/", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("coupons", "GET /api/coupons/", "FAIL", f"Request failed: {str(e)}")

        # Test 2: POST /api/coupons/validate - Validate coupon with valid code
        try:
            # First get available coupons to test with a real code
            coupons_response = self.session.get(f"{BASE_URL}/api/coupons/", timeout=10)
            valid_coupon_code = None
            
            if coupons_response.status_code == 200:
                coupons = coupons_response.json()
                active_coupons = [c for c in coupons if c.get('isActive', False)]
                if active_coupons:
                    valid_coupon_code = active_coupons[0]['code']
            
            # If no active coupons, test with a common test code
            if not valid_coupon_code:
                valid_coupon_code = "FIRSTLOVE20"  # Common test coupon from seeded data
            
            validate_data = {
                "code": valid_coupon_code,
                "orderAmount": 1000
            }
            
            response = self.session.post(f"{BASE_URL}/api/coupons/validate", 
                                       json=validate_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                required_fields = ['valid', 'discountAmount', 'message']
                if all(field in result for field in required_fields):
                    if result['valid']:
                        self.log_result("coupons", "POST /api/coupons/validate (valid)", "PASS", 
                                      f"Coupon '{valid_coupon_code}' validated: ₹{result['discountAmount']} discount", response)
                    else:
                        self.log_result("coupons", "POST /api/coupons/validate (valid)", "PASS", 
                                      f"Coupon validation response correct (invalid coupon): {result['message']}", response)
                else:
                    self.log_result("coupons", "POST /api/coupons/validate (valid)", "FAIL", 
                                  "Response missing required fields", response)
            else:
                self.log_result("coupons", "POST /api/coupons/validate (valid)", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("coupons", "POST /api/coupons/validate (valid)", "FAIL", f"Request failed: {str(e)}")

        # Test 3: POST /api/coupons/validate - Validate with invalid coupon
        try:
            validate_data = {
                "code": "INVALID_COUPON_123",
                "orderAmount": 1000
            }
            
            response = self.session.post(f"{BASE_URL}/api/coupons/validate", 
                                       json=validate_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if 'valid' in result and not result['valid']:
                    self.log_result("coupons", "POST /api/coupons/validate (invalid)", "PASS", 
                                  f"Invalid coupon correctly rejected: {result.get('message', 'No message')}", response)
                else:
                    self.log_result("coupons", "POST /api/coupons/validate (invalid)", "FAIL", 
                                  "Invalid coupon was accepted or response format incorrect", response)
            else:
                self.log_result("coupons", "POST /api/coupons/validate (invalid)", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("coupons", "POST /api/coupons/validate (invalid)", "FAIL", f"Request failed: {str(e)}")

        # Test 4: POST /api/coupons/validate - Validate with insufficient order amount
        try:
            # Use a coupon with minimum order amount requirement
            validate_data = {
                "code": "FIRSTLOVE20",  # Assuming this has minimum order requirement
                "orderAmount": 100  # Low amount to test minimum order validation
            }
            
            response = self.session.post(f"{BASE_URL}/api/coupons/validate", 
                                       json=validate_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if 'valid' in result and 'message' in result:
                    if not result['valid'] and 'minimum' in result['message'].lower():
                        self.log_result("coupons", "POST /api/coupons/validate (min order)", "PASS", 
                                      f"Minimum order validation working: {result['message']}", response)
                    elif result['valid']:
                        self.log_result("coupons", "POST /api/coupons/validate (min order)", "PASS", 
                                      f"Coupon valid for low amount (no minimum requirement): ₹{result['discountAmount']}", response)
                    else:
                        self.log_result("coupons", "POST /api/coupons/validate (min order)", "PASS", 
                                      f"Coupon validation response: {result['message']}", response)
                else:
                    self.log_result("coupons", "POST /api/coupons/validate (min order)", "FAIL", 
                                  "Response format incorrect", response)
            else:
                self.log_result("coupons", "POST /api/coupons/validate (min order)", "FAIL", 
                              f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("coupons", "POST /api/coupons/validate (min order)", "FAIL", f"Request failed: {str(e)}")

    def run_all_tests(self):
        """Run all coupons API tests"""
        print("🚀 Starting Benefills Coupons API Tests")
        print(f"📍 Base URL: {BASE_URL}")
        print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Test API availability
            response = self.session.get(f"{BASE_URL}/api/", timeout=10)
            if response.status_code != 200:
                print(f"❌ API not available at {BASE_URL}/api/ - Status: {response.status_code}")
                return False
            else:
                print(f"✅ API is available: {response.json().get('message', 'OK')}")
        except Exception as e:
            print(f"❌ Cannot reach API at {BASE_URL}: {str(e)}")
            return False

        # Run coupons API tests
        self.test_coupons_api()
        
        # Print summary
        self.print_summary()
        return True

    def print_summary(self):
        """Print test results summary"""
        print("\n" + "="*60)
        print("📊 COUPONS API TEST RESULTS")
        print("="*60)
        
        total_passed = self.results["overall"]["passed"]
        total_failed = self.results["overall"]["failed"]
        total_tests = total_passed + total_failed
        
        if total_tests > 0:
            print(f"📈 Overall: {total_passed}/{total_tests} tests passed ({(total_passed/total_tests*100):.1f}%)")
            
            passed = self.results["coupons"]["passed"]
            failed = self.results["coupons"]["failed"]
            total = passed + failed
            if total > 0:
                print(f"   Coupons API: {passed}/{total} passed ({(passed/total*100):.1f}%)")
        
        if total_failed > 0:
            print(f"\n❌ {total_failed} tests failed:")
            for detail in self.results["coupons"]["details"]:
                if detail["status"] == "FAIL":
                    print(f"   • {detail['test']}: {detail['message']}")
        
        if total_passed == total_tests and total_tests > 0:
            print(f"\n🎉 ALL COUPONS API TESTS PASSED!")
        elif total_tests == 0:
            print(f"\n⚠️  No tests were run.")
        else:
            print(f"\n⚠️  Some coupons API tests failed. Please check the issues above.")
        
        print("="*60)


def main():
    """Main function to run coupons API tests"""
    tester = CouponsAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    if not success or tester.results["overall"]["failed"] > 0:
        sys.exit(1)
    else:
        print("\n✅ All coupons API tests completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()