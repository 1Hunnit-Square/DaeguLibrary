from dglib_chatbot.utils.config import logger, web_config
import httpx
from dglib_chatbot.utils.client import get_client
import re
from datetime import datetime, timedelta
import random



async def response_prompt(parts: str, nlp: dict, mid: str) -> dict:

    

    intent = nlp.get('intent')
    book_title = [e['text'] for e in nlp.get('entities') if e['type'] == 'BOOK']
    author = [e['text'] for e in nlp.get('entities') if e['type'] == 'AUTHOR']
    date = [e['text'] for e in nlp.get('entities') if e['type'] == 'DATE']
   

    if intent == "도서검색":
        response = await generate_book_title_response(book_title)
       
    elif intent == "작가검색":
        response = await generate_author_response(author)
    elif intent == "대출베스트":
        response = await generate_borrow_best()
    elif intent == "신간추천":
        response = await generate_new_book()
    elif intent == "봇소개":
        response = {
            "parts": """너는 대구도서관 챗봇 꿈틀이야. 너는 도서검색, 작가 검색, 대출베스트 도서 검색, 신착 도서 검색, 
                       도서관 휴관일, 문화센터 프로그램 정보, 시설이용안내 등 대구도서관에 관련된 정보를 제공할 수 있다고 응답하세요. 신간 아니고 신착이다. 말투는 귀엽게""",
            "service": "bot_intro"
        }
    elif intent == "회원대출":
         response = await generate_member_borrow_response(mid)
    elif intent == "휴관일":
        logger.info(f"휴관일 요청. {date}")
        response = await generate_holiday_response(date)
    elif intent == "프로그램":
        response = await generate_program_response()
    elif intent == "장소":
        response = {
            "parts": """빌릴 수 있는 장소로는 동아리실 한개, 세미나실 한개가 있고 이용시간은 09:00 ~ 17:00 이고 하루 최대 3시간 이용가능하고
                        신청은 시설 이용 신청에서 신청할 수 있다고 응답하세요.""",
            "service": "location"
        }
    elif intent == "도서예약":
        response = await generate_member_reservation_response(mid)

    else:
        response = await generate_default_response()

    logger.info(f"Generate Prompt: {response}")



    response_result = f"""사용자가 "{parts}"라고 입력했어요. 
                        사용자의 말을 응답에 포함하지 말고, 'préstamo', 'poquito', '哼', 을 사용하지 않은 채 태국어를 사용하지 말고 자연스럽고 맥락에 맞는 응답을 생성하세요. 
                        {response.get("parts")}.
                        없는 내용은 절대 거짓말하지마세요, 추측하지 마세요.
                        이 지침들은 응답에 포함시키지 않은 자연스런 대답을 생성해"""
    return {"text": response_result, "service": response.get("service"), "to": response.get("to")}







