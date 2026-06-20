"""
License Plate OCR Module
Extracts vehicle number from license plate images using EasyOCR
"""

import easyocr
import cv2
import numpy as np
import os
import logging
from typing import Dict, Tuple, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlateOCR:
    """Handles license plate recognition and text extraction"""
    
    def __init__(self, languages: list = ['en'], gpu: bool = False):
        """
        Initialize EasyOCR reader for plate recognition
        
        Args:
            languages: List of languages to recognize (default: ['en'])
            gpu: Whether to use GPU (default: False)
        """
        try:
            logger.info("Initializing Plate OCR Reader...")
            self.reader = easyocr.Reader(languages, gpu=gpu, verbose=False)
            self.languages = languages
            logger.info(f"✅ Plate OCR initialized with languages: {languages}")
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
    
    def clean_ocr_text(self, text: str) -> str:
        """
        Clean and format OCR extracted text
        
        Args:
            text: Raw OCR text
            
        Returns:
            Cleaned text
        """
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove common OCR errors
        text = text.replace('|', 'I').replace('0', 'O')
        
        # Convert to uppercase (license plates are typically uppercase)
        text = text.upper()
        
        # Remove special characters except dash and numbers
        cleaned = ""
        for char in text:
            if char.isalnum() or char in [' ', '-']:
                cleaned += char
        
        return cleaned.strip()
    
    def extract_plate_number(self, image_path: str) -> Dict:
        """
        Extract plate number from image
        
        Args:
            image_path: Path to license plate image
            
        Returns:
            Dictionary with extracted text and confidence
        """
        try:
            if self.reader is None:
                return {
                    'success': False,
                    'plate_number': None,
                    'raw_text': None,
                    'confidence': 0.0,
                    'error': 'OCR reader not initialized'
                }
            
            # Preprocess image
            image = self.preprocess_image(image_path)
            if image is None:
                return {
                    'success': False,
                    'plate_number': None,
                    'raw_text': None,
                    'confidence': 0.0,
                    'error': 'Image preprocessing failed'
                }
            
            logger.info("🔍 Running OCR on plate image...")
            
            # Run OCR
            results = self.reader.readtext(image, detail=1)
            
            if not results:
                logger.warning("⚠️  No text detected in image")
                return {
                    'success': False,
                    'plate_number': None,
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
            
            # Combine texts
            raw_text = ' '.join(all_texts)
            avg_confidence = np.mean(confidences) if confidences else 0.0
            
            # Clean text
            plate_number = self.clean_ocr_text(raw_text)
            
            logger.info(f"✅ Plate extracted: {plate_number} (confidence: {avg_confidence:.2f})")
            
            return {
                'success': True,
                'plate_number': plate_number,
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
            logger.error(f"❌ Error extracting plate number: {e}")
            return {
                'success': False,
                'plate_number': None,
                'raw_text': None,
                'confidence': 0.0,
                'error': str(e)
            }


# Singleton instance
_plate_ocr = None

def get_plate_ocr():
    """Get or create PlateOCR singleton"""
    global _plate_ocr
    if _plate_ocr is None:
        _plate_ocr = PlateOCR()
    return _plate_ocr