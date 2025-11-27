from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
import tempfile, os, json, httpx
from pydantic import BaseModel
import whisper
from googletrans import Translator  # pip install googletrans==4.0.0-rc1
from routers_auth import router as auth_router
from routers_crop import router as crop_router
from db_client import init_database, test_connection

app = FastAPI(
    title="Farmer Assistant Backend",
    description="API for Farmer Voice Assistant with ML-powered crop recommendations",
    version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

translator = Translator()
model = whisper.load_model("small")

# Include routers
app.include_router(auth_router)
app.include_router(crop_router)

@app.on_event("startup")
async def startup_event():
    """
    Initialize database on startup
    """
    print("🚀 Starting Farmer Assistant Backend...")
    
    # Test database connection
    if await test_connection():
        # Initialize database collections and indexes
        await init_database()
    else:
        print("⚠️  Database connection failed, but server will continue...")
    
    print("✅ Backend server ready!")

@app.post("/stt")
async def stt(audio: UploadFile = File(...), lang: str = Form("auto")):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    result = model.transcribe(tmp_path, language=None if lang == "auto" else lang)
    os.remove(tmp_path)

    return {"text": result["text"], "lang": lang}

OLLAMA_API = os.getenv("OLLAMA_API", "http://192.168.31.131:11434/api/generate")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "gemma3:4b")

class QuestionRequest(BaseModel):
    question: str

@app.post("/answer")
async def answer(req: QuestionRequest):
    user_question = req.question
    print(user_question)

    # 1️⃣ Auto-detect user language
    try:
        detected = translator.detect(user_question)
        user_lang = detected.lang
    except Exception:
        user_lang = "en"

    # 2️⃣ Translate input to English if needed
    if user_lang != "en":
        try:
            translated_input = translator.translate(user_question, src=user_lang, dest="en").text
        except Exception:
            translated_input = user_question
    else:
        translated_input = user_question

    # 3️⃣ Send English prompt to Ollama
    answer_en = ""
    prompt= (
        "You are a farming assistant. Keep answers under 50 words. "
        "Answer only farming-related questions.\n"
        f"Question: {translated_input}"
    )
    # Prefer non-streaming call with stream:false to ensure a full body response
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(
                OLLAMA_API,
                json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            )
            if r.status_code == 200:
                try:
                    data = r.json()
                    answer_en = data.get("response", "")
                except Exception:
                    answer_en = ""
            else:
                answer_en = ""
    except Exception:
        answer_en = ""

    # Fallback to streaming parsing if non-streaming yielded nothing
    if not answer_en.strip():
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream(
                    "POST",
                    OLLAMA_API,
                    json={"model": MODEL_NAME, "prompt": prompt},
                ) as resp:
                    async for line in resp.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            if "response" in data:
                                answer_en += data["response"]
                        except json.JSONDecodeError:
                            continue
        except Exception:
            pass

    # 4️⃣ Translate back to user language if needed
    if user_lang != "en":
        try:
            final_answer = translator.translate(answer_en, src="en", dest=user_lang).text
        except Exception:
            final_answer = answer_en
    else:
        final_answer = answer_en
    if not final_answer.strip():
        final_answer = "I DONT KNOW ABOUT THAT, I AM ONLY TRAINED TO ANSWER FARMING RELATED QUERIES"
    print(final_answer)
    return {"answer": final_answer, "lang": user_lang}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
