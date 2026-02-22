#!/usr/bin/env python3
"""
Detailed ShipRocket Rate Check
"""

import asyncio
import httpx
import json

BASE_URL = "https://frontend-first-check.preview.emergentagent.com/api"

async def detailed_shiprocket_test():
    """Detailed ShipRocket test to check response format"""
    
    rate_data = {
        "pickup_postcode": "110001",  # Delhi
        "delivery_postcode": "560001",  # Bangalore
        "weight": 1.0,  # 1kg
        "cod": 0
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BASE_URL}/shiprocket/calculate-rates",
                json=rate_data
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("\nShipRocket Response Structure:")
                print(json.dumps(data, indent=2))
                
                # Analyze response structure
                if 'data' in data:
                    print(f"\nFound 'data' field with {len(data['data'])} items")
                    if data['data']:
                        sample_item = data['data'][0]
                        print("Sample item keys:", list(sample_item.keys()))
                        
            else:
                print(f"Failed: {response.text}")
                
        except Exception as e:
            print(f"Exception: {str(e)}")

if __name__ == "__main__":
    asyncio.run(detailed_shiprocket_test())