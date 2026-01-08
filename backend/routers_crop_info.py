"""
Crop Information API Router

Provides endpoints to fetch crop-specific information including:
- Crop growth stages and calendar
- Stage-wise recommendations
- Crop-specific advice
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os
from pathlib import Path

router = APIRouter(prefix="/crop-info", tags=["crop-info"])

# Path to crop database (JSON file with crop information)
DATA_DIR = Path(__file__).parent.parent / "data"
CROP_DB_PATH = DATA_DIR / "crop_database.json"

# Create data directory if it doesn't exist
DATA_DIR.mkdir(exist_ok=True)


class CropStage(BaseModel):
    """Model for crop growth stage"""
    name: str
    duration: int  # days
    actions: List[str]
    fertilizers: List[str]
    irrigation: str
    pest: List[str]
    description: Optional[str] = None


class CropInfo(BaseModel):
    """Model for crop information response"""
    crop_name: str
    stages: List[CropStage]
    total_duration: int  # total days from sowing to harvest
    description: Optional[str] = None
    common_varieties: Optional[List[str]] = None


def load_crop_database() -> Dict:
    """Load crop database from JSON file"""
    if not CROP_DB_PATH.exists():
        # Return default database with common crops
        return get_default_crop_database()
    
    try:
        with open(CROP_DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading crop database: {e}")
        return get_default_crop_database()


def get_default_crop_database() -> Dict:
    """Default crop database with common Indian crops"""
    return {
        "wheat": {
            "description": "Wheat is a staple food crop grown in India",
            "common_varieties": ["HD-2967", "HD-3086", "PBW-725", "WH-1105"],
            "stages": [
                {
                    "name": "Sowing",
                    "duration": 7,
                    "actions": ["Prepare seed bed", "Basal fertilizer application"],
                    "fertilizers": ["DAP 50kg/acre", "Urea 25kg/acre"],
                    "irrigation": "Light irrigation after sowing",
                    "pest": ["Seed treatment with fungicide"],
                    "description": "Sow seeds at proper depth and spacing"
                },
                {
                    "name": "Germination",
                    "duration": 10,
                    "actions": ["Monitor germination rate", "Check soil moisture"],
                    "fertilizers": [],
                    "irrigation": "Light irrigation if needed",
                    "pest": ["Watch for damping off disease"],
                    "description": "Seeds should germinate within 7-10 days"
                },
                {
                    "name": "Tillering",
                    "duration": 35,
                    "actions": ["Top dress urea", "Weed control", "Monitor growth"],
                    "fertilizers": ["Urea 50kg/acre"],
                    "irrigation": "Every 10-12 days",
                    "pest": ["Monitor aphids", "Watch for rust"],
                    "description": "Critical stage for tiller development"
                },
                {
                    "name": "Jointing",
                    "duration": 25,
                    "actions": ["Second top dressing", "Monitor stem elongation"],
                    "fertilizers": ["Urea 25kg/acre"],
                    "irrigation": "Increase irrigation frequency",
                    "pest": ["Watch for rust", "Monitor aphids"],
                    "description": "Stem elongation begins"
                },
                {
                    "name": "Flowering",
                    "duration": 15,
                    "actions": ["Reduce irrigation", "Monitor grain development"],
                    "fertilizers": [],
                    "irrigation": "Reduce to prevent lodging",
                    "pest": ["Watch for head blast", "Monitor storage pests"],
                    "description": "Flowering and grain filling stage"
                },
                {
                    "name": "Harvesting",
                    "duration": 10,
                    "actions": ["Harvest at 20-25% moisture", "Proper storage"],
                    "fertilizers": [],
                    "irrigation": "Stop irrigation",
                    "pest": ["Storage pest management"],
                    "description": "Harvest when grains are mature"
                }
            ]
        },
        "rice": {
            "description": "Rice is the primary food crop in India",
            "common_varieties": ["IR-64", "MTU-1010", "BPT-5204", "Swarna"],
            "stages": [
                {
                    "name": "Nursery",
                    "duration": 25,
                    "actions": ["Prepare nursery bed", "Sow pre-germinated seeds"],
                    "fertilizers": ["Compost 5kg/sqm"],
                    "irrigation": "Keep nursery bed moist",
                    "pest": ["Watch for blast disease"],
                    "description": "Nursery preparation and seedling growth"
                },
                {
                    "name": "Transplanting",
                    "duration": 5,
                    "actions": ["Transplant 20-25 day old seedlings", "Proper spacing"],
                    "fertilizers": ["Basal DAP 50kg/acre", "Urea 25kg/acre"],
                    "irrigation": "Maintain 2-3cm standing water",
                    "pest": ["Watch for stem borer"],
                    "description": "Transplant seedlings to main field"
                },
                {
                    "name": "Tillering",
                    "duration": 40,
                    "actions": ["Top dress urea", "Weed control", "Monitor tillers"],
                    "fertilizers": ["Urea 50kg/acre"],
                    "irrigation": "Maintain 5-7cm standing water",
                    "pest": ["Watch for leaf folder", "Monitor stem borer"],
                    "description": "Active tillering phase"
                },
                {
                    "name": "Panicle Initiation",
                    "duration": 25,
                    "actions": ["Second top dressing", "Monitor panicle development"],
                    "fertilizers": ["Urea 25kg/acre"],
                    "irrigation": "Maintain 5-7cm water level",
                    "pest": ["Watch for BPH (Brown Plant Hopper)", "Monitor diseases"],
                    "description": "Panicle formation begins"
                },
                {
                    "name": "Flowering & Grain Filling",
                    "duration": 35,
                    "actions": ["Control irrigation", "Monitor grain filling"],
                    "fertilizers": [],
                    "irrigation": "Gradually reduce water level",
                    "pest": ["Watch for grain borer", "Monitor storage pests"],
                    "description": "Flowering and grain development"
                },
                {
                    "name": "Harvesting",
                    "duration": 15,
                    "actions": ["Harvest at 80% maturity", "Proper drying and storage"],
                    "fertilizers": [],
                    "irrigation": "Stop irrigation 7-10 days before harvest",
                    "pest": ["Storage pest management"],
                    "description": "Harvest mature grains"
                }
            ]
        },
        "maize": {
            "description": "Maize is an important cereal crop",
            "common_varieties": ["Hybrid-1234", "NK-6240", "Pioneer-3396"],
            "stages": [
                {
                    "name": "Sowing",
                    "duration": 5,
                    "actions": ["Prepare field", "Sow seeds at proper spacing"],
                    "fertilizers": ["Basal NPK 120:60:40 kg/ha"],
                    "irrigation": "Light irrigation after sowing",
                    "pest": ["Seed treatment"],
                    "description": "Sow seeds at 2-3cm depth"
                },
                {
                    "name": "Germination & Early Growth",
                    "duration": 15,
                    "actions": ["Monitor germination", "Thinning if needed"],
                    "fertilizers": [],
                    "irrigation": "Light irrigation",
                    "pest": ["Watch for shoot fly"],
                    "description": "Seedling establishment"
                },
                {
                    "name": "Vegetative Growth",
                    "duration": 45,
                    "actions": ["Top dressing", "Weed control", "Earthing up"],
                    "fertilizers": ["Urea 60kg/ha"],
                    "irrigation": "Every 10-12 days",
                    "pest": ["Monitor stem borer", "Watch for fall armyworm"],
                    "description": "Rapid vegetative growth"
                },
                {
                    "name": "Tasseling & Silking",
                    "duration": 20,
                    "actions": ["Critical irrigation", "Monitor pollination"],
                    "fertilizers": ["Urea 30kg/ha"],
                    "irrigation": "Adequate moisture essential",
                    "pest": ["Watch for ear worm", "Monitor diseases"],
                    "description": "Flowering and pollination"
                },
                {
                    "name": "Grain Filling",
                    "duration": 30,
                    "actions": ["Monitor grain development", "Control irrigation"],
                    "fertilizers": [],
                    "irrigation": "Reduce gradually",
                    "pest": ["Monitor storage pests"],
                    "description": "Grain filling and maturation"
                },
                {
                    "name": "Harvesting",
                    "duration": 10,
                    "actions": ["Harvest at proper moisture", "Drying and storage"],
                    "fertilizers": [],
                    "irrigation": "Stop irrigation",
                    "pest": ["Storage pest management"],
                    "description": "Harvest mature cobs"
                }
            ]
        },
        "cotton": {
            "description": "Cotton is a major cash crop",
            "common_varieties": ["Bt Cotton", "Non-Bt varieties"],
            "stages": [
                {
                    "name": "Sowing",
                    "duration": 7,
                    "actions": ["Prepare field", "Sow seeds"],
                    "fertilizers": ["Basal NPK 80:40:40 kg/ha"],
                    "irrigation": "Light irrigation",
                    "pest": ["Seed treatment"],
                    "description": "Sow at proper spacing"
                },
                {
                    "name": "Germination & Seedling",
                    "duration": 20,
                    "actions": ["Monitor germination", "Gap filling"],
                    "fertilizers": [],
                    "irrigation": "Light irrigation",
                    "pest": ["Watch for thrips", "Monitor diseases"],
                    "description": "Seedling establishment"
                },
                {
                    "name": "Square Formation",
                    "duration": 40,
                    "actions": ["Top dressing", "Weed control"],
                    "fertilizers": ["Urea 50kg/ha"],
                    "irrigation": "Every 10-12 days",
                    "pest": ["Monitor bollworm", "Watch for sucking pests"],
                    "description": "Square and flower bud formation"
                },
                {
                    "name": "Flowering & Boll Development",
                    "duration": 50,
                    "actions": ["Critical irrigation", "Monitor boll development"],
                    "fertilizers": ["Urea 30kg/ha"],
                    "irrigation": "Adequate moisture",
                    "pest": ["Monitor bollworm", "Watch for whitefly"],
                    "description": "Flowering and boll formation"
                },
                {
                    "name": "Boll Opening",
                    "duration": 30,
                    "actions": ["Monitor boll opening", "Prepare for picking"],
                    "fertilizers": [],
                    "irrigation": "Reduce gradually",
                    "pest": ["Monitor storage pests"],
                    "description": "Bolls open and ready for picking"
                },
                {
                    "name": "Harvesting",
                    "duration": 20,
                    "actions": ["Pick open bolls", "Multiple pickings"],
                    "fertilizers": [],
                    "irrigation": "Stop irrigation",
                    "pest": ["Storage pest management"],
                    "description": "Harvest mature cotton"
                }
            ]
        },
        "sugarcane": {
            "description": "Sugarcane is a major cash crop",
            "common_varieties": ["Co-86032", "Co-0238", "Co-8371"],
            "stages": [
                {
                    "name": "Planting",
                    "duration": 10,
                    "actions": ["Prepare field", "Plant setts"],
                    "fertilizers": ["Basal NPK 150:60:60 kg/ha"],
                    "irrigation": "Light irrigation",
                    "pest": ["Seed treatment"],
                    "description": "Plant setts at proper spacing"
                },
                {
                    "name": "Germination & Tillering",
                    "duration": 60,
                    "actions": ["Gap filling", "Weed control"],
                    "fertilizers": ["Urea 100kg/ha"],
                    "irrigation": "Every 10-12 days",
                    "pest": ["Monitor early shoot borer"],
                    "description": "Germination and tiller development"
                },
                {
                    "name": "Grand Growth",
                    "duration": 120,
                    "actions": ["Top dressing", "Earthing up", "Trash mulching"],
                    "fertilizers": ["Urea 150kg/ha"],
                    "irrigation": "Every 10-15 days",
                    "pest": ["Monitor internode borer", "Watch for red rot"],
                    "description": "Rapid cane growth"
                },
                {
                    "name": "Maturation",
                    "duration": 60,
                    "actions": ["Withhold irrigation", "Monitor maturity"],
                    "fertilizers": [],
                    "irrigation": "Stop 30-40 days before harvest",
                    "pest": ["Monitor storage pests"],
                    "description": "Cane maturation"
                },
                {
                    "name": "Harvesting",
                    "duration": 30,
                    "actions": ["Harvest mature canes", "Proper handling"],
                    "fertilizers": [],
                    "irrigation": "No irrigation",
                    "pest": ["Storage pest management"],
                    "description": "Harvest mature sugarcane"
                }
            ]
        }
    }


@router.get("/{crop_name}", response_model=CropInfo)
async def get_crop_info(crop_name: str):
    """
    Get crop information including growth stages and calendar for any crop.
    
    Args:
        crop_name: Name of the crop (case-insensitive, e.g., "wheat", "rice", "maize")
    
    Returns:
        CropInfo with stages, duration, and recommendations
    """
    try:
        # Load crop database
        crop_db = load_crop_database()
        
        # Normalize crop name (lowercase, remove spaces)
        crop_key = crop_name.lower().strip().replace(" ", "_")
        
        # Try exact match first
        crop_data = crop_db.get(crop_key)
        
        # Try partial match if exact match fails
        if not crop_data:
            for key in crop_db.keys():
                if crop_key in key or key in crop_key:
                    crop_data = crop_db[key]
                    crop_key = key
                    break
        
        if not crop_data:
            # Return generic crop info for unknown crops
            return CropInfo(
                crop_name=crop_name,
                description=f"Generic information for {crop_name}",
                stages=[
                    CropStage(
                        name="Sowing",
                        duration=7,
                        actions=["Prepare field", "Sow seeds"],
                        fertilizers=["Apply basal fertilizer"],
                        irrigation="Initial irrigation",
                        pest=["Seed treatment"],
                        description="Initial sowing stage"
                    ),
                    CropStage(
                        name="Vegetative Growth",
                        duration=60,
                        actions=["Monitor growth", "Weed control"],
                        fertilizers=["Top dressing as needed"],
                        irrigation="Regular irrigation",
                        pest=["Monitor pests and diseases"],
                        description="Active growth phase"
                    ),
                    CropStage(
                        name="Flowering",
                        duration=30,
                        actions=["Monitor flowering", "Critical irrigation"],
                        fertilizers=["Apply if needed"],
                        irrigation="Adequate moisture essential",
                        pest=["Monitor pests"],
                        description="Flowering stage"
                    ),
                    CropStage(
                        name="Maturation & Harvesting",
                        duration=20,
                        actions=["Monitor maturity", "Prepare for harvest"],
                        fertilizers=[],
                        irrigation="Reduce irrigation",
                        pest=["Storage pest management"],
                        description="Maturation and harvest"
                    )
                ],
                total_duration=117,
                common_varieties=None
            )
        
        # Calculate total duration
        total_duration = sum(stage.get("duration", 0) for stage in crop_data.get("stages", []))
        
        # Convert to CropInfo model
        stages = [
            CropStage(**stage) for stage in crop_data.get("stages", [])
        ]
        
        return CropInfo(
            crop_name=crop_name.title(),
            description=crop_data.get("description"),
            stages=stages,
            total_duration=total_duration,
            common_varieties=crop_data.get("common_varieties")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching crop information: {str(e)}"
        )


@router.get("/")
async def list_available_crops():
    """
    Get list of all crops available in the database.
    
    Returns:
        List of crop names with descriptions
    """
    try:
        crop_db = load_crop_database()
        crops = []
        for crop_key, crop_data in crop_db.items():
            crops.append({
                "name": crop_key.title(),
                "key": crop_key,
                "description": crop_data.get("description", ""),
                "total_stages": len(crop_data.get("stages", []))
            })
        return {"crops": crops, "count": len(crops)}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing crops: {str(e)}"
        )

