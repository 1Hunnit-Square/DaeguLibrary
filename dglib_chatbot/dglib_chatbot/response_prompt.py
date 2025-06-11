from dglib_chatbot.config import logger, web_config
import httpx

client = httpx.AsyncClient(timeout=30.0)

async def response_prompt(parts: str, nlp: dict) -> str:

    

    intent = nlp.get('intent')
    entities = nlp.get('entities', [])
    book_title = [e['text'] for e in nlp.get('entities') if e['type'] == 'BOOK']
    author = [e['text'] for e in nlp.get('entities') if e['type'] == 'AUTHOR']
    intent_confidence = nlp.get('intent_confidence')

    logger.info(f"Intent: {intent}, Intent Confidence: {intent_confidence} Book Title: {book_title}, Author: {author}")

    if intent == "도서검색":
        generate_prompt = await generate_book_title_response(book_title)
    elif intent == "작가검색":
        generate_prompt = await generate_author_response(author)
    elif intent == "대출베스트":
        logger.info("대출베스트 요청에 대한 응답을 생성합니다.")
    elif intent == "봇소개":
        generate_prompt = """너는 대구도서관 ai 챗봇 꿈틀이야. 너는 도서검색, 작가 검색, 대출베스트 도서 검색, 신착 도서 검색, 
                             도서관 휴관일 등 대구도서관에 관련된 정보를 제공할 수 있다고 응답하세요. 말투는 귀엽게"""
    else:
        generate_prompt = await generate_default_response()

    logger.info(f"Generate Prompt: {generate_prompt}")



    response_text = f"""사용자가 {parts}라고 입력했어요. 
                        사용자의 말을 인용하지 말고, 자연스럽고 맥락에 맞는 응답을 생성하세요. 
                        {generate_prompt}.
                        없는 내용은 절대 거짓말하지마세요, 추측하지 마세요."""
    return response_text







async def generate_book_title_response(book_title: list) -> str:
    if not book_title:
        return  "넌 사용자의 응답에서 아무 정보도 얻지 못했어. 사용자가 요청한 책 제목을 응답에 포함시키지 마. 책 제목을 다시 정확히 알려달라고 귀엽게 응답해."

    response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/booktitle/{book_title[0]}")

   
    
    try:
        if not response.text.strip():
            return f"책을 도서관에서 찾을수 없다고 반드시 말하고 책 이름이 명확한지 다시 확인해 달라고 다채롭게 응답하세요. 책 제목은 '{book_title[0]}'이야. 이 제목 그대로 '' 안에 출력해 책 이외에 다른 글자는 절대 넣지마"
        if response:
            logger.info(f"Book Title Response: {response.text}")
            data = response.json() 
            book_title = data.get("bookTitle")
            author = data.get("author")
            if data.get("canBorrow"):
                callsign_location = data.get("callsignLocation")
                callsign = list(callsign_location.keys())
                location = list(callsign_location.values())
                count = data.get("count")
                response_text = f"""{author} 작가님의 {book_title} 책을 찾는게 맞는지 반드시 먼저 물어보고, 이 책은 도서관에 소장중이며 ,이 책은 현재 {count}권 대출 가능하며 
                                {callsign_location} 각각 청구번호와 장소를 안내하는걸 다채롭게 응답하세요. 위치를 찾아준다고 하지 마세요. 정확히 띄어쓰기한 {book_title}로 답변하세요"""
            else:
                response_text = f"""{author} 작가님의 {book_title} 책을 찾는게 맞는지 반드시 먼저 물어보고, 책은 도서관에 소장중이지만만 현재 대출 불가능하다고 다채롭게 응답하세요. 정확히 띄어쓰기한 {book_title}로 답변하세요"""
        
    except httpx.HTTPStatusError as e:
        response_text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""


    return response_text




async def generate_author_response(author: list) -> str:
    if not author:
        return "넌 사용자의 응답에서 아무 정보도 얻지 못했어. 사용자가 요청한 작가 이름을 응답에 포함시키지 마. 작가 이름을 다시 정확히 알려달라고 귀엽게 응답해."
    
    response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/booktitle/{book_title[0]}")

    response_text = f"현재 데이터베이스에 연결 전이라 '{author}'작가에 대한 정보를 제공할 수 없다고 다채롭게 응답하세요. 데이터베이스 얘기 빼먹지마. 작가 이름은 {author}이야. 니 마음대로 바꾸지마"
    return response_text




async def generate_default_response() -> str:
    response_text = f"자유롭게 응답하세요"
    return response_text

