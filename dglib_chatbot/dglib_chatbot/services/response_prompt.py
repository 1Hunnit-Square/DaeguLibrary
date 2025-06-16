from dglib_chatbot.utils.config import logger, web_config
import httpx
from dglib_chatbot.utils.client import get_client



async def response_prompt(parts: str, nlp: dict, mid: str) -> dict:

    

    intent = nlp.get('intent')
    book_title = [e['text'] for e in nlp.get('entities') if e['type'] == 'BOOK']
    author = [e['text'] for e in nlp.get('entities') if e['type'] == 'AUTHOR']
   

    if intent == "도서검색":
        response = await generate_book_title_response(book_title)
       
    elif intent == "작가검색":
        response = await generate_author_response(author)
    elif intent == "대출베스트":
        logger.info("대출베스트 요청에 대한 응답을 생성합니다.")
    elif intent == "봇소개":
        response = {
            "parts": """너는 대구도서관 ai 챗봇 꿈틀이야. 너는 도서검색, 작가 검색, 대출베스트 도서 검색, 신착 도서 검색, 
                       도서관 휴관일 등 대구도서관에 관련된 정보를 제공할 수 있다고 응답하세요. 말투는 귀엽게""",
            "service": "bot_intro"
        }
    elif intent == "회원대출":
         response = await generate_member_borrow_response(mid)

    else:
        response = await generate_default_response()

    logger.info(f"Generate Prompt: {response}")



    response_result = f"""사용자가 {parts}라고 입력했어요. 
                        사용자의 말을 인용하지 말고, 'préstamo', 'poquito', '哼', 을 사용하지 않은 채 태국어를 사용하지 말고 자연스럽고 맥락에 맞는 응답을 생성하세요. 
                        {response.get("parts")}.
                        없는 내용은 절대 거짓말하지마세요, 추측하지 마세요."""
    return {"text": response_result, "service": response.get("service"), "to": response.get("to")}







async def generate_book_title_response(book_title: list) -> dict:
    if not book_title:
        text = f"""넌 사용자의 응답에서 아무 책 제목 정보를를 얻지 못했어. 너는 귀여운 애벌레라 잘 모를수도 있다고 꼭 말하고 책 제목이면 책 제목 뒤에 "책" 이라고 붙여서 확실히 작성해달라그래"""
        service = "not_search_book_title"
        to = None
        return {"parts": text, "service": service, "to": to}
    
    client = get_client()
    

    response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/booktitle/{book_title[0]}")

    try:
        if not response.text.strip():
            text = f"""책을 도서관에서 찾을수 없다고 반드시 말하고 책 이름이 명확한지 다시 확인해 달라고 다채롭게 응답하세요. 
                        너는 귀여운 애벌레라 잘 모를수도 있다고 꼭 말하고 사용자가 요청한 "{book_title[0]}"이 책이름인지 작가 이름인지 헷갈리니까 좀 더 정확하게 구분지어서 다시 문장으로 요청해줬으면 좋겠다고도 응답해. 
                        책 제목은 '{book_title[0]}'이야. 이 제목 그대로 '' 안에 출력해 책 이외에 다른 글자는 절대 넣지마"""
            service = "not_search_book_title"
            to = None
            return {"parts": text, "service": service, "to": to}
            
        if response:
            logger.info(f"Book Title Response: {response.text}")
            data = response.json() 
            book_title_api = data.get("bookTitle")
            author = data.get("author")
            count = data.get("count")
            
            if data.get("canBorrow"):
                callsign_location = data.get("callsignLocation")
                available_books_count = len(callsign_location)
                text = f"""{author} 작가님의 "{book_title_api}" 책을 찾는게 맞는지 반드시 먼저 물어보고, 이 책은 도서관에 소장중이며 ,이 책은 현재 {count}권 보유중이며 현재 {available_books_count}권 대출 가능하며 
                                {callsign_location} 각각 청구번호와 장소를 안내하는걸 다채롭게 응답하되 {{}} 기호는 쓰지마. 위치를 찾아준다고 하지 마세요. 정확히 띄어쓰기한 "{book_title_api}"로 답변하세요"""
            else:
                text = f"""{author} 작가님의 "{book_title_api}" 책을 찾는게 맞는지 반드시 먼저 물어보고, 책은 도서관에 소장중이지만만 현재 대출 불가능하다고 다채롭게 응답하세요. 정확히 띄어쓰기한 "{book_title_api}"로 답변하세요"""
            
            service = "search_book_title"
            to = data.get("isbn")
            return {"parts": text, "service": service, "to": to}
        
    except httpx.HTTPStatusError as e:
        text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""
        service = "search_book_title"
        return {"parts": text, "service": service}

