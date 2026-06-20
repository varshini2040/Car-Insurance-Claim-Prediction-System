# Quick Setup & Testing Guide

## Prerequisites

- Python 3.8+
- Pip package manager
- 5GB free disk space (for TensorFlow models)
- Internet connection (for model downloads on first run)

## Installation & Setup

### 1. Install Dependencies

```bash
cd ml_api

# Install all required packages
pip install -r requirements.txt

# This will install:
# - Flask and Flask-CORS for API
# - scikit-learn, joblib for ML models
# - easyocr, opencv-python for image OCR
# - tensorflow for vehicle similarity
# - numpy, pandas for data processing
```

### 2. Verify Installation

```bash
# Check all imports work correctly
python -c "
import flask
import easyocr
import tensorflow
import cv2
import sklearn
import joblib
print('✅ All dependencies installed successfully!')
"
```

### 3. Start the Flask API

```bash
# Start the API server
python app.py

# Output should show:
# 🚀 Loading ML Models...
# 📊 Loading Insurance Prediction Models (JOBLIB)...
# ✅ Loaded: best_insurance_model.pkl
# ✅ Loaded: scaler.pkl
# ✅ Loaded: label_encoder_gender.pkl
# ✅ Loaded: label_encoder_vehicle.pkl
#
# 🖼️  Loading Image Verification Modules...
# ✅ Plate OCR initialized
# ✅ License OCR initialized
# ✅ Vehicle Similarity initialized
#
# 🌐 Starting Flask API on http://127.0.0.1:5001
```

## Testing the API

### Test 1: Health Check

```bash
curl http://127.0.0.1:5001/health
```

Expected Response:
```json
{
  "status": "ok",
  "prediction_model": "loaded",
  "plate_ocr": "loaded",
  "license_ocr": "loaded",
  "vehicle_similarity": "loaded"
}
```

### Test 2: Model Information

```bash
curl http://127.0.0.1:5001/model-info
```

### Test 3: Plate Verification

```bash
# Using a test plate image
curl -X POST http://127.0.0.1:5001/verify-plate \
  -F "image=@/path/to/plate_image.jpg"
```

### Test 4: License Verification

```bash
curl -X POST http://127.0.0.1:5001/verify-license \
  -F "image=@/path/to/license_image.jpg"
```

### Test 5: Vehicle Similarity

```bash
curl -X POST http://127.0.0.1:5001/verify-vehicle \
  -F "image1=@/path/to/car_image1.jpg" \
  -F "image2=@/path/to/car_image2.jpg" \
  -F "threshold=0.7"
```

## Python Testing Script

Create `test_api.py`:

```python
#!/usr/bin/env python3
"""Test script for Image Verification API"""

import requests
import json
from pathlib import Path

API_BASE_URL = "http://127.0.0.1:5001"

def test_health():
    """Test health check endpoint"""
    print("\n🔍 Testing Health Check...")
    response = requests.get(f"{API_BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.status_code == 200

def test_model_info():
    """Test model info endpoint"""
    print("\n🔍 Testing Model Info...")
    response = requests.get(f"{API_BASE_URL}/model-info")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.status_code == 200

def test_plate_verification(image_path):
    """Test plate verification"""
    print(f"\n🔍 Testing Plate Verification...")
    if not Path(image_path).exists():
        print(f"❌ Image not found: {image_path}")
        return False
    
    with open(image_path, 'rb') as f:
        files = {'image': f}
        response = requests.post(f"{API_BASE_URL}/verify-plate", files=files)
    
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.status_code == 200

def test_license_verification(image_path):
    """Test license verification"""
    print(f"\n🔍 Testing License Verification...")
    if not Path(image_path).exists():
        print(f"❌ Image not found: {image_path}")
        return False
    
    with open(image_path, 'rb') as f:
        files = {'image': f}
        response = requests.post(f"{API_BASE_URL}/verify-license", files=files)
    
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.status_code == 200

def test_vehicle_similarity(image_path1, image_path2, threshold=0.7):
    """Test vehicle similarity"""
    print(f"\n🔍 Testing Vehicle Similarity...")
    if not Path(image_path1).exists() or not Path(image_path2).exists():
        print(f"❌ One or both images not found")
        return False
    
    with open(image_path1, 'rb') as f1, open(image_path2, 'rb') as f2:
        files = {'image1': f1, 'image2': f2}
        data = {'threshold': threshold}
        response = requests.post(f"{API_BASE_URL}/verify-vehicle", 
                               files=files, data=data)
    
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.status_code == 200

def main():
    """Run all tests"""
    print("=" * 50)
    print("Image Verification API Test Suite")
    print("=" * 50)
    
    results = {
        'Health Check': test_health(),
        'Model Info': test_model_info(),
    }
    
    # Optional: Test with actual images
    # Uncomment if you have test images
    
    # plate_image = "test_images/plate.jpg"
    # if Path(plate_image).exists():
    #     results['Plate Verification'] = test_plate_verification(plate_image)
    
    # license_image = "test_images/license.jpg"
    # if Path(license_image).exists():
    #     results['License Verification'] = test_license_verification(license_image)
    
    # car1_image = "test_images/car1.jpg"
    # car2_image = "test_images/car2.jpg"
    # if Path(car1_image).exists() and Path(car2_image).exists():
    #     results['Vehicle Similarity'] = test_vehicle_similarity(car1_image, car2_image)
    
    # Print results
    print("\n" + "=" * 50)
    print("Test Results")
    print("=" * 50)
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("=" * 50)
    print(f"Overall: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    print("=" * 50)

if __name__ == "__main__":
    main()
```

