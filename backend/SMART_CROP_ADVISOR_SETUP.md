# Smart Crop Advisor - Setup Guide

This guide will help you set up and use the Smart Crop Advisor feature.

## 📋 Overview

The Smart Crop Advisor uses machine learning to recommend the best crops based on:
- **Soil Nutrients**: Nitrogen (N), Phosphorus (P), Potassium (K)
- **Weather Conditions**: Temperature, Humidity, Rainfall
- **Soil pH**: Acidity/alkalinity level

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Make sure you have all required Python packages installed:

```bash
cd backend
pip install -r requirements.txt
```

The ML dependencies include:
- `pandas` - Data manipulation
- `scikit-learn` - Machine learning library
- `joblib` - Model serialization
- `numpy` - Numerical computing

### Step 2: Train the Model

Before using the API, you need to train the ML model:

```bash
cd backend
python train_crop_model.py
```

Or alternatively:

```bash
python -m ml.train_model
```

**What this does:**
1. Loads the dataset from `Crop_recommendation.csv`
2. Trains a RandomForestClassifier
3. Evaluates the model accuracy
4. Saves the trained model to `model/crop_recommender.pkl`
5. Saves the label encoder to `model/label_encoder.pkl`

**Expected Output:**
```
🌱 Starting Crop Recommendation Model Training...
📂 Loading dataset from: .../Crop_recommendation.csv
✅ Loaded 2200 samples
📊 Columns: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label']
...
📊 Model Performance:
   Accuracy: 0.99XX (99.XX%)
...
💾 Model saved to: model/crop_recommender.pkl
💾 Encoder saved to: model/label_encoder.pkl
✅ Training complete!
```

### Step 3: Start the Backend Server

```bash
cd backend
python main.py
```

Or using uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### Step 4: Test the API

You can test the endpoint using curl or any HTTP client:

```bash
curl -X POST "http://localhost:8000/crop/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.87,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
  }'
```

**Expected Response:**
```json
{
  "best_crop": "rice",
  "confidence": 95.23,
  "top_3": [
    {"crop": "rice", "score": 0.9523},
    {"crop": "maize", "score": 0.0321},
    {"crop": "chickpea", "score": 0.0156}
  ],
  "reasoning": "Based on your soil analysis...",
  "explanation_features": {
    "N": 90.0,
    "P": 42.0,
    "K": 43.0,
    "temperature": 20.87,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
  }
}
```

## 📱 Frontend Integration

The frontend is already integrated! The Smart Crop Advisor screen is available in the drawer menu.

### Using the App:

1. Open the app and navigate to **Smart Crop Advisor** from the drawer menu
2. Enter your soil and weather values:
   - **N, P, K**: Soil nutrient levels (0-200)
   - **Temperature**: In Celsius (-50 to 60)
   - **Humidity**: Percentage (0-100)
   - **pH**: Soil pH value (0-14)
   - **Rainfall**: In mm (0-1000)
3. Tap **Get Recommendation**
4. View the AI-powered crop suggestions with confidence scores

## 🔧 API Endpoints

### POST `/crop/recommend`

Get crop recommendation based on soil and weather parameters.

**Request Body:**
```json
{
  "N": 90.0,
  "P": 42.0,
  "K": 43.0,
  "temperature": 20.87,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

**Response:**
- `best_crop`: Recommended crop name
- `confidence`: Confidence percentage (0-100)
- `top_3`: Top 3 crop recommendations with scores
- `reasoning`: Human-readable explanation
- `explanation_features`: Input features for reference

### GET `/crop/available-crops`

Get list of all crops the model can recommend.

**Response:**
```json
{
  "crops": ["rice", "maize", "chickpea", ...],
  "count": 22
}
```

## 📁 Project Structure

```
backend/
├── ml/
│   ├── __init__.py
│   ├── train_model.py      # Model training script
│   └── predictor.py        # Prediction module
├── model/                  # Created after training
│   ├── crop_recommender.pkl
│   └── label_encoder.pkl
├── routers_crop.py         # FastAPI route
├── train_crop_model.py     # Convenience training script
├── Crop_recommendation.csv # Dataset
└── main.py                 # Main FastAPI app

farmer-voice-assistant/
├── services/
│   └── cropAdvisor.ts      # API service
└── app/(drawer)/
    └── smart-crop-advisor.tsx  # UI screen
```

## 🐛 Troubleshooting

### Model Not Found Error

If you see: `Model not found at model/crop_recommender.pkl`

**Solution:** Run the training script first:
```bash
python train_crop_model.py
```

### Import Errors

If you see: `ModuleNotFoundError: No module named 'ml'`

**Solution:** Make sure you're running from the `backend` directory, or add the backend directory to your Python path.

### Low Accuracy

If model accuracy is low (< 90%):

1. Check the dataset quality
2. Try adjusting hyperparameters in `ml/train_model.py`
3. Ensure the dataset has enough samples per crop class

## 📊 Model Details

- **Algorithm**: RandomForestClassifier
- **Features**: 7 (N, P, K, temperature, humidity, ph, rainfall)
- **Target**: Crop name (22+ different crops)
- **Expected Accuracy**: > 95% on test set

## 🔄 Retraining

To retrain the model with updated data:

1. Update `Crop_recommendation.csv` with new data
2. Run training script: `python train_crop_model.py`
3. Restart the backend server

The new model will be automatically loaded on server restart.

## 📝 Notes

- The model is loaded once at server startup for optimal performance
- Predictions are fast (< 100ms) due to pre-loaded model
- The model uses probability scores to rank crop recommendations
- All input values are validated before prediction

## ✅ Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Train the model: `python train_crop_model.py`
- [ ] Verify model files exist in `model/` directory
- [ ] Start backend server: `python main.py`
- [ ] Test API endpoint
- [ ] Open app and navigate to Smart Crop Advisor
- [ ] Test with sample values

---

**Need Help?** Check the code comments or review the implementation in:
- `backend/ml/train_model.py` - Training logic
- `backend/ml/predictor.py` - Prediction logic
- `backend/routers_crop.py` - API endpoint
- `farmer-voice-assistant/app/(drawer)/smart-crop-advisor.tsx` - UI

