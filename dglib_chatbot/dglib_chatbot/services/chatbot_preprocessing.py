from dglib_chatbot.utils.config import logger
from pydantic import BaseModel
from dglib_chatbot.services.chatbot_response import chatbot_ai
import uuid
from dglib_chatbot.services.nlp import analyze_text
from typing import Optional




class ChatRequest(BaseModel):
    parts: str
    clientId: str = ""
    mid: Optional[str] = ""


async def chatbot_preprocessing(request: ChatRequest):
    
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