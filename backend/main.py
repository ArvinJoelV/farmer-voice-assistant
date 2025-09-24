from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
import tempfile, os, json, httpx
from pydantic import BaseModel
import whisper
from googletrans import Translator  # pip install googletrans==4.0.0-rc1

app = FastAPI(title="Farmer Assistant Backend")

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

@app.post("/stt")
async def stt(audio: UploadFile = File(...), lang: str = Form("auto")):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    result = model.transcribe(tmp_path, language=None if lang == "auto" else lang)
    os.remove(tmp_path)

    return {"text": result["text"], "lang": lang}

OLLAMA_API = "http://10.114.75.244:11434/api/generate"
MODEL_NAME = "llama2"

class QuestionRequest(BaseModel):
    question: str

@app.post("/answer")
async def answer(req: QuestionRequest):
    user_question = req.question

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
    prompt= f"Answer the following question in 30 words and concise,and only answer if the question is related to farming ,else say I DONT KNOW ABOUT THAT, I AM ONLY TRAINED TO ANSWER FARMING RELATED QUERIES: {translated_input}"
    try:
        async with httpx.AsyncClient(timeout=60) as client:
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

    except Exception as e:
        return {"answer": f"❌ Error calling Ollama: {e}"}

    # 4️⃣ Translate back to user language if needed
    if user_lang != "en":
        try:
            final_answer = translator.translate(answer_en, src="en", dest=user_lang).text
        except Exception:
            final_answer = answer_en
    else:
        final_answer = answer_en

    return {"answer": final_answer,"lang": user_lang}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