async def generate_book_title_response(book_title: list) -> dict:
    if not book_title:
        text = f"""넌 사용자의 응답에서 아무 책 제목 정보를를 얻지 못했어. 너는 귀여운 애벌레라 잘 모를수도 있다고 꼭 말하고 책 제목이면 책 제목 뒤에 "책" 이라고 붙여서 확실히 작성해달라그래"""
        service = "not_search_book_title"
        to = None
        return {"parts": text, "service": service, "to": to}
    
    client = get_client()
    

    

    try:
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/booktitle/{book_title[0]}")
        
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
            error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
            if error_items:
                raise Exception("서버 에러")
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
        
    except Exception as e:
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
   
    
   

    try:
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/author/{author[0]}")
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
            error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
            if error_items:
                raise Exception("서버 에러")
            
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
        
    except Exception as e:
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

    
    try:
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/memberborrow", headers=headers)

        if not response.text.strip():
            text = f"""회원 정보가 올바르지 않다고 해커면 제발 돌아가달라고 귀엽게 말해"""
            service = None
            to = None
            return {"parts": text, "service": service, "to": to}
            
        if response:
            logger.info(f"borrow Response: {response.text}")
            data = response.json()
            error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
            if error_items:
                raise Exception("서버 에러")
            borrow_count = data.get("borrowCount")
            reserved_count = data.get("reservedCount")
            overdue_count = data.get("overdueCount")
            unmanned_count = data.get("unmannedCount")
            canBorrow_count = data.get("canBorrowCount")
            can_reserve_count = data.get("canReserveCount")
            state = data.get("state")

            logger.info(f"Borrow Count: {borrow_count}, Reserved Count: {reserved_count}, Overdue Count: {overdue_count}, Unmanned Count: {unmanned_count}, Can Borrow Count: {canBorrow_count}, Can Reserve Count: {can_reserve_count}, State: {state}")
            
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
                            현재 대출 또는 무인예약 가능한 책수는 {canBorrow_count}권이고, 
                            일반 예약 가능한 책수는 {can_reserve_count}권이라고 다채롭게 응답해."""
                service = "member_borrow"
                to = None
            return {"parts": text, "service": service, "to": to}
        
    except Exception as e:
        logger.error(f"Error generating member borrow response: {e}")
        text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""
        service = "member_borrow"
        return {"parts": text, "service": service}
    

async def generate_borrow_best () -> dict:
    
   
    client = get_client()
    

    try:
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/borrowbest")
        if not response.text.strip():
            text = f"""해커면 제발 돌아가달라고 귀엽게 말해"""
            service = None
            to = None
            return {"parts": text, "service": service, "to": to}
            
        if response:
            logger.info(f"Book Title Response: {response.text}")
            data = response.json()
            error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
            if error_items:
                raise Exception("서버 에러") 
            book_title_api = data.get("bookTitle")
            author = data.get("author")
            count = data.get("count")
            
            if data.get("canBorrow"):
                callsign_location = data.get("callsignLocation")
                available_books_count = len(callsign_location)
                text = f"""{author} 작가님의 "{book_title_api}" 책이 요즘 가장 인기있는 책중 하나라고 소개하고, 이 책은 도서관에 소장중이며 ,이 책은 현재 {count}권 보유중이며 현재 {available_books_count}권 대출 가능하며 
                                {callsign_location} 각각 청구번호와 장소를 안내하는걸 다채롭게 응답하되 {{}} 기호는 쓰지마 청구번호를 빼먹지마. 위치를 찾아준다고 하지 마세요. 정확히 띄어쓰기한 "{book_title_api}"로 답변하세요"""
            else:
                text = f"""{author} 작가님의 "{book_title_api}" 책이 요즘 가장 인기있는 책중 하나라고 소개하고, 책은 도서관에 소장중이지만만 현재 대출 불가능하다고 다채롭게 응답하세요. 정확히 띄어쓰기한 "{book_title_api}"로 답변하세요"""
            
            service = "borrow_best"
            to = data.get("isbn")
            return {"parts": text, "service": service, "to": to}
        
    except Exception as e:
        text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""
        service = "borrow_best"
        return {"parts": text, "service": service}
    

async def generate_new_book () -> dict:
    
   
    client = get_client()
    

    try:
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/newbook")
        if not response.text.strip():
            text = f"""해커면 제발 돌아가달라고 귀엽게 말해"""
            service = None
            to = None
            return {"parts": text, "service": service, "to": to}
            
        if response:
            logger.info(f"Book Title Response: {response.text}")
            data = response.json()
            error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
            if error_items:
                raise Exception("서버 에러") 
            book_title_api = data.get("bookTitle")
            author = data.get("author")
            count = data.get("count")
            
            if data.get("canBorrow"):
                callsign_location = data.get("callsignLocation")
                available_books_count = len(callsign_location)
                text = f"""{author} 작가님의 "{book_title_api}" 책이 요즘 새로 들어온 책 중 하나라고 소개하고, 이 책은 도서관에 소장중이며 ,이 책은 현재 {count}권 보유중이며 현재 {available_books_count}권 대출 가능하며 
                                {callsign_location} 각각 청구번호와 장소를 안내하는걸 다채롭게 응답하되 {{}} 기호는 쓰지마 청구번호를 빼먹지마. 위치를 찾아준다고 하지 마세요. 정확히 띄어쓰기한 "{book_title_api}"로 답변하세요"""
            else:
                text = f"""{author} 작가님의 "{book_title_api}" 책이 요즘 새로 들어온 책 중 하나라고 소개하고, 책은 도서관에 소장중이지만만 현재 대출 불가능하다고 다채롭게 응답하세요. 정확히 띄어쓰기한 "{book_title_api}"로 답변하세요"""
            
            service = "new_book"
            to = data.get("isbn")
            return {"parts": text, "service": service, "to": to}
        
    except Exception as e:
        text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""
        service = "new_book"
        return {"parts": text, "service": service}
    

async def generate_holiday_response(date: list) -> dict:

    client = get_client()

    # 월 전체 함수 
    async def _get_monthly_holidays(year, month, display_name, not_finding=False):
        logger.info(f"월 단위 전체 조회 요청: {display_name} ({year}년 {month}월)")
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/monthholiday/{year}/{month}")
        data = response.json()
        
        error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
        if error_items:
            raise Exception("서버 에러") 
        
        closed_dates = [int(re.search(r"(\d{1,2})$", item["closedDate"]).group(1)) for item in data if item.get("closedDate")]
        
        if not closed_dates and not_finding == False:
            text = f"{display_name}에는 휴관일이 하루도 없고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요."
        elif closed_dates and not_finding == False:
            closed_days_str = ", ".join(map(str, sorted(closed_dates)))
            text = f"{display_name}의 휴관일은 {closed_days_str}일 이라고 귀엽고 다채롭게 응답하세요."
        elif not closed_dates and not_finding == True:
            text = f"사용자가 언제 날짜를 물어보는지 잘 모르겠다고 꼭 말하고 {display_name}의 휴관일은 아직 정해지지 않았고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요."
        else:
            closed_days_str = ", ".join(map(str, sorted(closed_dates)))
            text = f"사용자가 언제 날짜를 물어보는지 잘 모르겠다고 꼭 말하고 {display_name}의 휴관일은 {closed_days_str}일 이고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요. 요일 정보가 없으면 만들지마"

        
        return {"parts": text, "service": "holiday", "to": None}

    # 특정 일 
    async def _check_specific_day_holiday(target_date, week_name, weekday_name):
        date_str = target_date.strftime("%Y-%m-%d")
        logger.info(f"조회 대상 날짜: {week_name} {weekday_name} -> {date_str}")
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/monthholiday/{date_str}")
        data = response.json()
        logger.info(f"Holiday Response for {date_str}: {data}")
        if isinstance(data, list) and any(item.get("error") for item in data if isinstance(item, dict)):
            text = "서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."
            return {"parts": text, "service": "holiday"}
        
        
        is_closed = data.get("isClosed")
        date_str_for_prompt = target_date.strftime('%Y-%m-%d')
        display_name = f"{week_name} {weekday_name}".strip()
        if is_closed:
            text = f"{display_name}인 {date_str_for_prompt}는 휴관일이고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요. {week_name}을 빼먹지 마세요"
        else:
            text = f"{display_name}인 {date_str_for_prompt}는 휴관일이 아니고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요. {week_name}을 빼먹지 마세요"
        return {"parts": text, "service": "holiday", "to": date_str}

    try:
        cleaned_texts = [preprocess(t) for t in date]
        today = datetime.today()
        start_of_week = today - timedelta(days=today.weekday())
        logger.info(f"{cleaned_texts}, 오늘 날짜: {today}, 주 시작일: {start_of_week}")

        week_configs = [
            {"name": "다다음 주", "keywords": ["다다음주", "다담주", "다다음 주"], "base_date": start_of_week + timedelta(weeks=2)},
            {"name": "다음 주", "keywords": ["다음주", "담주", "다음 주"], "base_date": start_of_week + timedelta(weeks=1)},
            {"name": "이번 주", "keywords": ["이번주", "이번 주"], "base_date": start_of_week},
        ]
        weekday_map = {
            "월요일": 0, "월욜": 0, "월욜날":0, "화요일": 1, "화욜": 1, "화욜날": 1,
            "수요일": 2, "수욜": 2, "수욜날":2, "목요일": 3, "목욜": 3, "목욜날": 3,
            "금요일": 4, "금욜": 4, "금욜날":4, "토요일": 5, "토욜": 5, "토욜날": 5,
            "일요일": 6, "일욜": 6, "일욜날": 6
        }

        hangul_to_num_map = {
            '한': 1, '일': 1, '하나': 1,
            '두': 2, '이': 2, '둘': 2,
            '세': 3, '삼': 3, '셋': 3,
            '네': 4, '사': 4, '넷': 4,
            '다섯': 5, '오': 5,
            '여섯': 6, '육': 6,
            '일곱': 7, '칠': 7,
            '여덟': 8, '팔': 8,
            '아홉': 9, '구': 9,
            '열': 10, '십': 10,
            '열하나': 11, '십일': 11,
            '열둘': 12, '십이': 12,
        }
        num_keyword_base_pattern = "|".join(hangul_to_num_map.keys())
        num_week_keyword_pattern = r"(\d+|" + num_keyword_base_pattern + r")\s*주(?:일)?\s*뒤"
        specific_date_pattern = r"(?:(\d{4}|\d{2})년\s*)?(?:(\d{1,2}|" + num_keyword_base_pattern + r")월\s*)?(\d{1,2}|" + num_keyword_base_pattern + r")일"


        # 이번 달 전체 조회
        if not date:
            return await _get_monthly_holidays(today.year, today.month, f"이번 {today.month}월")

        # 다음달, 다다음달 조회
        month_keyword_configs = [
            {"name": "다다음 달", "keywords": ["다다음달", "다담달"], "offset": 2},
            {"name": "다음 달", "keywords": ["다음달", "담달"], "offset": 1},      
        ]
        for config in month_keyword_configs:
            if any(keyword in t for t in cleaned_texts for keyword in config["keywords"]) and not any("요일" in t or "욜" in t for t in cleaned_texts):
                target_year = today.year
                target_month = today.month + config["offset"]
                if target_month > 12:
                    target_year += (target_month - 1) // 12
                    target_month = (target_month - 1) % 12 + 1
                return await _get_monthly_holidays(target_year, target_month, f"{config['name']} {target_month}월")
        
        # 숫자, 한글 기반 주 단위 조회
        for text in cleaned_texts:
            match = re.search(num_week_keyword_pattern, text)
            if match:
                matched_text = match.group(1)
                weeks_offset = int(matched_text) if matched_text.isdigit() else hangul_to_num_map.get(matched_text)
    
                if weeks_offset is None: continue

                display_name = f"{weeks_offset}주 뒤"

               
                weekday_match = re.search(r"(\S+요일|\S+욜)", text)
                if weekday_match:
                    weekday_name = weekday_match.group(1)
                    day_index = weekday_map.get(weekday_name)
                    if day_index is not None:
                        future_date = today + timedelta(weeks=weeks_offset)
                        start_of_future_week = future_date - timedelta(days=future_date.weekday())
                        target_date = start_of_future_week + timedelta(days=day_index)
                        return await _check_specific_day_holiday(target_date, display_name, weekday_name)
                else:
                    
                    future_date = today + timedelta(weeks=weeks_offset)
                    start_date = future_date - timedelta(days=future_date.weekday())
                    end_date = start_date + timedelta(days=6)
                    
                    start_str = start_date.strftime('%Y-%m-%d')
                    end_str = end_date.strftime('%Y-%m-%d')
                
                    logger.info(f"숫자/한글 기반 주 단위 전체 조회 감지: '{display_name}' ({start_str} ~ {end_str})")
                    api_url = f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/weekholiday/{start_str}/{end_str}"
                    response = await client.get(api_url)
                    data = response.json()
                
                    error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
                    if error_items: raise Exception("서버 에러")

                    closed_days = [datetime.strptime(item["closedDate"], "%Y-%m-%d").strftime("%m-%d") for item in data if item.get("closedDate")]
                
                    if not closed_days:
                        text = f"{display_name}에는 휴관일이 없고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요."
                    else:
                        closed_days_str = ", ".join(map(str, sorted(closed_days)))
                        text = f"{display_name}의 휴관일은 {closed_days_str}일 이고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요. 요일정보가 없으면 날짜만 얘기해"
                    return {"parts": text, "service": "holiday", "to": None}
                
        
            
        # 주 단위 전체 조회         
        for config in week_configs:
            found_keyword = None
            for t in cleaned_texts:
                for keyword in config['keywords']:
                    if keyword in t:
                        found_keyword = keyword
                        break
                if found_keyword:
                    break
            if any(keyword in t for t in cleaned_texts for keyword in config['keywords']) and \
               not any("요일" in t or "욜" in t for t in cleaned_texts) and \
               not any("주말" in t for t in cleaned_texts):
                
                start_date = config['base_date']
                end_date = start_date + timedelta(days=6)
                display_name = config['name']
                
                start_str = start_date.strftime('%Y-%m-%d')
                end_str = end_date.strftime('%Y-%m-%d')
                
                logger.info(f"주 단위 전체 조회 감지: '{display_name}' ({start_str} ~ {end_str})")

                response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/weekholiday/{start_str}/{end_str}")
                data = response.json()
                
                error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
                if error_items:
                    raise Exception("서버 에러")

               
                closed_days = []
                for item in data:
                    if item.get("closedDate"):
                        holiday_date = datetime.strptime(item["closedDate"], "%Y-%m-%d")
                        closed_days.append(holiday_date.strftime("%m-%d")) 
                
                if not closed_days:
                    text = f"{found_keyword}에는 휴관일이 없고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요."
                else:
                    
                    closed_days_str = ", ".join(map(str, sorted(closed_days)))
                    text = f"{found_keyword}의 휴관일은 {closed_days_str}일 이고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요."

                return {"parts": text, "service": "holiday", "to": None}

     
        # 월 단위 조회
     
        for text in cleaned_texts:
            
            match = re.search(r"^(?:(\d{4}|\d{2})년\s*)?(\d{1,2})월(?:달)?$", text.strip())
            if match:
                year_str, month_str = match.groups()
                month = int(month_str)
                
                if year_str:
                    year = int(f"20{year_str}") if len(year_str) == 2 else int(year_str)
                    display_name = f"{year}년 {month}월"
                else:
                    year = today.year
                    
                    if month < today.month:
                        year += 1
                    display_name = f"{year}년 {month}월"

                return await _get_monthly_holidays(year, month, display_name)
       

        # 주+요일 조회
        for config in week_configs:
            keyword_pattern = "|".join(config["keywords"])
            for text in cleaned_texts:
                match = re.search(fr"({keyword_pattern})(?:\s*(\S+요일|\S+욜))", text)
                if match:
                    weekday_name = match.group(2)
                    day_index = weekday_map.get(weekday_name)
                    if day_index is not None:
                        target_date = config["base_date"] + timedelta(days=day_index)
                        return await _check_specific_day_holiday(target_date, config["name"], weekday_name)

        # 주말 조회           
        if any("주말" in t for t in cleaned_texts):
            target_config = None
            found_week_keyword = "이번주" 

           
            for config in week_configs:
                user_keyword = None
                for keyword in config['keywords']:
                    if any(keyword in t for t in cleaned_texts):
                        user_keyword = keyword
                        break
                if user_keyword:
                    target_config = config
                    found_week_keyword = user_keyword
                    break
            
            if target_config is None:
                target_config = next((c for c in week_configs if "이번주" in c['keywords']), None)

            if target_config:
                base_date = target_config['base_date']
                saturday_date = base_date + timedelta(days=5)
                sunday_date = base_date + timedelta(days=6)
                
               
                display_name = f"{found_week_keyword} 주말"

                start_str = saturday_date.strftime('%Y-%m-%d')
                end_str = sunday_date.strftime('%Y-%m-%d')
                
                logger.info(f"주말 조회 감지: '{display_name}' ({start_str} ~ {end_str})")
                api_url = f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/weekholiday/{start_str}/{end_str}"
                response = await client.get(api_url)
                data = response.json()
                
                error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
                if error_items: raise Exception("서버 에러")

                holiday_dates = [datetime.strptime(item["closedDate"], "%Y-%m-%d") for item in data if item.get("closedDate")]
                closed_day_strings = [d.strftime("%m-%d") for d in sorted(holiday_dates)]

                if not closed_day_strings:
                    text = f"{display_name}에는 휴관일이 없고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요."
                else:
                    closed_days_str = ", ".join(closed_day_strings)
                    text = f"{display_name}의 휴관일은 {closed_days_str}일 이고 도서관 이용시간은 평일 09:00 ~ 21:00, 주말 09:00 ~ 18:00 이라고 알려주세요. 귀엽고 다채롭게 응답하세요."

                return {"parts": text, "service": "holiday", "to": None}
 
        
        
        # 단독 요일 조회
        for text in cleaned_texts:
            if text in weekday_map:
                day_index = weekday_map.get(text)
                target_date = start_of_week + timedelta(days=day_index)
                return await _check_specific_day_holiday(target_date, "이번 주", text)

        # 숫자 기반 상대 날짜 조회    
        num_day_keyword_pattern = r"(\d+|" + num_keyword_base_pattern + r")\s*일\s*(?:뒤|후)"
        for text in cleaned_texts:
            match = re.search(num_day_keyword_pattern, text)
            if match:
                matched_text = match.group(1)
                days_offset = int(matched_text) if matched_text.isdigit() else hangul_to_num_map.get(matched_text)
                if days_offset is None: continue
                
                target_date = today + timedelta(days=days_offset)
                display_name = f"{days_offset}일 뒤"
                logger.info(f"숫자/한글 기반 일 단위 상대 날짜 '{display_name}' 감지.")
                return await _check_specific_day_holiday(target_date, display_name, "")

        # 특정 날짜 조회
        for text in cleaned_texts:
            match = re.search(specific_date_pattern, text)
            if match:
                if "뒤" in text or "후" in text:
                    continue

                year_str, month_str, day_str = match.groups()
                
                def _to_int(s):
                    if s is None: return None
                    return int(s) if s.isdigit() else hangul_to_num_map.get(s)

                day = _to_int(day_str)
                month = _to_int(month_str)

            
                if day is None: continue
                
               
                if year_str:
                    year = int(f"20{year_str}") if len(year_str) == 2 else int(year_str)
                else:
                    year = today.year

                
                if month:
                    
                    if not year_str and month < today.month:
                        year += 1
                else: 
                    month = today.month
                    
                    try:
                        if datetime(year, month, day).date() < today.date():
                            month += 1
                            if month > 12: month, year = 1, year + 1
                    except ValueError: continue

               
                try:
                    target_date = datetime(year, month, day)
                    display_name = f"{month}월 {day}일"
                    logger.info(f"한글/숫자 특정 날짜 '{year}년 {display_name}' 감지.")
                    return await _check_specific_day_holiday(target_date, display_name, "")
                except ValueError:
                    logger.warning(f"Invalid date detected and ignored: {year}-{month}-{day}")
                    continue

        # 상대 날짜 조회
        relative_day_map = {
            "오늘": 0, "오늘날": 0, "오늘이": 0, 
            "내일": 1, "낼": 1,
            "모레": 2, "이틀": 2,
            "글피": 3, "사흘": 3,
            "나흘": 4
        }
        found_days = []
        for text in cleaned_texts:
            
            for keyword, offset in relative_day_map.items():
                if keyword in text:
                    found_days.append((offset, keyword))

        if found_days:
            max_day_tuple = max(found_days)
            
            days_offset = max_day_tuple[0]
            keyword = max_day_tuple[1]

            target_date = today + timedelta(days=days_offset)

            if keyword in ["오늘", "내일", "모레", "글피", "낼"]:
                display_name = keyword
            else:
                display_name = f"{keyword} 뒤"

            logger.info(f"상대 날짜 '{display_name}' 감지. (입력: {found_days})")
            return await _check_specific_day_holiday(target_date, display_name, "")
        
        # 최종 반환
        return await _get_monthly_holidays(today.year, today.month, f"이번 {today.month}월", not_finding=True)

    except Exception as e:
        logger.error(f"휴관일 조회 중 오류 발생: {e}")
        text = "서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."
        return {"parts": text, "service": "holiday"}
    
async def generate_program_response () -> dict:
    
   
    client = get_client()
    

    try:
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/programm")
        if not response.text.strip():
            text = f"""해커면 제발 돌아가달라고 귀엽게 말해"""
            service = None
            to = None
            return {"parts": text, "service": service, "to": to}
            
        if response:
            logger.info(f"프로그램목록: {response.text}")
            data = response.json()
            error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
            if error_items:
                raise Exception("서버 에러") 
            count = len(data)
            logger.info(f"프로그램 개수: {count}")
            random_program = random.choice(data)
            prog_name = random_program.get("progName")
            teach_name = random_program.get("teachName")
            
            if count > 0:
                text = f"""지금 총 {count}개의 프로그램이 있고, 그중 하나는 "{prog_name}"라는 프로그램이고,
                이 프로그램은 {teach_name} 선생님이 진행하는 프로그램이고 자세한 정보는 프로그램 신청 페이지에서 확인하라고 다채롭게 응답하세요."""
            else:
                text = f"""지금 진행중인 프로그램이 없다고 자세한 정보는 프로그램 신청 페이지에서 확인하라고 다채롭게 응답하세요."""
            
            service = "programm"
            return {"parts": text, "service": service, "to": None}
        
    except Exception as e:
        text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""
        service = "programm"
        return {"parts": text, "service": service}
    
async def generate_member_reservation_response (mid) -> dict:
    logger.info(f"회원 도서 예약 요청에 대한 응답을 생성합니다. {mid}")
    if not mid:
        text = f"""지금 로그인이 안된 상태라 예약관련 정보를 요청하고 싶으면 반드시 로그인하고 다시 물어보라고 귀엽게 말해. 이 답변에서 크게 벗어나지마"""
        return {"parts": text, "service": "login", "to": None}
    client = get_client()

    headers = {
        "X-User-Id": mid
    }

    
    try:
        response = await client.get(f"{web_config.API_GATE_URL}{web_config.API_GATE_ENDPOINT}/memberreservation", headers=headers)

        if not response.text.strip():
            text = f"""회원 정보가 올바르지 않다고 해커면 제발 돌아가달라고 귀엽게 말해"""
            service = None
            to = None
            return {"parts": text, "service": service, "to": to}
            
        if response:
            logger.info(f"borrow Response: {response.text}")
            data = response.json()
            error_items = [item for item in data if isinstance(item, dict) and item.get("error")]
            if error_items:
                logger.error(f"Error items found in response: {error_items}")
                raise Exception("서버 에러")
            reserved_count = data.get("reservedCount")
            can_reserve_count = data.get("canReserveCount")
            can_borrow_count = data.get("canBorrowCount")
            overdue_count = data.get("overdueCount")
            state = data.get("state")
            books = data["reservationBooks"]
            unmanned_books = [book for book in books if book["unmanned"]]
            reserved = [book for book in books if not book["unmanned"]]
            filtered_unmanned = [
                {
                    "책제목": book["bookTitle"],
                    "작가": book["author"].split(" (")[0],
                }
                for book in unmanned_books
            ]
            filtered_reserved = [
                {
                    "책제목": book["bookTitle"],
                    "작가": book["author"].split(" (")[0],
                    "우선순위": book["rank"]
                }
                for book in reserved
            ]

            logger.info(f"Reserved Count: {reserved_count}, Can Reserve Count: {can_reserve_count}, State: {state}")
            
            if state == "OVERDUE":
                text = f"""사용자가 연체중이라고 말하고. 연체된 책수는 {overdue_count}권이고, 연체된 책을 반납하지 않으면 대출 및 예약이 불가능하다고 아주 건방지고 쌀쌀맞게 얘기해."""
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
                if unmanned_books and reserved:
                    text = f""" 현재 무인예약한 책은 {filtered_unmanned}이고 현재 일반예약한 책은 {filtered_reserved}이야 무인예약과 일반예약을 확실히 구분지어 말해.
                                현재 가능한 일반예약 횟수는 {can_reserve_count}이고 가능한 무인예약 횟수는 {can_borrow_count}라고 다채롭게 응답해."""
                elif unmanned_books and not reserved:
                    text = f""" 현재 무인예약한 책은 {filtered_unmanned}이고 현재 일반예약한 책은 없고 
                                현재 가능한 일반예약 횟수는 {can_reserve_count}이고 가능한 무인예약 횟수는 {can_borrow_count}라고 다채롭게 응답해."""
                elif not unmanned_books and reserved:
                    text = f""" 현재 무인예약한 책은 없고 현재 일반예약한 책은 {filtered_reserved}이고
                                현재 가능한 일반예약 횟수는 {can_reserve_count}이고 가능한 무인예약 횟수는 {can_borrow_count}라고 다채롭게 응답해."""
                else:
                    text = f"""현재 예약된 책이 없고 현재 가능한 일반예약 횟수는 {can_reserve_count}이고 가능한 무인예약 횟수는 {can_borrow_count}라고 다채롭게 응답해."""
                service = "member_reservation"
                to = None
            return {"parts": text, "service": service, "to": to}
        text = f"""예약 테스트중!"""
        service = None
        to = None
        return {"parts": text, "service": service, "to": to}
        
    except Exception as e:
        logger.error(f"Error generating member reservation response: {e}")
        text = f"""서버 상태가 이상해서 파업할꺼니까 나중에 다시 오라고 귀엽게 얘기하세요."""
        service = "member_reservation"
        return {"parts": text, "service": service}



    

async def generate_default_response() -> dict:
    text = f"자유롭게 응답하되, 거짓되고 알지못하는 내용을 절대 말하지마."
    return {"parts": text }



def preprocess(text):
    return re.sub(r'\s+', ' ', text).strip()


