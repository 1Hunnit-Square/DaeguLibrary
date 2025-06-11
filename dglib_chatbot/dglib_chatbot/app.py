from fastapi import FastAPI
from dglib_chatbot.config import logger
from pydantic import BaseModel
from dglib_chatbot.chatbot_response import chatbot_ai, chatbot_history_delete
import uuid
from dglib_chatbot.session_manager import start_scheduler
from contextlib import asynccontextmanager
from dglib_chatbot.nlp import analyze_text



class ChatRequest(BaseModel):
    parts: str
    clientId: str = ""
class resetRequest(BaseModel):
    clientId: str

app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("챗봇 서버 시작")
    start_scheduler()
    yield
    logger.info("챗봇 서버 종료")


@app.post("/chatbot")
async def chatbot(request: ChatRequest):
    
    clientId = request.clientId
    logger.info(f"클라이언트 요청: {request}")
    is_new_client = not clientId
    if is_new_client:
        clientId = str(uuid.uuid4())
    nlp = analyze_text(request.parts)
   
    response = await chatbot_ai(clientId, request.parts, nlp)
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