Run tests:
```bash
python test_api.py
```

## Troubleshooting

### Issue: "No module named 'easyocr'"
```bash
pip install --upgrade easyocr
```

### Issue: "No module named 'tensorflow'"
```bash
pip install tensorflow
# For GPU support:
pip install tensorflow[and-cuda]
```

### Issue: "Connection refused"
- Ensure Flask API is running on correct port
- Check firewall settings
- Verify API URL is correct

### Issue: Slow performance on first run
- First run downloads models (500MB+)
- Subsequent runs will be faster
- Use GPU for faster processing

## Performance Optimization

### Enable GPU Support

For NVIDIA GPU:
```bash
pip install tensorflow[and-cuda]
pip install tensorrt
```

For AMD GPU:
```bash
pip install tensorflow[and-rocm]
```

### Monitor Resource Usage

```bash
# On Windows
tasklist | findstr python

# On Linux/Mac
ps aux | grep python
```

## Deployment

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5001

# Start application
CMD ["python", "app.py"]
```

Build and run:

```bash
# Build
docker build -t car-insurance-ml-api .

# Run
docker run -p 5001:5001 car-insurance-ml-api
```

### Production Deployment

For production, use Gunicorn:

```bash
pip install gunicorn
gunicorn --workers 4 --bind 0.0.0.0:5001 app:app
```

## Monitoring & Logging

### Check API Logs

The API logs all requests and operations. Key indicators:

```
✅ - Success
⚠️  - Warning
❌ - Error
```

### Monitor Model Loading

The API prints model loading information on startup:

```
📊 Loading Insurance Prediction Models (JOBLIB)...
🖼️  Loading Image Verification Modules...
✅ All modules loaded successfully!
```

## Next Steps

1. ✅ Verify API is running correctly
2. ✅ Test all endpoints with sample data
3. ✅ Integrate with React frontend
4. ✅ Configure environment variables
5. ✅ Deploy to production server

## Support Resources

- **API Documentation**: See `IMAGE_VERIFICATION_README.md`
- **React Integration**: See `REACT_INTEGRATION_GUIDE.md`
- **Flask Docs**: https://flask.palletsprojects.com/
- **EasyOCR Docs**: https://github.com/JaidedAI/EasyOCR
- **TensorFlow Docs**: https://www.tensorflow.org/

## Quick Reference Commands

```bash
# Start API
python app.py

# Test API
curl http://127.0.0.1:5001/health

# Check installed packages
pip list | grep -E "flask|easyocr|tensorflow|opencv"

# Upgrade packages
pip install --upgrade -r requirements.txt

# Clear cache (if needed)
rm -rf ~/.cache/torch/
rm -rf ~/.cache/easyocr/

# Stop API
# Press Ctrl+C in terminal running the API
```

## Performance Benchmarks

| Operation | CPU (Seconds) | GPU (Seconds) |
|-----------|--------------|--------------|
| Plate OCR | 1-2 | 0.5-1 |
| License OCR | 1-2 | 0.5-1 |
| Vehicle Similarity | 4-6 | 0.5-1 |
| Prediction | 0.1-0.2 | 0.05-0.1 |

## Success Indicators

✅ All endpoints respond with 200 status code
✅ Plate OCR extracts license numbers correctly
✅ License OCR extracts name and DOB
✅ Vehicle similarity returns 0-100% scores
✅ API handles errors gracefully
✅ No memory leaks during sustained usage
