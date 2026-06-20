# Integration Guide - Image Verification with React Frontend

## Overview

This guide explains how to integrate the image verification endpoints into your React-based Car Insurance Claim Prediction System frontend.

## Frontend Service Integration

### 1. Create Image Verification Service

Create a new file: `src/services/imageVerificationService.js`

```javascript
import api from './api';

/**
 * Image Verification Service
 * Handles all image verification operations: plate OCR, license OCR, vehicle similarity
 */

// Plate Verification
export const verifyPlate = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/verify-plate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Plate verification error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// License Verification
export const verifyLicense = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/verify-license', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('License verification error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Vehicle Similarity Verification
export const verifyVehicleSimilarity = async (image1File, image2File, threshold = 0.7) => {
  try {
    const formData = new FormData();
    formData.append('image1', image1File);
    formData.append('image2', image2File);
    formData.append('threshold', threshold);
    
    const response = await api.post('/verify-vehicle', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Vehicle verification error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get Model Information
export const getModelInfo = async () => {
  try {
    const response = await api.get('/model-info');
    return response.data;
  } catch (error) {
    console.error('Model info error:', error);
    return null;
  }
};

// Check API Health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    return null;
  }
};
```

### 2. Update API Service

Update your `src/services/api.js` to ensure it's properly configured:

```javascript
import axios from 'axios';

// Create axios instance with API base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001',
  timeout: 30000  // 30 seconds timeout for image processing
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## React Component Examples

### 1. Plate Verification Component

Create: `src/components/PlateVerificationForm.js`

```javascript
import React, { useState } from 'react';
import { verifyPlate } from '../services/imageVerificationService';
import './PlateVerificationForm.css';

