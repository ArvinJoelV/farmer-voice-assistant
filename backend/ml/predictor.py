"""
Crop Recommendation Predictor Module

This module loads the trained ML model and provides a prediction interface
for crop recommendations based on soil and weather parameters.
"""

import joblib
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional

# Paths
BASE_DIR = Path(__file__).parent.parent
MODEL_PATH = BASE_DIR / "model" / "crop_recommender.pkl"
ENCODER_PATH = BASE_DIR / "model" / "label_encoder.pkl"

# Global variables to hold loaded model and encoder
_model: Optional[object] = None
_encoder: Optional[object] = None


def _load_model():
    """
    Load the trained model and label encoder from disk.
    This is called once at module import time.
    """
    global _model, _encoder
    
    if _model is None or _encoder is None:
        try:
            if not MODEL_PATH.exists():
                raise FileNotFoundError(
                    f"Model not found at {MODEL_PATH}. "
                    "Please run training first: python -m ml.train_model"
                )
            if not ENCODER_PATH.exists():
                raise FileNotFoundError(
                    f"Encoder not found at {ENCODER_PATH}. "
                    "Please run training first: python -m ml.train_model"
                )
            
            _model = joblib.load(MODEL_PATH)
            _encoder = joblib.load(ENCODER_PATH)
            print(f"✅ Crop recommendation model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise


# Load model when module is imported
try:
    _load_model()
except FileNotFoundError:
    # Model not trained yet - will fail on first prediction
    print("⚠️  Model not found. Training required before predictions.")


def recommend_crops(
    N: float,
    P: float,
    K: float,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float,
    top_k: int = 3
) -> Dict:
    """
    Recommend crops based on soil and weather parameters.
    
    Args:
        N: Nitrogen content in soil
        P: Phosphorus content in soil
        K: Potassium content in soil
        temperature: Temperature in Celsius
        humidity: Humidity percentage (0-100)
        ph: Soil pH value
        rainfall: Rainfall in mm
        top_k: Number of top recommendations to return (default: 3)
    
    Returns:
        Dictionary containing:
        - best_crop: Name of the most recommended crop
        - confidence: Confidence score as percentage (0-100)
        - top_3: List of top K crops with their scores
        - explanation_features: Dictionary of input features for reference
    """
    # Ensure model is loaded
    if _model is None or _encoder is None:
        _load_model()
    
    # Validate inputs
    if not all(isinstance(x, (int, float)) for x in [N, P, K, temperature, humidity, ph, rainfall]):
        raise ValueError("All input parameters must be numeric")
    
    # Prepare input features in the same order as training
    features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
    
    # Get prediction probabilities for all crops
    probabilities = _model.predict_proba(features)[0]
    
    # Get class names from encoder
    class_names = _encoder.classes_
    
    # Create list of (crop_name, probability) tuples
    crop_scores = list(zip(class_names, probabilities))
    
    # Sort by probability (descending)
    crop_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Get top K crops
    top_crops = crop_scores[:top_k]
    
    # Best crop (highest probability)
    best_crop = top_crops[0][0]
    confidence = float(top_crops[0][1] * 100)  # Convert to percentage and ensure Python float
    
    # Format top K results
    top_k_list = [
        {"crop": crop, "score": float(score)}
        for crop, score in top_crops
    ]
    
    # Prepare explanation features
    explanation_features = {
        "N": float(N),
        "P": float(P),
        "K": float(K),
        "temperature": float(temperature),
        "humidity": float(humidity),
        "ph": float(ph),
        "rainfall": float(rainfall)
    }
    
    return {
        "best_crop": str(best_crop),  # Ensure string type
        "confidence": round(confidence, 2),
        "top_3": top_k_list,
        "explanation_features": explanation_features
    }


def get_available_crops() -> List[str]:
    """
    Get list of all available crop types that the model can predict.
    
    Returns:
        List of crop names
    """
    if _encoder is None:
        _load_model()
    
    return list(_encoder.classes_)

