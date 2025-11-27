"""
Test script for Crop Recommendation API endpoint

This script tests the /crop/recommend endpoint to ensure it's working correctly.
"""

import requests
import json

# Test data - sample soil and weather parameters
test_data = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.87,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
}

def test_crop_recommendation():
    """Test the crop recommendation endpoint"""
    url = "http://localhost:8000/crop/recommend"
    
    print("🧪 Testing Crop Recommendation API...")
    print(f"📡 URL: {url}")
    print(f"📤 Request data: {json.dumps(test_data, indent=2)}")
    print()
    
    try:
        response = requests.post(url, json=test_data, timeout=10)
        
        print(f"📥 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Response:")
            print(json.dumps(result, indent=2))
            print()
            print(f"🌾 Recommended Crop: {result['best_crop']}")
            print(f"📊 Confidence: {result['confidence']}%")
            print(f"🏆 Top 3 Crops:")
            for i, crop in enumerate(result['top_3'], 1):
                print(f"   {i}. {crop['crop']}: {crop['score']*100:.2f}%")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the FastAPI server is running!")
        print("   Start it with: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_available_crops():
    """Test the available crops endpoint"""
    url = "http://localhost:8000/crop/available-crops"
    
    print("\n🧪 Testing Available Crops API...")
    print(f"📡 URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Found {result['count']} crops")
            print(f"🌾 Crops: {', '.join(result['crops'][:10])}...")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the FastAPI server is running!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🌱 Crop Recommendation API Test")
    print("=" * 60)
    print()
    
    test_crop_recommendation()
    test_available_crops()
    
    print()
    print("=" * 60)
    print("✅ Test completed!")
    print("=" * 60)

