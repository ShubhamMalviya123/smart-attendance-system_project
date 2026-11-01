"""
Core face detection/recognition utilities.

Uses 'dlib-bin' (prebuilt wheels) directly instead of the 'face_recognition' package,
because that package tries to compile dlib from source on Windows (needs a C++ compiler).
Function names and behaviour are unchanged, so app.py needs no changes.
"""
import importlib.util
import os
from typing import List, Tuple

import cv2
import dlib
import numpy as np

# Locate the face_recognition_models folder without importing the package
# (it depends on 'pkg_resources', which newer setuptools versions no longer ship).
_spec = importlib.util.find_spec("face_recognition_models")
_MODEL_DIR = os.path.join(os.path.dirname(_spec.origin), "models")

_detector = dlib.get_frontal_face_detector()
_shape_predictor = dlib.shape_predictor(os.path.join(_MODEL_DIR, "shape_predictor_5_face_landmarks.dat"))
_encoder = dlib.face_recognition_model_v1(os.path.join(_MODEL_DIR, "dlib_face_recognition_resnet_model_v1.dat"))


def load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    """Decode raw image bytes into an RGB numpy array."""
    np_arr = np.frombuffer(image_bytes, np.uint8)
    bgr_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if bgr_image is None:
        raise ValueError("Could not decode image - unsupported format or corrupted file")
    return cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)


def resize_for_speed(rgb_image: np.ndarray, max_width: int = 640) -> np.ndarray:
    """
    Downscales an image so its width is at most `max_width`, preserving aspect ratio.
    Face detection/encoding time scales heavily with pixel count, so this is the
    single biggest speed lever.
    """
    height, width = rgb_image.shape[:2]
    if width > max_width:
        scale = max_width / width
        rgb_image = cv2.resize(rgb_image, (max_width, int(height * scale)), interpolation=cv2.INTER_AREA)
    return np.ascontiguousarray(rgb_image)   # dlib needs a contiguous uint8 array


def detect_faces(rgb_image: np.ndarray, upsample: int = 1) -> List[Tuple[int, int, int, int]]:
    """Returns list of face bounding boxes (top, right, bottom, left)."""
    rects = _detector(np.ascontiguousarray(rgb_image), upsample)
    h, w = rgb_image.shape[:2]
    boxes = []
    for r in rects:
        boxes.append((max(r.top(), 0), min(r.right(), w), min(r.bottom(), h), max(r.left(), 0)))
    return boxes


def get_face_encodings(rgb_image: np.ndarray, face_locations=None) -> List[np.ndarray]:
    """Returns list of 128-d face encodings for all faces found in the image."""
    rgb_image = np.ascontiguousarray(rgb_image)
    if face_locations is None:
        face_locations = detect_faces(rgb_image)
    encodings = []
    for (top, right, bottom, left) in face_locations:
        rect = dlib.rectangle(left, top, right, bottom)
        shape = _shape_predictor(rgb_image, rect)
        encodings.append(np.array(_encoder.compute_face_descriptor(rgb_image, shape, 1)))
    return encodings


def average_encodings(encodings_list: List[np.ndarray]) -> np.ndarray:
    """Averages multiple encodings of the same person (from multiple registration images)."""
    if not encodings_list:
        raise ValueError("No face encodings provided to average")
    return np.mean(np.array(encodings_list), axis=0)


def match_face(unknown_encoding: np.ndarray, known_encodings: List[np.ndarray],
               known_roll_nos: List[str], tolerance: float = 0.5):
    """
    Compares one unknown face encoding against all known encodings.
    Returns (roll_no, confidence) of best match, or (None, 0.0) if no match within tolerance.
    Lower face distance = better match; confidence = 1 - distance (approx).
    """
    if not known_encodings:
        return None, 0.0

    distances = np.linalg.norm(np.array(known_encodings) - unknown_encoding, axis=1)
    best_idx = int(np.argmin(distances))
    best_distance = float(distances[best_idx])

    if best_distance <= tolerance:
        return known_roll_nos[best_idx], round(1 - best_distance, 4)

    return None, 0.0
