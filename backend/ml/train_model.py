"""
ML Model Training Script for Crop Recommendation

This module trains a RandomForestClassifier on the crop recommendation dataset
and saves the trained model and label encoder for production use.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_PATH = BASE_DIR / "Crop_recommendation.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "crop_recommender.pkl"
ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"


def train_and_save_model():
    """
    Train a RandomForestClassifier on the crop recommendation dataset.
    
    Steps:
    1. Load CSV dataset
    2. Split features and target
    3. Encode labels if needed
    4. Split into train/test sets
    5. Train RandomForestClassifier
    6. Evaluate and print metrics
    7. Save model and encoder
    """
    print("🌱 Starting Crop Recommendation Model Training...")
    print(f"📂 Loading dataset from: {DATA_PATH}")
    
    # Load dataset
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
    
    df = pd.read_csv(DATA_PATH)
    print(f"✅ Loaded {len(df)} samples")
    print(f"📊 Columns: {list(df.columns)}")
    
    # Separate features and target
    feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[feature_columns].values
    y = df['label'].values
    
    print(f"🔢 Features shape: {X.shape}")
    print(f"🎯 Target classes: {len(np.unique(y))} unique crops")
    print(f"📋 Crops: {sorted(np.unique(y))}")
    
    # Encode labels (convert crop names to integers)
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Split into train and test sets (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"📚 Training set: {len(X_train)} samples")
    print(f"🧪 Test set: {len(X_test)} samples")
    
    # Train RandomForestClassifier
    print("\n🌳 Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1  # Use all CPU cores
    )
    
    model.fit(X_train, y_train)
    print("✅ Model training completed!")
    
    # Evaluate on test set
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n📊 Model Performance:")
    print(f"   Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"\n📋 Classification Report:")
    print(classification_report(
        y_test, 
        y_pred, 
        target_names=label_encoder.classes_,
        zero_division=0
    ))
    
    # Create model directory if it doesn't exist
    MODEL_DIR.mkdir(exist_ok=True)
    
    # Save model and encoder
    joblib.dump(model, MODEL_PATH)
    joblib.dump(label_encoder, ENCODER_PATH)
    
    print(f"\n💾 Model saved to: {MODEL_PATH}")
    print(f"💾 Encoder saved to: {ENCODER_PATH}")
    print("✅ Training complete! Model is ready for production use.")
    
    return model, label_encoder, accuracy


if __name__ == "__main__":
    """
    Run training when script is executed directly.
    Usage: python -m ml.train_model
    """
    try:
        train_and_save_model()
    except Exception as e:
        print(f"❌ Error during training: {e}")
        raise

