"""
Convenience script to train the crop recommendation model.

Usage:
    python train_crop_model.py

This will:
1. Load the dataset from Crop_recommendation.csv
2. Train a RandomForestClassifier
3. Save the model to model/crop_recommender.pkl
4. Save the label encoder to model/label_encoder.pkl
"""

from ml.train_model import train_and_save_model

if __name__ == "__main__":
    print("=" * 60)
    print("🌱 Crop Recommendation Model Training")
    print("=" * 60)
    train_and_save_model()
    print("\n" + "=" * 60)
    print("✅ Training completed successfully!")
    print("=" * 60)

