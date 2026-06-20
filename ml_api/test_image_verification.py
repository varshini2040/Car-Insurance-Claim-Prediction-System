#!/usr/bin/env python3
"""Test image verification endpoints"""

import requests
import json
import os
from pathlib import Path

API_URL = "http://127.0.0.1:5001"

def test_health():
    """Test health endpoint"""
    print("\n🔍 Testing Health Check...")
    response = requests.get(f"{API_URL}/health")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.status_code == 200

def test_vehicle_similarity(img1_path, img2_path, threshold=0.7):
    """Test vehicle image comparison"""
    print(f"\n🚗 Testing Vehicle Similarity...")
    
    if not os.path.exists(img1_path) or not os.path.exists(img2_path):
        print(f"❌ Images not found")
        return False
    
    try:
        with open(img1_path, 'rb') as f1, open(img2_path, 'rb') as f2:
            files = {'image1': f1, 'image2': f2}
            data = {'threshold': threshold}
            response = requests.post(
                f"{API_URL}/verify-vehicle",
                files=files,
                data=data
            )
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            similarity = result.get('similarity', 0)
            match = result.get('match', False)
            print(f"\n✅ Similarity: {similarity}% | Match: {match}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_plate_verification(image_path):
    """Test license plate extraction"""
    print(f"\n🔢 Testing License Plate Extraction...")
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                f"{API_URL}/verify-plate",
                files=files
            )
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            plate = result.get('plate_number', 'N/A')
            confidence = result.get('confidence', 0)
            print(f"\n✅ Plate: {plate} | Confidence: {confidence:.2%}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_license_verification(image_path):
    """Test driver license extraction"""
    print(f"\n📋 Testing License Extraction...")
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                f"{API_URL}/verify-license",
                files=files
            )
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            print(f"\n✅ License Info Extracted")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Image Verification API Test Suite")
    print("=" * 60)
    
    # Test health
    test_health()
    
    # Find and test with available images from Dataset
    dataset_path = Path("../Dataset")
    
    car_damage_path = dataset_path / "CarDamage images" / "00-damage"
    car_whole_path = dataset_path / "CarDamage images" / "01-whole"
    plate_path = dataset_path / "NumberPlate images"
    
    # Test vehicle similarity if images exist
    print("\n" + "=" * 60)
    print("Testing Vehicle Similarity (Comparing Car Images)")
    print("=" * 60)
    
    if car_damage_path.exists() and car_whole_path.exists():
        # Test with matching pairs (same index)
        damage_img = car_damage_path / "0001.JPEG"
        whole_img = car_whole_path / "0001.jpg"
        
        if damage_img.exists() and whole_img.exists():
            print(f"✅ Found matching pair: 0001 (damaged vs whole)")
            test_vehicle_similarity(str(damage_img), str(whole_img), threshold=0.65)
        else:
            # Try first available
            damage_imgs = sorted(car_damage_path.glob("*.JPEG"))[:2]
            whole_imgs = sorted(car_whole_path.glob("*.jpg"))[:2]
            if damage_imgs and whole_imgs:
                test_vehicle_similarity(str(damage_imgs[0]), str(whole_imgs[0]))
    else:
        print(f"⚠️  Car images not found in Dataset folder")
    
    # Test plate extraction if images exist
    print("\n" + "=" * 60)
    print("Testing License Plate Extraction")
    print("=" * 60)
    
    if plate_path.exists():
        plate_images = sorted(plate_path.glob("Cars*.png"))
        if plate_images:
            # Test first 3 plates
            for i, img in enumerate(plate_images[:3], 1):
                print(f"\n🔢 Testing License Plate #{i} ({img.name})...")
                test_plate_verification(str(img))
        else:
            print(f"⚠️  License plate images not found in {plate_path}")
    else:
        print(f"⚠️  NumberPlate images folder not found")
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"✅ Dataset Path: {dataset_path}")
    print(f"📸 Car Damage Images: {len(list(car_damage_path.glob('*.*')))} found")
    print(f"🚗 Car Whole Images: {len(list(car_whole_path.glob('*.*')))} found")
    print(f"🔢 License Plate Images: {len(list(plate_path.glob('*.png')))} found")
    print("=" * 60)

if __name__ == "__main__":
    main()