async def generate_author_response(author: list) -> dict:
   
   
    
    if not author:
        text = f"""넌 사용자의 응답에서 아무 작가 이름 정보를를 얻지 못했어. 너는 귀여운 애벌레라 잘 모를수도 있다고 꼭 말하고 작가 이름이면 작가 이름 뒤에 "작가" 라고 붙여서 확실히 작성해달라그래"""
        service = "not_search_author"
        to = None
        return {"parts": text, "service": service, "to": to}
    client = get_client()
   
    
    response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/author/{author[0]}")

    try:
        if not response.text.strip():
            text = f"""해당 작가의 책을 도서관에서 찾을수 없다고 반드시 말하고 책 이름이 명확한지 다시 확인해 달라고 다채롭게 응답하세요. 
                    너는 귀여운 애벌레라 잘 모를수도 있다고 꼭 말하고 사용자가 요청한 "{author[0]}"이 책이름인지 작가 이름인지 헷갈리니까 좀 더 정확하게 구분지어서 다시 문장으로 요청해줬으면 좋겠다고도 응답해. 
                    작가 이름은 '{author[0]}'이야. 이 이름 그대로 '' 안에 출력해 이름 이외에 다른 글자는 절대 넣지마"""
            service = "not_search_author"
            to = None
            return {"parts": text, "service": service, "to": to}
            
        if response:
            logger.info(f"author Response: {response.text}")
            data = response.json() 
            book_title = data.get("bookTitle")
            author_name = data.get("author")
            all_count = data.get("allCount")
            count = data.get("count")
            
            if data.get("canBorrow"):
                callsign_location = data.get("callsignLocation")
                available_books_count = len(callsign_location)
                text = f"""{author_name}에서 지은이만 사용해. 작가님의 책을 찾는게 맞는지 반드시 먼저 물어보고, 이 작가님의 책은 총 {all_count}권 소장중이고 인기 있는 책 제목은 "{book_title}"이며
                현재 이 책은 {count}권 보유중이며 현재 {available_books_count}권 대출 가능하며
                {callsign_location} 각각 청구번호와 장소를 안내하는걸 다채롭게 응답하되 {{}} 기호는 쓰지마.
                위치를 찾아준다고 하지 마세요."""
            else:
                text = f"""{author_name}에서 지은이만 사용해. 작가님의 책을 찾는게 맞는지 반드시 먼저 물어보고, 이 작가님의 책은 총 {all_count}권 소장중이고 인기 있는 책 제목은 "{book_title}"이지만 
                책은 도서관에 소장중이지만만 현재 대출 불가능하다고 다채롭게 응답하세요."""
            
            service = "search_author"
            to = author_name
            return {"parts": text, "service": service, "to": to}
        
    except httpx.HTTPStatusError as e:
        text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""
        service = "search_author"
        return {"parts": text, "service": service}
    

async def generate_member_borrow_response (mid) -> dict:
    logger.info(f"회원 대출 요청에 대한 응답을 생성합니다. {mid}")
    if not mid:
        text = f"""지금 로그인이 안된 상태라 대출관련 정보를 요청하고 싶으면 반드시 로그인하고 다시 물어보라고 귀엽게 말해. 이 답변에서 크게 벗어나지마"""
        return {"parts": text, "service": "login", "to": None}
    client = get_client()

    headers = {
        "X-User-Id": mid
    }

    response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/memberborrow", headers=headers)

    try:
        if not response.text.strip():
            text = f"""회원 정보가 올바르지 않다고 해커면 제발 돌아가달라고 귀엽게 말해해"""
            service = None
            to = None
            return {"parts": text, "service": service, "to": to}
            
        if response:
            logger.info(f"borrow Response: {response.text}")
            data = response.json() 
            borrow_count = data.get("borrowCount")
            reserved_count = data.get("reservedCount")
            overdue_count = data.get("overdueCount")
            unmanned_count = data.get("unmannedCount")
            canBorrow_count = data.get("canBorrowCount")
            canReserve_count = data.get("canReserveCount")
            state = data.get("state")

            logger.info(f"Borrow Count: {borrow_count}, Reserved Count: {reserved_count}, Overdue Count: {overdue_count}, Unmanned Count: {unmanned_count}, Can Borrow Count: {canBorrow_count}, Can Reserve Count: {canReserve_count}, State: {state}")
            
            if state == "OVERDUE":
                text = f"""사용자가 연체중이라고 말하고. 연체된 책수는 {overdue_count}권이고, 연체된 책을 반납하지 않으면 대출이 불가능하다고 아주 건방지고 쌀쌀맞게 얘기해."""
                service = "member_borrow"
                to = None
            elif state == "PUNISH":
                text = f"""사용자가 계정 정지 상태라고 확실하게 꼭 먼저 말하고, 
                            꿈틀이는 정지된 사람이랑 대화 나눌 맘도 없다고 꼭 말하고 쌀쌀맞고 메스카키처럼 말하지만 귀엽게 말해. 
                            정지당한 사람한테는 줄 정보따윈 없다고 해.
                            모른다고 하지마. 마지막에는 꿈틀꿈틀🐛로 대신해"""
                service = "plese_leave"
                to = None
            else:
                text = f"""사용자가 현재 대출중인 책수는 {borrow_count}권이고, 
                            예약된 책수는 {reserved_count}권이고, 
                            무인예약한 책수는 {unmanned_count}권이고, 
                            현재 대출 가능한 책수는 {canBorrow_count}권이고, 
                            예약 가능한 책수는 {canReserve_count}권이라고 다채롭게 응답해."""
                service = "member_borrow"
                to = None
            return {"parts": text, "service": service, "to": to}
        
    except httpx.HTTPStatusError as e:
        text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""
        service = "search_author"
        return {"parts": text, "service": service}



    

async def generate_default_response() -> dict:
    text = f"자유롭게 응답하세요"
    return {"parts": text }

