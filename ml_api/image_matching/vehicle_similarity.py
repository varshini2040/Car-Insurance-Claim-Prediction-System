"""TensorFlow image embeddings used for image-to-image identity verification."""

import logging
import os
from typing import Dict, Optional, Tuple

import numpy as np

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

    def compare_images(
        self, reference_path: str, claim_path: str, threshold: float = 0.75
    ) -> Dict:
        """Return cosine similarity as a percentage and an explicit match status."""
        reference_features = self.extract_features(reference_path)
        claim_features = self.extract_features(claim_path)

        if reference_features is None or claim_features is None:
            return {
                "success": False,
                "similarity": None,
                "match": False,
                "threshold": round(threshold * 100, 2),
                "error": "Could not extract features from one or both images",
            }

        cosine = float(np.dot(reference_features, claim_features))
        cosine = float(np.clip(cosine, 0.0, 1.0))
        percentage = round(cosine * 100, 2)
        return {
            "success": True,
            "similarity": percentage,
            "match": cosine >= threshold,
            "threshold": round(threshold * 100, 2),
            "model": self.architecture,
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


_image_similarity = None


def get_vehicle_similarity():
    """Retained name so existing imports continue to work."""
    global _image_similarity
    if _image_similarity is None:
        architecture = os.getenv("IMAGE_MODEL", "MobileNetV2")
        _image_similarity = ImageSimilarity(architecture)
    return _image_similarity
