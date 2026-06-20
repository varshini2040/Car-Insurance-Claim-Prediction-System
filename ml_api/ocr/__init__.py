"""OCR modules for vehicle and license verification"""

from .plate_ocr import PlateOCR, get_plate_ocr
from .license_ocr import LicenseOCR, get_license_ocr

__all__ = ['PlateOCR', 'LicenseOCR', 'get_plate_ocr', 'get_license_ocr']
