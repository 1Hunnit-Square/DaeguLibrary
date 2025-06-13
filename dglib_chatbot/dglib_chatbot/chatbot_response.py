import pathlib
import time
import textwrap
import json
import os
from datetime import datetime
import google.generativeai as genai
from IPython.display import display
from IPython.display import Markdown
from dglib_chatbot.config import GOOGLE_API_KEY, initial_history
from dglib_chatbot.session_manager import chat_sessions, update_session_activity
from dglib_chatbot.config import logger
from dglib_chatbot.response_prompt import response_prompt





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
    response = session["chat"].send_message(generate.get("text"))

    save_chat_log(parts, response.text, nlp)


    return {"parts": response.text, "service": generate.get("service"), "to": generate.get("to")}





async def chatbot_history_delete(client_id: str):

    if client_id in chat_sessions:
        model = chat_sessions[client_id]["model"]
        chat_sessions[client_id]["chat"] = model.start_chat(history=initial_history)
        return {"status": "success", "message": "채팅 히스토리가 초기화되었습니다."}
    return {"status": "error", "message": "클라이언트 ID를 찾을 수 없습니다."}


def save_chat_log(user_message: str, bot_response: str, nlp: dict):
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