#!/usr/bin/env python3
"""
CourierFlow Backend API Testing Suite
Tests all backend endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime
import time

class CourierFlowAPITester:
    def __init__(self, base_url="https://b2d75936-386a-45ed-a033-01dcf7ace531.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_tracking_id = None
        
        # Test data
        self.test_timestamp = datetime.now().strftime('%H%M%S')
        self.test_users = {
            'customer': {
                'name': f'Test Customer {self.test_timestamp}',
                'email': f'customer{self.test_timestamp}@test.com',
                'password': 'TestPass123!',
                'role': 'customer'
            },
            'admin': {
                'name': f'Test Admin {self.test_timestamp}',
                'email': f'admin{self.test_timestamp}@test.com',
                'password': 'AdminPass123!',
                'role': 'admin'
            },
            'delivery_agent': {
                'name': f'Test Agent {self.test_timestamp}',
                'email': f'agent{self.test_timestamp}@test.com',
                'password': 'AgentPass123!',
                'role': 'delivery_agent'
            }
        }
        
        self.test_package = {
            "sender": {
                "name": "John Doe",
                "phone": "+91-9876543210",
                "address": "123 Test Street, Andheri West",
                "city": "Mumbai",
                "state": "Maharashtra",
                "postal_code": "400058",
                "country": "India"
            },
            "receiver": {
                "name": "Jane Smith",
                "phone": "+91-9876543211",
                "address": "456 Test Avenue, Koramangala",
                "city": "Bangalore",
                "state": "Karnataka",
                "postal_code": "560034",
                "country": "India"
            },
            "package_details": {
                "type": "parcel",
                "weight": 2.5,
                "length": 30.0,
                "width": 20.0,
                "height": 15.0,
                "description": "Test package for API testing"
            },
            "service_type": "express",
            "pickup_date": "2025-02-15"
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200
        )
        return success

    def test_user_registration(self, user_type='customer'):
        """Test user registration"""
        user_data = self.test_users[user_type]
        success, response = self.run_test(
            f"User Registration ({user_type})",
            "POST",
            "/api/auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            if user_type == 'customer':  # Store customer token for further tests
                self.token = response['access_token']
                self.user_data = response['user']
                print(f"   Stored token for {user_type}: {self.token[:20]}...")
        
        return success, response

    def test_user_login(self, user_type='customer'):
        """Test user login"""
        user_data = self.test_users[user_type]
        login_data = {
            'email': user_data['email'],
            'password': user_data['password']
        }
        
        success, response = self.run_test(
            f"User Login ({user_type})",
            "POST",
            "/api/auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            if user_type == 'customer':
                self.token = response['access_token']
                self.user_data = response['user']
        
        return success, response

    def test_get_current_user(self):
        """Test get current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/api/auth/me",
            200
        )
        return success, response

    def test_calculate_price(self):
        """Test price calculation"""
        price_data = {
            "sender_city": "Mumbai",
            "receiver_city": "Bangalore",
            "weight": 2.5,
            "service_type": "express"
        }
        
        success, response = self.run_test(
            "Calculate Package Price",
            "POST",
            "/api/packages/calculate-price",
            200,
            data=price_data
        )
        return success, response

    def test_create_package(self):
        """Test package creation"""
        success, response = self.run_test(
            "Create Package",
            "POST",
            "/api/packages/create",
            200,
            data=self.test_package
        )
        
        if success and 'tracking_id' in response:
            self.test_tracking_id = response['tracking_id']
            print(f"   Created package with tracking ID: {self.test_tracking_id}")
        
        return success, response

    def test_get_user_packages(self):
        """Test get user packages"""
        success, response = self.run_test(
            "Get User Packages",
            "GET",
            "/api/packages/my-packages",
            200
        )
        return success, response

    def test_track_package(self):
        """Test package tracking"""
        if not self.test_tracking_id:
            print("❌ No tracking ID available for tracking test")
            return False, {}
        
        success, response = self.run_test(
            "Track Package",
            "GET",
            f"/api/packages/track/{self.test_tracking_id}",
            200
        )
        return success, response

    def test_track_invalid_package(self):
        """Test tracking with invalid ID"""
        success, response = self.run_test(
            "Track Invalid Package",
            "GET",
            "/api/packages/track/INVALID123",
            404
        )
        return success, response

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        # First login as admin
        admin_success, admin_response = self.test_user_login('admin')
        if not admin_success:
            print("❌ Admin login failed, skipping admin tests")
            return False
        
        # Test get all packages
        success1, response1 = self.run_test(
            "Admin - Get All Packages",
            "GET",
            "/api/admin/packages",
            200
        )
        
        # Test get stats
        success2, response2 = self.run_test(
            "Admin - Get Stats",
            "GET",
            "/api/admin/stats",
            200
        )
        
        # Test update package status (if we have a tracking ID)
        success3 = True
        if self.test_tracking_id:
            update_data = {
                "tracking_id": self.test_tracking_id,
                "status": "picked_up",
                "location": "Mumbai Warehouse",
                "notes": "Package picked up for delivery"
            }
            success3, response3 = self.run_test(
                "Admin - Update Package Status",
                "POST",
                "/api/admin/update-status",
                200,
                data=update_data
            )
        
        return success1 and success2 and success3

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "/api/packages/my-packages",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            'email': 'nonexistent@test.com',
            'password': 'wrongpassword'
        }
        
        success, response = self.run_test(
            "Invalid Login Test",
            "POST",
            "/api/auth/login",
            401,
            data=invalid_data
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting CourierFlow Backend API Tests")
        print("=" * 50)
        
        # Basic functionality tests
        print("\n📋 BASIC FUNCTIONALITY TESTS")
        self.test_health_check()
        
        # Authentication tests
        print("\n🔐 AUTHENTICATION TESTS")
        self.test_user_registration('customer')
        self.test_user_registration('admin')
        self.test_user_registration('delivery_agent')
        
        # Login tests
        self.test_user_login('customer')  # This sets the token for subsequent tests
        self.test_get_current_user()
        
        # Package functionality tests
        print("\n📦 PACKAGE FUNCTIONALITY TESTS")
        self.test_calculate_price()
        self.test_create_package()
        self.test_get_user_packages()
        self.test_track_package()
        
        # Error handling tests
        print("\n❌ ERROR HANDLING TESTS")
        self.test_track_invalid_package()
        self.test_unauthorized_access()
        self.test_invalid_login()
        
        # Admin functionality tests
        print("\n👑 ADMIN FUNCTIONALITY TESTS")
        self.test_admin_endpoints()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 TEST RESULTS")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed!")
            return 1

def main():
    """Main function to run tests"""
    tester = CourierFlowAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())