const PlateVerificationForm = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return;
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Please select an image');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const response = await verifyPlate(file);
    
    if (response.success) {
      setResult(response);
    } else {
      setError(response.error || 'Verification failed');
    }
    
    setLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="plate-verification-form">
      <h2>🚗 License Plate Verification</h2>
      
      <div className="form-section">
        <div className="file-upload-area">
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" />
              <button className="remove-btn" onClick={() => { setFile(null); setPreview(null); }}>
                ✕ Remove
              </button>
            </div>
          ) : (
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <span>📁 Click to upload or drag and drop</span>
              <small>PNG, JPG, GIF up to 10MB</small>
            </label>
          )}
        </div>
        
        {file && (
          <div className="file-info">
            <p><strong>File:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
        
        <div className="button-group">
          <button 
            className="verify-btn"
            onClick={handleVerify}
            disabled={!file || loading}
          >
            {loading ? '⏳ Processing...' : '✓ Verify Plate'}
          </button>
          <button 
            className="reset-btn"
            onClick={handleReset}
            disabled={!file && !result}
          >
            🔄 Reset
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}
      
      {result && (
        <div className="result-section">
          <div className={`alert ${result.match ? 'alert-success' : 'alert-warning'}`}>
            <h3>Verification Result</h3>
            <div className="result-item">
              <label>Plate Number:</label>
              <strong>{result.plate_number || 'Not detected'}</strong>
            </div>
            <div className="result-item">
              <label>Confidence:</label>
              <span className="confidence-badge">{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="result-item">
              <label>Status:</label>
              <span className={`status-badge ${result.match ? 'status-success' : 'status-error'}`}>
                {result.match ? '✓ Detected' : '✗ Not detected'}
              </span>
            </div>
            
            {result.all_detections && result.all_detections.length > 0 && (
              <details className="detections-details">
                <summary>📊 All Detections ({result.all_detections.length})</summary>
                <div className="detections-list">
                  {result.all_detections.map((det, idx) => (
                    <div key={idx} className="detection-item">
                      <code>{det.text}</code>
                      <span className="detection-confidence">{(det.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlateVerificationForm;
```

CSS: `src/components/PlateVerificationForm.css`

```css
.plate-verification-form {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 20px auto;
}

.plate-verification-form h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-upload-area {
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-area:hover {
  border-color: #0056b3;
  background: #e7f3ff;
}

.file-input-label {
  display: block;
  cursor: pointer;
}

.file-input-label input {
  display: none;
}

.file-input-label span {
  display: block;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 5px;
}

.file-input-label small {
  display: block;
  color: #666;
  font-size: 12px;
}

.preview-container {
  position: relative;
  display: inline-block;
}

.preview-container img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
}

.file-info {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.file-info p {
  margin: 5px 0;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.verify-btn, .reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.verify-btn {
  background: #28a745;
  color: white;
}

.verify-btn:hover:not(:disabled) {
  background: #218838;
}

.verify-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover:not(:disabled) {
  background: #5a6268;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
}

.alert-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.alert-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-warning {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
}

.result-section {
  margin-top: 20px;
}

.result-section h3 {
  margin-top: 0;
  color: #333;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item label {
  font-weight: 600;
  color: #555;
}

.confidence-badge, .status-badge {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
}

.status-success {
  background: #d4edda;
  color: #155724;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
}

.detections-details {
  margin-top: 15px;
  cursor: pointer;
}

.detections-details summary {
  padding: 10px;
  background: #f0f0f0;
  border-radius: 4px;
  font-weight: 600;
  color: #333;
}

.detections-details summary:hover {
  background: #e0e0e0;
}

.detections-list {
  margin-top: 10px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
}

.detection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 3px;
  margin-bottom: 5px;
  font-size: 14px;
}

.detection-item code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

.detection-confidence {
  color: #28a745;
  font-weight: 600;
}
```

### 2. Vehicle Similarity Component

Create: `src/components/VehicleVerificationForm.js`

```javascript
import React, { useState } from 'react';
import { verifyVehicleSimilarity } from '../services/imageVerificationService';
import './VehicleVerificationForm.css';

const VehicleVerificationForm = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [threshold, setThreshold] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event, position) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return;
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image file');
      return;
    }
    
    if (position === 1) {
      setImage1(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview1(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setImage2(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview2(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
    
    setError(null);
  };

  const handleCompare = async () => {
    if (!image1 || !image2) {
      setError('Please select both images');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const response = await verifyVehicleSimilarity(image1, image2, threshold);
    
    if (response.success) {
      setResult(response);
    } else {
      setError(response.error || 'Verification failed');
    }
    
    setLoading(false);
  };

  const handleReset = () => {
    setImage1(null);
    setImage2(null);
    setPreview1(null);
    setPreview2(null);
    setResult(null);
    setError(null);
    setThreshold(0.7);
  };

  return (
    <div className="vehicle-verification-form">
      <h2>🚗 Vehicle Similarity Verification</h2>
      
      <div className="images-grid">
        {/* Image 1 */}
        <div className="image-upload">
          <h3>Insurance Application Image</h3>
          {preview1 ? (
            <div className="preview-container">
              <img src={preview1} alt="Image 1" />
              <button className="remove-btn" onClick={() => { setImage1(null); setPreview1(null); }}>
                ✕
              </button>
            </div>
          ) : (
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 1)}
              />
              <span>📁 Upload Image 1</span>
            </label>
          )}
        </div>
        
        {/* Image 2 */}
        <div className="image-upload">
          <h3>Claim Submission Image</h3>
          {preview2 ? (
            <div className="preview-container">
              <img src={preview2} alt="Image 2" />
              <button className="remove-btn" onClick={() => { setImage2(null); setPreview2(null); }}>
                ✕
              </button>
            </div>
          ) : (
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 2)}
              />
              <span>📁 Upload Image 2</span>
            </label>
          )}
        </div>
      </div>
      
      {/* Threshold Slider */}
      <div className="threshold-control">
        <label>
          Similarity Threshold: <strong>{(threshold * 100).toFixed(0)}%</strong>
        </label>
        <input
          type="range"
          min="0.5"
          max="0.95"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="threshold-slider"
        />
        <div className="threshold-labels">
          <span>50%</span>
          <span>95%</span>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="button-group">
        <button 
          className="compare-btn"
          onClick={handleCompare}
          disabled={!image1 || !image2 || loading}
        >
          {loading ? '⏳ Comparing...' : '🔍 Compare Vehicles'}
        </button>
        <button 
          className="reset-btn"
          onClick={handleReset}
          disabled={!image1 && !image2 && !result}
        >
          🔄 Reset
        </button>
      </div>
      
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}
      
      {result && (
        <div className="result-section">
          <div className={`alert ${result.match ? 'alert-success' : 'alert-warning'}`}>
            <h3>Comparison Result</h3>
            
            {/* Similarity Score */}
            <div className="similarity-score">
              <div className="score-value">{result.similarity.toFixed(1)}%</div>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{
                    width: `${result.similarity}%`,
                    backgroundColor: result.match ? '#28a745' : '#ffc107'
                  }}
                />
              </div>
            </div>
            
            {/* Results */}
            <div className="result-items">
              <div className="result-item">
                <label>Match Status:</label>
                <span className={`status-badge ${result.match ? 'status-success' : 'status-error'}`}>
                  {result.match ? '✓ Same Vehicle' : '✗ Different Vehicle'}
                </span>
              </div>
              
              <div className="result-item">
                <label>Confidence Level:</label>
                <span className="confidence-badge">{result.match_confidence}</span>
              </div>
              
              <div className="result-item">
                <label>Threshold Used:</label>
                <span>{(result.threshold * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleVerificationForm;
```

CSS: `src/components/VehicleVerificationForm.css`

```css
.vehicle-verification-form {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 800px;
  margin: 20px auto;
}

.vehicle-verification-form h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.images-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.image-upload {
  display: flex;
  flex-direction: column;
}

.image-upload h3 {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}

.image-upload .file-input-label {
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
}

.image-upload .file-input-label:hover {
  border-color: #0056b3;
  background: #e7f3ff;
}

.image-upload .file-input-label input {
  display: none;
}

.image-upload .file-input-label span {
  display: block;
  font-weight: 600;
  color: #007bff;
}

.preview-container {
  position: relative;
  display: block;
  border-radius: 8px;
  overflow: hidden;
}

.preview-container img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

.preview-container .remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.threshold-control {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.threshold-control label {
  display: block;
  margin-bottom: 10px;
  color: #333;
  font-weight: 600;
}

.threshold-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  margin-bottom: 5px;
}

.threshold-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.threshold-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.threshold-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.compare-btn, .reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.compare-btn {
  background: #007bff;
  color: white;
}

.compare-btn:hover:not(:disabled) {
  background: #0056b3;
}

.compare-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover:not(:disabled) {
  background: #5a6268;
}

.alert {
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.alert h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.alert-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-warning {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
}

.alert-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.similarity-score {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
}

.score-bar {
  height: 30px;
  background: #e9ecef;
  border-radius: 15px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.result-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255,255,255,0.5);
  border-radius: 4px;
}

.result-item label {
  font-weight: 600;
}

.status-badge, .confidence-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  background: white;
}

.status-success {
  color: #155724;
  background: #d4edda;
}

.status-error {
  color: #721c24;
  background: #f8d7da;
}

.confidence-badge {
  color: #007bff;
  background: white;
}

@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .compare-btn, .reset-btn {
    width: 100%;
  }
}
```

## Integration Steps

1. **Update API Base URL**
   ```
   Create .env file:
   REACT_APP_API_URL=http://127.0.0.1:5001
   ```

2. **Install Components**
   ```
   Add components to your React application
   Import services in your pages
   ```

3. **Add Routes (if using React Router)**
   ```javascript
   import PlateVerificationForm from './components/PlateVerificationForm';
   import VehicleVerificationForm from './components/VehicleVerificationForm';
   
   // In your router configuration
   { path: '/verify-plate', component: PlateVerificationForm },
   { path: '/verify-vehicle', component: VehicleVerificationForm }
   ```

4. **Test Integration**
   ```bash
   # Terminal 1: Start Flask API
   cd ml_api
   python app.py
   
   # Terminal 2: Start React Frontend
   npm start
   ```

## API Error Handling

The frontend components handle common API errors:

- **File upload errors**: User feedback on file selection
- **Network errors**: Connection failure messages
- **Processing errors**: Specific error messages from API
- **Timeout handling**: 30-second timeout for long operations

## Performance Tips

1. **Image Size Optimization**
   - Compress images before upload
   - Use JPEG format for faster processing
   - Maximum recommended size: 1024x768

2. **Caching**
   - Cache verification results to avoid re-processing
   - Show loading states during API calls

3. **Error Recovery**
   - Implement retry logic for network failures
   - Provide clear user guidance

## Testing

Test the integration with sample images:

```javascript
// In browser console
async function testPlateVerification() {
  const file = /* selected image file */;
  const result = await window.verifyPlate(file);
  console.log(result);
}
```

## Next Steps

1. Integrate components into your existing pages
2. Add result storage/persistence
3. Implement batch processing
4. Add result history/analytics
5. Create admin dashboard for verification results
