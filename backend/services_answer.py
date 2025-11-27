import os, json, httpx

OLLAMA_API = os.getenv("OLLAMA_API", "http://localhost:11434/api/generate")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "gemma3:4b")

async def get_farming_answer(question_en: str) -> str:
    prompt = (
        "You are a farming assistant. Keep answers under 50 words.\n"
        f"Question: {question_en}"
    )

    answer_en = ""
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(OLLAMA_API, json={"model": MODEL_NAME, "prompt": prompt, "stream": False})
            if r.status_code == 200:
                try:
                    data = r.json()
                    answer_en = data.get("response", "")
                except Exception:
                    answer_en = ""
    except Exception:
        answer_en = ""

    if not answer_en.strip():
        # fallback to streaming parse
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream("POST", OLLAMA_API, json={"model": MODEL_NAME, "prompt": prompt}) as resp:
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

    return answer_en.strip()



