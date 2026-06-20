# API Quick Reference

## Base URL
```
http://127.0.0.1:5001
```

## Endpoints Overview

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/health` | GET | System health check | ✅ Existing |
| `/model-info` | GET | Model information | ✨ New |
| `/predict` | POST | Fraud prediction | ✅ Existing |
| `/verify-plate` | POST | License plate OCR | ✨ New |
| `/verify-license` | POST | Driver license OCR | ✨ New |
| `/verify-vehicle` | POST | Vehicle similarity | ✨ New |

---

## 1. Health Check
```
GET /health
```

**Purpose**: Verify API and all modules are running

**Response**:
```json
{
  "status": "ok",
  "prediction_model": "loaded",
  "plate_ocr": "loaded",
  "license_ocr": "loaded",
  "vehicle_similarity": "loaded"
}
```

---

## 2. Model Information
```
GET /model-info
```

**Purpose**: Get detailed information about all loaded models

**Response**:
```json
{
  "prediction_model": {
    "status": "loaded",
    "type": "RandomForestClassifier"
  },
  "plate_ocr": {
    "status": "loaded",
    "languages": ["en"]
  },
  "license_ocr": {
    "status": "loaded",
    "languages": ["en"]
  },
  "vehicle_similarity": {
    "status": "loaded",
    "model_type": "ResNet50",
    "feature_dimension": 2048,
    "total_parameters": 25636712
  }
}
```

---

## 3. Plate Verification
```
POST /verify-plate
Content-Type: multipart/form-data
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| image | File | Yes | License plate image (PNG, JPG, GIF, etc.) |

**Example - cURL**:
```bash
curl -X POST http://127.0.0.1:5001/verify-plate \
  -F "image=@license_plate.jpg"
```

**Example - Python**:
```python
import requests

with open('license_plate.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post(
        'http://127.0.0.1:5001/verify-plate',
        files=files
    )
    print(response.json())
```

**Example - JavaScript**:
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('http://127.0.0.1:5001/verify-plate', {
  method: 'POST',
  body: formData
});
const result = await response.json();
```

**Success Response**:
```json
{
  "success": true,
  "plate_number": "TN39AB1234",
  "raw_text": "TN39 AB1234",
  "confidence": 0.95,
  "match": true,
  "all_detections": [
    {
      "text": "TN39",
      "confidence": 0.96
    },
    {
      "text": "AB1234",
      "confidence": 0.94
    }
  ]
}
```

**Error Response**:
```json
{
  "success": false,
  "plate_number": null,
  "error": "No text detected in image"
}
```

---

## 4. License Verification
```
POST /verify-license
Content-Type: multipart/form-data
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| image | File | Yes | Driver license image |

**Example - cURL**:
```bash
curl -X POST http://127.0.0.1:5001/verify-license \
  -F "image=@driver_license.jpg"
```

**Success Response**:
```json
{
  "success": true,
  "license_number": "TN123456789",
  "name": "John Doe",
  "dob": "15/05/1985",
  "raw_text": "License Number: TN123456789...",
  "confidence": 0.92,
  "match": true,
  "all_detections": [
    {
      "text": "TN123456789",
      "confidence": 0.94
    },
    {
      "text": "John Doe",
      "confidence": 0.89
    },
    {
      "text": "15/05/1985",
      "confidence": 0.91
    }
  ]
}
```

---

## 5. Vehicle Verification
```
POST /verify-vehicle
Content-Type: multipart/form-data
```

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| image1 | File | Yes | - | First vehicle image |
| image2 | File | Yes | - | Second vehicle image |
| threshold | Float | No | 0.7 | Similarity threshold (0-1) |

**Example - cURL**:
```bash
curl -X POST http://127.0.0.1:5001/verify-vehicle \
  -F "image1=@car_app.jpg" \
  -F "image2=@car_claim.jpg" \
  -F "threshold=0.7"
```

**Example - Python**:
```python
import requests

with open('car_app.jpg', 'rb') as f1, open('car_claim.jpg', 'rb') as f2:
    files = {
        'image1': f1,
        'image2': f2
    }
    data = {'threshold': 0.7}
    response = requests.post(
        'http://127.0.0.1:5001/verify-vehicle',
        files=files,
        data=data
    )
    print(response.json())
```

**Example - JavaScript**:
```javascript
const formData = new FormData();
formData.append('image1', imageFile1);
formData.append('image2', imageFile2);
formData.append('threshold', 0.7);

const response = await fetch('http://127.0.0.1:5001/verify-vehicle', {
  method: 'POST',
  body: formData
});
const result = await response.json();
```

**Success Response**:
```json
{
  "success": true,
  "similarity": 92.4,
  "similarity_score": 0.924,
  "match": true,
  "threshold": 0.7,
  "match_confidence": "High",
  "features1_dimension": 2048,
  "features2_dimension": 2048
}
```

