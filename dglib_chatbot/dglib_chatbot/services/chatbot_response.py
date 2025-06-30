import pathlib
import time
import textwrap
import json
import os
from datetime import datetime
import google.generativeai as genai

from dglib_chatbot.utils.config import GOOGLE_API_KEY, initial_history
from dglib_chatbot.services.session_manager import chat_sessions, update_session_activity
from dglib_chatbot.utils.config import logger
from dglib_chatbot.services.response_prompt import response_prompt
import aiofiles





genai.configure(api_key=GOOGLE_API_KEY)


async def chatbot_ai(clientId: str, parts: str, nlp: dict, mid: str) -> dict:

    generate = await response_prompt(parts, nlp, mid)

    if clientId not in chat_sessions:
        model = genai.GenerativeModel('gemma-3n-e4b-it')
        chat_sessions[clientId] = {
            "model": model,
            "chat": model.start_chat(history=initial_history), # type: ignore
            "last_activity": time.time()
        }
    else:
        update_session_activity(clientId)

    session = chat_sessions[clientId]
    response = await session["chat"].send_message_async(generate.get("text"))

    await save_chat_log(parts, response.text, nlp)

    cleaned_entities = [
        {"type": ent.get("type", ""), "text": ent.get("text", "")}
        for ent in nlp.get("entities", [])
    ]


    return {"parts": response.text, "service": generate.get("service"), "to": generate.get("to"), "intent": nlp.get('intent', ''),
        "intent_confidence": nlp.get('intent_confidence', 0.0),
        "entities": cleaned_entities,}





async def chatbot_history_delete(client_id: str):

    if client_id in chat_sessions:
        model = chat_sessions[client_id]["model"]
        chat_sessions[client_id]["chat"] = model.start_chat(history=initial_history)
        return {"status": "success", "message": "채팅 히스토리가 초기화되었습니다."}
    return {"status": "error", "message": "클라이언트 ID를 찾을 수 없습니다."}


async def save_chat_log(user_message: str, bot_response: str, nlp: dict):
    today = datetime.now().strftime("%Y-%m-%d")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_dir = pathlib.Path("chat_logs")
    os.makedirs(log_dir, exist_ok=True)

    log_file = log_dir / f"chat_log_{today}.jsonl"

    cleaned_entities = [
        {"type": ent.get("type", ""), "text": ent.get("text", "")}
        for ent in nlp.get("entities", [])
    ]

    log_entry = {
        "time": timestamp,
        "user": user_message,
        "model": bot_response,
        "intent": nlp.get('intent', ''),
        "intent_confidence": nlp.get('intent_confidence', 0.0),
        "entities": cleaned_entities,
    }

    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')


async def save_chat_feedback_log(user_message: str, bot_response: str, nlp: dict, type: str):
    today = datetime.now().strftime("%Y-%m-%d")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if type == "like":
        log_dir = pathlib.Path("chat_feedback_logs/like")
    else:
        log_dir = pathlib.Path("chat_feedback_logs/dislike")
    os.makedirs(log_dir, exist_ok=True)

    log_file = log_dir / f"chat_log_{today}.jsonl"

    cleaned_entities = [
        {"type": ent.get("type", ""), "text": ent.get("text", "")}
        for ent in nlp.get("entities", [])
    ]

    log_entry = {
        "time": timestamp,
        "user": user_message,
        "model": bot_response,
        "intent": nlp.get('intent', ''),
        "intent_confidence": nlp.get('intent_confidence', 0.0),
        "entities": cleaned_entities,
    }

    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')