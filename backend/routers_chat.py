from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from .db_client import get_db
from .utils_jwt import require_user
from .services_answer import get_farming_answer
import time

router = APIRouter(prefix="/chats", tags=["chats"])

class CreateChat(BaseModel):
    firstMessage: str | None = None

class SendMessage(BaseModel):
    text: str

def oid(id_str: str):
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")

@router.post("")
async def create_chat(body: CreateChat, claims = Depends(require_user)):
    db = get_db()
    chat = {"userId": claims["userId"], "messages": [], "createdAt": int(time.time()), "updatedAt": int(time.time())}
    if body.firstMessage:
        chat["messages"].append({"role": "user", "text": body.firstMessage, "ts": int(time.time())})
    res = await db.chats.insert_one(chat)
    chat_id = str(res.inserted_id)
    return {"id": chat_id}

@router.get("")
async def list_chats(claims = Depends(require_user)):
    db = get_db()
    cur = db.chats.find({"userId": claims["userId"]}).sort("updatedAt", -1)
    items = []
    async for c in cur:
        items.append({"id": str(c["_id"]), "lastMessageAt": c.get("updatedAt"), "count": len(c.get("messages", []))})
    return items

@router.get("/{chatId}")
async def get_chat(chatId: str, claims = Depends(require_user)):
    db = get_db()
    c = await db.chats.find_one({"_id": oid(chatId), "userId": claims["userId"]})
    if not c:
        raise HTTPException(status_code=404, detail="Chat not found")
    c["id"] = str(c.pop("_id"))
    return c

@router.post("/{chatId}/message")
async def send_message(chatId: str, body: SendMessage, claims = Depends(require_user)):
    db = get_db()
    c = await db.chats.find_one({"_id": oid(chatId), "userId": claims["userId"]})
    if not c:
        raise HTTPException(status_code=404, detail="Chat not found")
    # persist user message
    user_msg = {"role": "user", "text": body.text, "ts": int(time.time())}
    await db.chats.update_one({"_id": c["_id"]}, {"$push": {"messages": user_msg}, "$set": {"updatedAt": int(time.time())}})

    # call LLM and persist assistant message
    answer_en = await get_farming_answer(body.text)
    assistant_msg = {"role": "assistant", "text": answer_en or "", "ts": int(time.time())}
    await db.chats.update_one({"_id": c["_id"]}, {"$push": {"messages": assistant_msg}, "$set": {"updatedAt": int(time.time())}})
    return {"reply": assistant_msg["text"]}



