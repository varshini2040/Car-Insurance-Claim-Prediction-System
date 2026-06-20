"""TensorFlow image embeddings used for image-to-image identity verification."""

import logging
import os
import hashlib
from typing import Dict, Optional, Tuple

import numpy as np
from PIL import Image, ImageOps

try:
    import cv2

    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import pillow_avif  # noqa: F401 - registers AVIF support with Pillow
except ImportError:
    pillow_avif = None

try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2, ResNet50
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
    from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
    from tensorflow.keras.preprocessing import image as keras_image

    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

logger = logging.getLogger(__name__)


class ImageSimilarity:
    """Extracts ImageNet embeddings and compares two uploaded images."""

    def __init__(self, architecture: str = "MobileNetV2"):
        self.architecture = architecture
        self.model = None
        self.preprocess = None
        self.target_size: Tuple[int, int] = (224, 224)

        if not TF_AVAILABLE:
            logger.error("TensorFlow is unavailable")
            return

        try:
            if architecture.lower() == "resnet50":
                self.model = ResNet50(weights="imagenet", include_top=False, pooling="avg")
                self.preprocess = resnet_preprocess
                self.architecture = "ResNet50"
            else:
                self.model = MobileNetV2(weights="imagenet", include_top=False, pooling="avg")
                self.preprocess = mobilenet_preprocess
                self.architecture = "MobileNetV2"
            logger.info("%s image embedding model loaded", self.architecture)
        except Exception as exc:
            logger.exception("Could not initialize image embedding model: %s", exc)
            self.model = None

    def extract_features(self, image_path: str) -> Optional[np.ndarray]:
        if self.model is None or not os.path.isfile(image_path):
            return None

        try:
            loaded = keras_image.load_img(
                image_path, target_size=self.target_size, color_mode="rgb"
            )
            array = keras_image.img_to_array(loaded)
            batch = np.expand_dims(array, axis=0)
            features = self.model.predict(self.preprocess(batch), verbose=0)[0]
            norm = np.linalg.norm(features)
            return features / norm if norm else None
        except Exception as exc:
            logger.warning("Feature extraction failed for %s: %s", image_path, exc)
            return None

    @staticmethod
    def _file_hash(image_path: str) -> Optional[str]:
        """Return a SHA-256 hash so byte-identical uploads can bypass decoding."""
        try:
            digest = hashlib.sha256()
            with open(image_path, "rb") as image_file:
                for chunk in iter(lambda: image_file.read(1024 * 1024), b""):
                    digest.update(chunk)
            return digest.hexdigest()
        except OSError:
            return None

    @staticmethod
    def _calibrate_embedding_score(cosine: float) -> float:
        """
        ImageNet embeddings commonly give unrelated photos a 0.45-0.60 cosine score.
        Re-scale that background similarity so the displayed percentage reflects identity.
        """
        background_floor = 0.50
        calibrated = (cosine - background_floor) / (1.0 - background_floor)
        return float(np.clip(calibrated, 0.0, 1.0)) * 100

    @staticmethod
    def _load_visual_array(image_path: str, size: Tuple[int, int] = (256, 256)) -> Optional[np.ndarray]:
        try:
            with Image.open(image_path) as loaded:
                loaded = ImageOps.exif_transpose(loaded).convert("RGB")
                loaded.thumbnail(size)
                canvas = Image.new("RGB", size, (0, 0, 0))
                offset = ((size[0] - loaded.width) // 2, (size[1] - loaded.height) // 2)
                canvas.paste(loaded, offset)
                return np.asarray(canvas)
        except Exception as exc:
            logger.warning("Could not load visual comparison image %s: %s", image_path, exc)
            return None

    @staticmethod
    def _aspect_ratio(image_path: str) -> Optional[float]:
        try:
            with Image.open(image_path) as loaded:
                width, height = loaded.size
                return width / height if height else None
        except Exception:
            return None

    @staticmethod
    def _aspect_similarity(reference_path: str, claim_path: str) -> float:
        first = ImageSimilarity._aspect_ratio(reference_path)
        second = ImageSimilarity._aspect_ratio(claim_path)
        if not first or not second:
            return 0.0
        return min(first, second) / max(first, second) * 100

    @staticmethod
    def _perceptual_hash_similarity(reference_path: str, claim_path: str) -> float:
        if not CV2_AVAILABLE:
            return 0.0

        def phash(path: str) -> Optional[np.ndarray]:
            try:
                with Image.open(path) as loaded:
                    gray = ImageOps.exif_transpose(loaded).convert("L").resize(
                        (32, 32), Image.Resampling.LANCZOS
                    )
                pixels = np.asarray(gray, dtype=np.float32)
                dct = cv2.dct(pixels)
                block = dct[:8, :8]
                median = np.median(block[1:, 1:])
                return block > median
            except Exception as exc:
                logger.warning("pHash failed for %s: %s", path, exc)
                return None

        first = phash(reference_path)
        second = phash(claim_path)
        if first is None or second is None:
            return 0.0
        distance = np.count_nonzero(first != second)
        return (1.0 - (distance / first.size)) * 100

    @staticmethod
    def _color_similarity(reference_path: str, claim_path: str) -> float:
        if not CV2_AVAILABLE:
            return 0.0

        first = ImageSimilarity._load_visual_array(reference_path)
        second = ImageSimilarity._load_visual_array(claim_path)
        if first is None or second is None:
            return 0.0

        first_hsv = cv2.cvtColor(first, cv2.COLOR_RGB2HSV)
        second_hsv = cv2.cvtColor(second, cv2.COLOR_RGB2HSV)
        first_hist = cv2.calcHist([first_hsv], [0, 1, 2], None, [8, 8, 8], [0, 180, 0, 256, 0, 256])
        second_hist = cv2.calcHist([second_hsv], [0, 1, 2], None, [8, 8, 8], [0, 180, 0, 256, 0, 256])
        cv2.normalize(first_hist, first_hist)
        cv2.normalize(second_hist, second_hist)
        correlation = cv2.compareHist(first_hist, second_hist, cv2.HISTCMP_CORREL)
        return float(np.clip((correlation + 1.0) / 2.0, 0.0, 1.0)) * 100

    def _calibrated_visual_similarity(
        self, reference_path: str, claim_path: str, cosine: float
    ) -> Tuple[float, Dict[str, float]]:
        embedding = self._calibrate_embedding_score(cosine)
        phash = self._perceptual_hash_similarity(reference_path, claim_path)
        color = self._color_similarity(reference_path, claim_path)
        aspect = self._aspect_similarity(reference_path, claim_path)

        score = (
            embedding * 0.72
            + phash * 0.18
            + color * 0.07
            + aspect * 0.03
        )
        components = {
            "embedding": round(embedding, 2),
            "perceptual_hash": round(phash, 2),
            "color": round(color, 2),
            "aspect": round(aspect, 2),
        }
        return round(float(np.clip(score, 0.0, 100.0)), 2), components

    def compare_images(
        self, reference_path: str, claim_path: str, threshold: float = 0.75
    ) -> Dict:
        """Return calibrated visual identity similarity and an explicit match status."""
        reference_hash = self._file_hash(reference_path)
        claim_hash = self._file_hash(claim_path)
        if reference_hash and reference_hash == claim_hash:
            return {
                "success": True,
                "similarity": 100.0,
                "match": True,
                "threshold": round(threshold * 100, 2),
                "model": f"{self.architecture} + SHA-256 exact-match",
            }

        reference_features = self.extract_features(reference_path)
        claim_features = self.extract_features(claim_path)

        if reference_features is None or claim_features is None:
            return {
                "success": False,
                "similarity": None,
                "match": False,
                "threshold": round(threshold * 100, 2),
                "error": (
                    "Could not decode or extract features from one or both images. "
                    "For AVIF files install pillow-avif-plugin and restart Flask."
                ),
            }

        cosine = float(np.dot(reference_features, claim_features))
        cosine = float(np.clip(cosine, 0.0, 1.0))
        percentage, components = self._calibrated_visual_similarity(
            reference_path,
            claim_path,
            cosine,
        )
        return {
            "success": True,
            "similarity": percentage,
            "match": percentage >= (threshold * 100),
            "threshold": round(threshold * 100, 2),
            "model": f"{self.architecture} + calibrated visual identity",
            "raw_embedding_similarity": round(cosine * 100, 2),
            "similarity_components": components,
        }

    def compare_vehicle_images(
        self, image1_path: str, image2_path: str, threshold: float = 0.72
    ) -> Dict:
        """Backward-compatible alias used by the original vehicle endpoint."""
        return self.compare_images(image1_path, image2_path, threshold)

    def get_model_info(self) -> Dict:
        return {
            "status": "loaded" if self.model is not None else "not_loaded",
            "model_type": self.architecture if self.model is not None else None,
            "input_shape": self.model.input_shape if self.model is not None else None,
            "feature_dimension": (
                int(self.model.output_shape[-1]) if self.model is not None else None
            ),
        }


# Compatibility name retained for older imports and project documentation.
VehicleSimilarity = ImageSimilarity

_image_similarity = None


def get_vehicle_similarity():
    """Retained name so existing imports continue to work."""
    global _image_similarity
    if _image_similarity is None:
        architecture = os.getenv("IMAGE_MODEL", "MobileNetV2")
        _image_similarity = ImageSimilarity(architecture)
    return _image_similarity
