from fastapi import FastAPI
import logging
from pydantic import BaseModel
from dglib_chatbot.chatbotResponse import chatbot_ai
import uuid

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    parts: str
    clientId: str = ""

app = FastAPI()

@app.post("/chatbot")
async def chatbot(request: ChatRequest):
    clientId = request.clientId.strip() if request.clientId else ""
    logger.info(f"클라이언트 요청: {request}")
    is_new_client = not clientId
    if is_new_client:
        clientId = str(uuid.uuid4())
    response = await chatbot_ai(clientId, request.parts)
    logger.info(f"챗봇 응답: {response}")



    response["clientId"] = clientId

    return response

def main():
    import uvicorn
    uvicorn.run("dglib_chatbot.app:app", host="0.0.0.0", port=1992, reload=True)

if __name__ == "__main__":
    main()