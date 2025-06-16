from fastapi import FastAPI
from dglib_chatbot.utils.config import logger, web_config
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dglib_chatbot.services.chatbot_response import chatbot_ai, chatbot_history_delete
import uuid
from dglib_chatbot.services.session_manager import start_scheduler
from contextlib import asynccontextmanager
from dglib_chatbot.services.nlp import analyze_text
from dglib_chatbot.utils.client import set_client
import httpx
from typing import Optional
from speech_recognition.voice_detect import start_tcp_server
import asyncio




class ChatRequest(BaseModel):
    parts: str
    clientId: str = ""
    mid: Optional[str] = ""
class resetRequest(BaseModel):
    clientId: str

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
    
    clientId = request.clientId
    logger.info(f"클라이언트 요청: {request}")
    is_new_client = not clientId
    if is_new_client:
        clientId = str(uuid.uuid4())
    nlp = analyze_text(request.parts)
    logger.info(f"NLP 분석 결과: {nlp}")
   
    response = await chatbot_ai(clientId, request.parts, nlp, request.mid)
    logger.info(f"챗봇 응답: {response}")

    response["clientId"] = clientId


    return response

def main():
    import uvicorn
    uvicorn.run("dglib_chatbot.app:app", host="0.0.0.0", port=1992, reload=True)

if __name__ == "__main__":
    main()

@app.post("/reset")
async def reset_chat(request: resetRequest):
    response = await chatbot_history_delete(request.clientId)
    return response