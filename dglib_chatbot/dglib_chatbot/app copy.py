from fastapi import FastAPI
from dglib_chatbot.utils.config import logger, web_config
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dglib_chatbot.services.chatbot_response import save_chat_log, save_chat_feedback_log, chatbot_history_delete
import uuid
from dglib_chatbot.services.session_manager import start_scheduler
from contextlib import asynccontextmanager
from dglib_chatbot.services.nlp import analyze_text
from dglib_chatbot.utils.client import set_client
import httpx
from typing import Optional
from speech_recognition.tcp_service import start_tcp_server
import asyncio
from dglib_chatbot.services.chatbot_preprocessing import chatbot_preprocessing, ChatRequest


class resetRequest(BaseModel):
    clientId: str

class feedback_request(BaseModel):
    role: str
    parts: str
    userQuery: Optional[str] = None
    feedbackType: str
    nlp: Optional[dict] = None

    

tcp_server_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = httpx.AsyncClient(timeout=30.0,
                               headers={
            "Content-Type": "application/json",
            "X-API-Key": web_config.SECRET_KEY, 
        }
                               )
    set_client(client)
    logger.info("챗봇 서버 시작")
    global tcp_server_task
    loop = asyncio.get_running_loop()
    tcp_server_task = loop.create_task(start_tcp_server())
    start_scheduler()
    yield
    await client.aclose()
    if tcp_server_task:
        tcp_server_task.cancel()
        try:
            await tcp_server_task
        except asyncio.CancelledError:
            logger.info("TCP 서버 작업이 취소되었습니다.")
    logger.info("챗봇 서버 종료")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[web_config.API_GATE_URL],  
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.post("/chatbot")
async def chatbot(request: ChatRequest):
    
    response = await chatbot_preprocessing(request)


    return response


@app.post("/reset")
async def reset_chat(request: resetRequest):
    response = await chatbot_history_delete(request.clientId)
    return response

@app.post("/feedback")
async def feedbacok(request: feedback_request):
    logger.info(f"피드백 요청: {request}")
    await save_chat_feedback_log(
        request.userQuery, request.parts, request.nlp, request.feedbackType
    )




def main():
    import uvicorn
    uvicorn.run("dglib_chatbot.app:app", host="0.0.0.0", port=1992, reload=False)

if __name__ == "__main__":
    main()

