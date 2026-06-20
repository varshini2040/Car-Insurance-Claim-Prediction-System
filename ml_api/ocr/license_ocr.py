"""
Driver License OCR Module
Extracts license number, name, and DOB from driver license images using EasyOCR
"""

import easyocr
import cv2
import numpy as np
import os
import logging
import re
from typing import Dict, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LicenseOCR:
    """Handles driver license recognition and information extraction"""
    
    def __init__(self, languages: list = ['en'], gpu: bool = False):
        """
        Initialize EasyOCR reader for license recognition
        
        Args:
            languages: List of languages to recognize (default: ['en'])
            gpu: Whether to use GPU (default: False)
        """
        try:
            logger.info("Initializing License OCR Reader...")
            self.reader = easyocr.Reader(languages, gpu=gpu, verbose=False)
            self.languages = languages
            logger.info(f"✅ License OCR initialized with languages: {languages}")
        except Exception as e:
            logger.error(f"❌ Error initializing OCR reader: {e}")
            self.reader = None
    
    def preprocess_image(self, image_path: str) -> Optional[np.ndarray]:
        """
        Load and preprocess image for OCR
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed image array or None if error
        """
        try:
            # Load image
            if not os.path.exists(image_path):
                logger.error(f"Image not found: {image_path}")
                return None
            
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Failed to read image: {image_path}")
                return None
            
            logger.info(f"📷 Image loaded: {image_path} (Shape: {image.shape})")
            
            # Convert to RGB for processing
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize if too large (for faster processing)
            height, width = image_rgb.shape[:2]
            if width > 1920 or height > 1080:
                scale = min(1920/width, 1080/height)
                new_width = int(width * scale)
                new_height = int(height * scale)
                image_rgb = cv2.resize(image_rgb, (new_width, new_height), 
                                       interpolation=cv2.INTER_AREA)
                logger.info(f"📏 Image resized to: {image_rgb.shape}")
            
            # Enhance contrast for better OCR
            lab = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            enhanced = cv2.merge([l, a, b])
            image_rgb = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
            
            logger.info("✅ Image preprocessed successfully")
            return image_rgb
            
        except Exception as e:
            logger.error(f"❌ Error preprocessing image: {e}")
            return None
    
    def extract_license_number(self, text: str) -> Optional[str]:
        """
        Extract license number from text
        License formats vary, but common patterns:
        - 10-12 alphanumeric characters
        
        Args:
            text: OCR extracted text
            
        Returns:
            Extracted license number or None
        """
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Try common license number patterns
        patterns = [
            r'[A-Z]{2}[\d]{6,8}[A-Z]{1}[\d]{4}',  # Format: XX123456A1234
            r'[A-Z]{3}[\d]{7}',  # Format: ABC1234567
            r'[A-Z]{2}[\d]{7}[A-Z]{2}',  # Format: AB1234567CD
            r'[\dA-Z]{10,12}',  # General 10-12 alphanumeric
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.upper())
            if match:
                return match.group(0)
        
        # If no pattern matches, return the longest alphanumeric sequence
        alphanumeric_sequences = re.findall(r'[A-Z0-9]{8,}', text.upper())
        if alphanumeric_sequences:
            return max(alphanumeric_sequences, key=len)
        
        return None
    
    def extract_name(self, text: str) -> Optional[str]:
        """
        Extract driver name from text
        Names are typically: FirstName LastName
        
        Args:
            text: OCR extracted text
            
        Returns:
            Extracted name or None
        """
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Split into lines
        lines = text.split('\n')
        
        # Look for name pattern (words with capital letters)
        for line in lines:
            # Skip lines with numbers or license-like patterns
            if re.search(r'\b[A-Z]{2,3}\b.*\d{6,}', line):
                continue
            
            # Check if line contains name-like text
            words = line.strip().split()
            if len(words) >= 2:
                # Check if both words start with capital letters
                if all(word[0].isupper() for word in words if len(word) > 0):
                    # Join the first two words as name
                    name = ' '.join(words[:2])
                    if not any(char.isdigit() for char in name):
                        return name
            elif len(words) == 1 and words[0][0].isupper():
                return words[0]
        
        return None
    
    def extract_dob(self, text: str) -> Optional[str]:
        """
        Extract date of birth from text
        Common formats: DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, etc.
        
        Args:
            text: OCR extracted text
            
        Returns:
            Extracted DOB in standardized format or None
        """
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Date patterns
        patterns = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # DD/MM/YYYY or MM/DD/YYYY
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY/MM/DD
            r'(\d{1,2})\.(\d{1,2})\.(\d{4})',  # DD.MM.YYYY
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                try:
                    # Try different date formats
                    if len(match[0]) == 4:  # YYYY format first
                        year, month, day = int(match[0]), int(match[1]), int(match[2])
                    else:
                        # Try to interpret as DD/MM/YYYY
                        day, month, year = int(match[0]), int(match[1]), int(match[2])
                    
                    # Validate date
                    if 1900 <= year <= 2023 and 1 <= month <= 12 and 1 <= day <= 31:
                        return f"{day:02d}/{month:02d}/{year}"
                except (ValueError, IndexError):
                    continue
        
        return None
    
    def extract_license_info(self, image_path: str) -> Dict:
        """
        Extract all license information from image
        
        Args:
            image_path: Path to driver license image
            
        Returns:
            Dictionary with extracted information
        """
        try:
            if self.reader is None:
                return {
                    'success': False,
                    'license_number': None,
                    'name': None,
                    'dob': None,
                    'raw_text': None,
                    'confidence': 0.0,
                    'error': 'OCR reader not initialized'
                }
            
            # Preprocess image
            image = self.preprocess_image(image_path)
            if image is None:
                return {
                    'success': False,
                    'license_number': None,
                    'name': None,
                    'dob': None,
                    'raw_text': None,
                    'confidence': 0.0,
                    'error': 'Image preprocessing failed'
                }
            
            logger.info("🔍 Running OCR on license image...")
            
            # Run OCR
            results = self.reader.readtext(image, detail=1)
            
            if not results:
                logger.warning("⚠️  No text detected in image")
                return {
                    'success': False,
                    'license_number': None,
                    'name': None,
                    'dob': None,
                    'raw_text': None,
                    'confidence': 0.0,
                    'error': 'No text detected in image'
                }
            
            # Combine all detected texts and get average confidence
            all_texts = []
            confidences = []
            
            for (bbox, text, confidence) in results:
                all_texts.append(text)
                confidences.append(confidence)
                logger.info(f"  - Detected: '{text}' (confidence: {confidence:.2f})")
            
            # Combine texts with newlines to preserve structure
            raw_text = '\n'.join(all_texts)
            avg_confidence = np.mean(confidences) if confidences else 0.0
            
            # Extract information
            license_number = self.extract_license_number(raw_text)
            name = self.extract_name(raw_text)
            dob = self.extract_dob(raw_text)
            
            logger.info(f"✅ License info extracted:")
            logger.info(f"   - License Number: {license_number}")
            logger.info(f"   - Name: {name}")
            logger.info(f"   - DOB: {dob}")
            logger.info(f"   - Confidence: {avg_confidence:.2f}")
            
            return {
                'success': True,
                'license_number': license_number,
                'name': name,
                'dob': dob,
                'raw_text': raw_text,
                'confidence': round(avg_confidence, 3),
                'all_detections': [
                    {
                        'text': text,
                        'confidence': round(float(conf), 3)
                    }
                    for text, conf in zip(all_texts, confidences)
                ]
            }
            
        except Exception as e:
            logger.error(f"❌ Error extracting license info: {e}")
            return {
                'success': False,
                'license_number': None,
                'name': None,
                'dob': None,
                'raw_text': None,
                'confidence': 0.0,
                'error': str(e)
            }


# Singleton instance
_license_ocr = None

def get_license_ocr():
    """Get or create LicenseOCR singleton"""
    global _license_ocr
    if _license_ocr is None:
        _license_ocr = LicenseOCR()
    return _license_ocr