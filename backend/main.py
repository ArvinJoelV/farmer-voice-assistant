from fastapi import FastAPI, UploadFile, File, Form
import tempfile, os
from pydantic import BaseModel
from transformers import pipeline
app = FastAPI(title="Farmer Assistant Backend")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your dev IP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/stt")
async def stt(audio: UploadFile = File(...), lang: str = Form("auto")):
    # Save uploaded audio temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    
    import whisper
    model = whisper.load_model("small")  # tiny, base, small, medium, large
    result = model.transcribe(tmp_path, language=None if lang == "auto" else lang)
    print(result["text"])
    os.remove(tmp_path)
    return {"text": result["text"], "lang": lang}

qa_model = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

class QuestionRequest(BaseModel):
    question: str
    lang: str = "en"  

@app.post("/answer")
async def answer(req: QuestionRequest):
    question = req.question
    context = """
Farming is the practice of cultivating crops and raising animals for food, fiber, medicinal plants, and other products. 
There are several types of farming: crop farming, livestock farming, mixed farming, subsistence farming, and organic farming. 

Crops:
- Major crops include wheat, rice, maize (corn), barley, millet, sorghum, soybeans, potatoes, sugarcane, and vegetables.
- Crop rotation improves soil fertility and reduces pests and diseases.
- Organic farming avoids synthetic fertilizers and pesticides.
- Fertilizers: Nitrogen (N), Phosphorus (P), and Potassium (K) are primary nutrients. Secondary nutrients include Calcium, Magnesium, and Sulfur.

Soil and Irrigation:
- Soil types: clay, loamy, sandy, and silt.
- Soil health depends on pH, nutrients, and organic matter.
- Irrigation methods: drip, sprinkler, furrow, flood, and rain-fed.
- Mulching conserves soil moisture and reduces weed growth.

Pests and Diseases:
- Common pests: locusts, aphids, caterpillars, bollworms, and whiteflies.
- Common diseases: blight, mildew, rust, leaf spot, and wilt.
- Integrated Pest Management (IPM) combines biological, cultural, and chemical methods.

Farming Practices:
- Sowing: seeds are planted at the right depth and spacing for optimal growth.
- Harvesting: timing depends on crop maturity to maximize yield.
- Post-harvest: includes cleaning, drying, storage, and processing to reduce losses.

Livestock:
- Types: cattle, poultry, sheep, goats, pigs, and bees.
- Livestock requires proper nutrition, housing, and vaccination.
- Products: milk, meat, eggs, honey, leather, and wool.

Weather and Climate:
- Weather affects planting, growth, and harvest.
- Drought, floods, frost, and excessive rain can damage crops.
- Climate-smart agriculture includes water conservation, crop diversification, and resilient crop varieties.

Tools and Machinery:
- Plowing, sowing, irrigation, harvesting, and threshing machinery improve efficiency.
- Tractor, harvester, seed drill, and irrigation pumps are commonly used.

Sustainable Practices:
- Crop rotation, organic farming, reduced tillage, and cover cropping maintain long-term productivity.
- Agroforestry integrates trees and shrubs into farmland for biodiversity and soil protection.

Government Schemes (India example):
- PM-Kisan: direct income support to farmers.
- Soil Health Card Scheme: provides soil testing and recommendations.
- Pradhan Mantri Krishi Sinchai Yojana (PMKSY): irrigation infrastructure support.
- National Mission on Sustainable Agriculture (NMSA): promotes climate-resilient agriculture.

Market and Economics:
- Farmers sell produce in mandis (markets) or through direct-to-consumer models.
- Minimum Support Price (MSP) guarantees a price for certain crops.
- Crop insurance helps mitigate losses due to natural calamities.

General Tips:
- Monitor crops regularly for pests and nutrient deficiencies.
- Maintain farm hygiene and proper storage to prevent post-harvest losses.
- Use certified seeds for better yield and disease resistance.
- Maintain records of sowing, fertilizer, pesticide, and harvest dates.
"""

    
    result = qa_model(question=question, context=context)
    return {"answer": result['answer']}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )