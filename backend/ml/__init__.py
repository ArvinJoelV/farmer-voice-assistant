"""
ML Module for Crop Recommendation

This module contains:
- train_model.py: Script to train the crop recommendation model
- predictor.py: Module to load and use the trained model for predictions
"""

from .predictor import recommend_crops, get_available_crops

__all__ = ['recommend_crops', 'get_available_crops']

