"""
FastAPI Router for Crop Recommendation

Provides API endpoint for smart crop recommendations based on
soil and weather parameters using ML model predictions.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from ml.predictor import recommend_crops

router = APIRouter(prefix="/crop", tags=["crop"])


class CropRequest(BaseModel):
    """Request model for crop recommendation"""
    N: float = Field(..., description="Nitrogen content in soil", ge=0, le=200)
    P: float = Field(..., description="Phosphorus content in soil", ge=0, le=200)
    K: float = Field(..., description="Potassium content in soil", ge=0, le=200)
    temperature: float = Field(..., description="Temperature in Celsius", ge=-50, le=60)
    humidity: float = Field(..., description="Humidity percentage", ge=0, le=100)
    ph: float = Field(..., description="Soil pH value", ge=0, le=14)
    rainfall: float = Field(..., description="Rainfall in mm", ge=0, le=1000)


class CropScore(BaseModel):
    """Model for crop score in recommendations"""
    crop: str
    score: float = Field(..., description="Probability score (0-1)", ge=0, le=1)


class CropPrediction(BaseModel):
    """Response model for crop recommendation"""
    best_crop: str
    confidence: float = Field(..., description="Confidence percentage (0-100)", ge=0, le=100)
    top_3: List[CropScore]
    reasoning: str
    explanation_features: dict


@router.post("/recommend", response_model=CropPrediction)
async def recommend_crop(request: CropRequest):
    """
    Get crop recommendation based on soil and weather parameters.
    
    This endpoint uses a trained RandomForestClassifier to predict
    the best crop(s) based on:
    - Soil nutrients (N, P, K)
    - Weather conditions (temperature, humidity, rainfall)
    - Soil pH
    
    Returns the top 3 crop recommendations with confidence scores.
    """
    try:
        # Get ML prediction
        result = recommend_crops(
            N=request.N,
            P=request.P,
            K=request.K,
            temperature=request.temperature,
            humidity=request.humidity,
            ph=request.ph,
            rainfall=request.rainfall,
            top_k=3
        )
        
        # Format top_3 as CropScore objects
        top_3_scores = [
            CropScore(crop=item["crop"], score=item["score"])
            for item in result["top_3"]
        ]
        
        # Generate reasoning text
        reasoning = (
            f"Based on your soil analysis (N:{request.N}, P:{request.P}, K:{request.K}, pH:{request.ph}) "
            f"and weather conditions (Temp:{request.temperature}°C, Humidity:{request.humidity}%, "
            f"Rainfall:{request.rainfall}mm), the model recommends **{result['best_crop']}** "
            f"with {result['confidence']:.1f}% confidence. "
            f"Alternative options: {', '.join([item['crop'] for item in result['top_3'][1:]])}."
        )
        
        return CropPrediction(
            best_crop=result["best_crop"],
            confidence=result["confidence"],
            top_3=top_3_scores,
            reasoning=reasoning,
            explanation_features=result["explanation_features"]
        )
        
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail="Crop recommendation model not available. Please train the model first."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating crop recommendation: {str(e)}"
        )


@router.get("/available-crops")
async def get_available_crops():
    """
    Get list of all crops that the model can recommend.
    
    Returns a list of crop names available in the trained model.
    """
    try:
        from ml.predictor import get_available_crops
        crops = get_available_crops()
        return {"crops": crops, "count": len(crops)}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving available crops: {str(e)}"
        )