**Match Confidence Levels**:
| Similarity | Confidence |
|-----------|-----------|
| > 85% | High |
| 70-85% | Medium |
| < 70% | Low |

---

## 6. Fraud Prediction (Existing)
```
POST /predict
Content-Type: application/json
```

**Parameters**:
```json
{
  "age": 30,
  "gender": "Male",
  "vehicle_age": 5,
  "vehicle_type": "Sedan",
  "annual_premium": 15000,
  "driving_experience": 10,
  "accident_history": 0,
  "claim_history": 1,
  "credit_score": 750,
  "policy_duration": 2
}
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | - |
| 400 | Bad Request | Check parameters |
| 500 | Server Error | Check API logs |

---

## Common Errors

### "No image provided"
- **Cause**: Missing image in form data
- **Solution**: Ensure `image` or `image1`/`image2` fields are in request

### "No text detected in image"
- **Cause**: Image quality too low or no text in image
- **Solution**: Use clearer, larger images (300x300px minimum)

### "OCR reader not initialized"
- **Cause**: EasyOCR not installed or failed to initialize
- **Solution**: `pip install easyocr` and restart API

### "Model not initialized"
- **Cause**: TensorFlow not installed
- **Solution**: `pip install tensorflow` and restart API

### "File upload failed"
- **Cause**: File too large or invalid format
- **Solution**: Use files < 10MB, supported formats: PNG, JPG, GIF, WebP

---

## Rate Limits
Currently no rate limits. For production, consider implementing:
- 100 requests/minute per IP
- 10 MB max upload size
- 30 second request timeout

---

## Performance Tips

### Optimize Images
```python
from PIL import Image

# Resize image
img = Image.open('large_image.jpg')
img.thumbnail((1024, 768), Image.Resampling.LANCZOS)
img.save('optimized_image.jpg', quality=85)
```

### Use Smaller Images
- OCR: 300x300 to 1024x768 pixels
- Similarity: 224x224 to 512x512 pixels

### Batch Processing
```python
import os
from pathlib import Path

images_dir = 'images/'
results = []

for image_file in Path(images_dir).glob('*.jpg'):
    with open(image_file, 'rb') as f:
        files = {'image': f}
        response = requests.post('http://127.0.0.1:5001/verify-plate', 
                               files=files)
        results.append({
            'file': image_file.name,
            'result': response.json()
        })

# Process results
for item in results:
    print(f"{item['file']}: {item['result']['plate_number']}")
```

---

## Testing Commands

### Test All Endpoints
```bash
#!/bin/bash

# Health check
echo "Testing health check..."
curl http://127.0.0.1:5001/health
echo "\n"

# Model info
echo "Testing model info..."
curl http://127.0.0.1:5001/model-info
echo "\n"

# Plate verification
echo "Testing plate verification..."
curl -X POST http://127.0.0.1:5001/verify-plate \
  -F "image=@test_images/plate.jpg"
echo "\n"

# License verification
echo "Testing license verification..."
curl -X POST http://127.0.0.1:5001/verify-license \
  -F "image=@test_images/license.jpg"
echo "\n"

# Vehicle verification
echo "Testing vehicle verification..."
curl -X POST http://127.0.0.1:5001/verify-vehicle \
  -F "image1=@test_images/car1.jpg" \
  -F "image2=@test_images/car2.jpg"
echo "\n"
```

---

## Response Time Expectations

| Operation | Time (CPU) | Time (GPU) |
|-----------|-----------|-----------|
| Health Check | < 50ms | < 50ms |
| Model Info | < 50ms | < 50ms |
| Plate OCR | 1-2s | 0.5-1s |
| License OCR | 1-2s | 0.5-1s |
| Vehicle Similarity | 4-6s | 0.5-1s |
| Fraud Prediction | 100-200ms | 50-100ms |

---

## Integration Examples

### React Hook
```javascript
import { useState } from 'react';

const usePlateVerification = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const verify = async (imageFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch('http://127.0.0.1:5001/verify-plate', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { verify, loading, result, error };
};
```

### Node.js Server
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function verifyPlate(imagePath) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));

  const response = await axios.post(
    'http://127.0.0.1:5001/verify-plate',
    formData,
    { headers: formData.getHeaders() }
  );

  return response.data;
}
```

---

## Status Codes Summary

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid parameters |
| 500 | Server Error | Server-side error |

---

## Version Info
- **API Version**: 1.0
- **Python**: 3.8+
- **Flask**: 2.3.2
- **EasyOCR**: 1.7.0
- **TensorFlow**: 2.15.0

---

## Additional Resources
- Full Documentation: `IMAGE_VERIFICATION_README.md`
- React Integration: `REACT_INTEGRATION_GUIDE.md`
- Setup Guide: `SETUP_AND_TESTING.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
