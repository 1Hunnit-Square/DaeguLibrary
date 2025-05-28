import pathlib
import time
import textwrap
import google.generativeai as genai
from IPython.display import display
from IPython.display import Markdown
from dglib_chatbot.config import GOOGLE_API_KEY, initial_history
from dglib_chatbot.session_manager import chat_sessions, update_session_activity


genai.configure(api_key=GOOGLE_API_KEY)


async def chatbot_ai(clientId: str, parts: str) -> dict:

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
    response = session["chat"].send_message(parts)


    return {"parts": response.text}



async def chatbot_history_delete(client_id: str):

    if client_id in chat_sessions:
        model = chat_sessions[client_id]["model"]
        chat_sessions[client_id]["chat"] = model.start_chat(history=initial_history)
        return {"status": "success", "message": "채팅 히스토리가 초기화되었습니다."}
    return {"status": "error", "message": "클라이언트 ID를 찾을 수 없습니다."}