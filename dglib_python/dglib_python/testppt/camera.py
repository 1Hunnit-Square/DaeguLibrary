import json
from fastapi import FastAPI, HTTPException
import logging
import asyncio
from contextlib import asynccontextmanager 
import httpx
from datetime import datetime, timedelta
from functools import lru_cache


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


today = datetime.today()
one_month_ago = today - timedelta(days=30)
start_date = one_month_ago.strftime('%Y-%m-%d')
end_date = today.strftime('%Y-%m-%d')

# API 설정
INFO_NARU_URL = 'http://data4library.kr/api/loanItemSrch'
INFO_NARU_KEY = 'c1888c7a4825d9bd126707b7edf5314571ec8da864cd982b5eac20238ea88a5a'

ALADIN_API_URL = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx'
ALADIN_KEY = 'ttbsk35021617001'

# 타임아웃 설정
TIMEOUT = 10.0

app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    app.state.http_client = httpx.AsyncClient(timeout=TIMEOUT)
    yield
   
    await app.state.http_client.aclose()


@lru_cache(maxsize=128)
async def get_aladin_book_info_cached(isbn):

    return await get_aladin_book_info(isbn)

async def get_aladin_book_info(isbn):

    params = {
        'ttbkey': ALADIN_KEY,
        'itemIdType': 'ISBN',
        'ItemId': isbn,
        'output': 'js',
        'Version': '20131101'
    }
    
    try:
        response = await app.state.http_client.get(ALADIN_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        book_item = data['item'][0]
    
        return {
            'title': book_item.get('title', "제목 없음"),
            'author': book_item.get('author', "저자 미상"),
            'cover_url': book_item.get('cover', "").replace('coversum/', 'cover500/')
        }
    except (httpx.TimeoutException, httpx.ConnectError):
        logger.error(f"알라딘 API 타임아웃 또는 연결 오류: ISBN {isbn}")
        return {
            'title': "연결 오류",
            'author': "연결 오류",
            'cover_url': ""
        }
    except Exception as e:
        logger.error(f"알라딘 API 호출 중 오류 발생: {str(e)}, ISBN: {isbn}")
        return {
            'title': "오류 발생",
            'author': "오류 발생",
            'cover_url': ""
        }

@app.get("/bookreco/{genre}")
async def bookreco(genre: str):
    logger.info(f"자바에서 넘어온 값: {genre}")
    
    genre_map = {
        "literature": "8",
        "history": "9",
        "philosophy": "1"
    }
    kdc = genre_map.get(genre)
    
    if not kdc:
        raise HTTPException(status_code=400, detail=f"지원하지 않는 장르입니다: {genre}")
    
    params = {
        'authKey': INFO_NARU_KEY,
        'startDt': start_date,
        'endDt': end_date,
        'kdc': kdc,
        'pageNo': 1,
        'pageSize': 5,
        'format': 'json'
    }
    
    try:

        response = await app.state.http_client.get(INFO_NARU_URL, params=params, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()
        
        if 'response' not in data or 'docs' not in data['response']:
            raise HTTPException(status_code=500, detail="정보나루 API 응답 형식이 잘못되었습니다.")
        
        items = data['response']['docs']
        

        aladin_tasks = []
        for item in items:
            book = item['doc']
            isbn = book.get('isbn13') or book.get('isbn')
            if isbn:
                aladin_tasks.append((book, get_aladin_book_info_cached(isbn)))
        
       
        for book, task in aladin_tasks:
            try:
                aladin_info = await task
                
              
                book['bookname'] = aladin_info['title']
                book['authors'] = aladin_info['author']
                book['bookImageURL'] = aladin_info['cover_url']
                
                logger.debug(f"도서 정보 알라딘으로 교체: {book['bookname']} - {book['authors']}")
            except Exception as e:
                logger.error(f"알라딘 정보 처리 중 오류: {str(e)}")
                
        
        return data
    
    except httpx.TimeoutException:
        logger.error("정보나루 API 타임아웃")
        raise HTTPException(status_code=504, detail="정보나루 API 타임아웃")
    except httpx.ConnectError:
        logger.error("정보나루 API 연결 오류")
        raise HTTPException(status_code=503, detail="정보나루 API 연결 오류")
    except Exception as e:
        logger.error(f"API 요청 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"API 요청 실패: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)