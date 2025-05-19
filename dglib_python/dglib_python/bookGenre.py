import json
import logging
import time
import asyncio
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.base import JobLookupError


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# 정보나루 API 설정
INFO_NARU_URL = 'http://data4library.kr/api/loanItemSrch'
INFO_NARU_KEY = 'c1888c7a4825d9bd126707b7edf5314571ec8da864cd982b5eac20238ea88a5a'

# 알라딘 API 설정
ALADIN_API_URL = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx'
ALADIN_KEY = 'ttbsk35021617001'


MAX_RETRIES = 3
RETRY_DELAY = 2


GENRE_MAP = {
    "philosophy": "1",
    "religion": "2",
    "social-sciences": "3",
    'natural-sciences': "4",
    "technology": "5",
    "art": "6",
    "language": "7",
    "literature": "8",
    "history": "9",
}


book_cache = {}
last_update_time = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("서버 시작")
    await run_update_with_retry()
    #테스트
    # scheduler.add_job(run_update_with_retry, 'interval', minutes=1)
    #자정
    scheduler.add_job(run_update_with_retry, 'cron', hour=0, minute=0)
    scheduler.start()
    logger.info("도서 데이터 로드 완료")

    yield
   
    scheduler.shutdown()
    logger.info("서버 종료")

app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


scheduler = AsyncIOScheduler()

failed_genres_cache = set()

async def run_update_with_retry():
    global failed_genres_cache
    
    try:
        if failed_genres_cache:
            genres_to_update = list(failed_genres_cache)
            logger.info(f"실패 장르 재시도: {genres_to_update}")
        else:
            genres_to_update = list(GENRE_MAP.keys())
        
        
        await update_selected_book_data(genres_to_update)
        
       
        if failed_genres_cache:
            logger.warning(f"일부 장르 업데이트 실패: {failed_genres_cache}. 5분 후 재시도 예약.")
            await schedule_retry()
        else:
            logger.info("모든 장르 업데이트 성공 완료.")
    
    except Exception as e:
        logger.error(f"업데이트 작업 실패: {e}. 5분 후 재시도 예약.")
        await schedule_retry()

async def schedule_retry():
    retry_time = datetime.now() + timedelta(minutes=5)
    job_id = f"retry_update_{retry_time.timestamp()}" 
    
    try:
        try:
            scheduler.remove_job(job_id)
        except JobLookupError:
            pass
            
        scheduler.add_job(
            run_update_with_retry,
            'date',
            run_date=retry_time,
            id=job_id,
            name=f"도서 업데이트 재시도 ({retry_time.strftime('%H:%M:%S')})",
            replace_existing=True  
        )
        logger.info(f"{retry_time.strftime('%Y-%m-%d %H:%M:%S')}에 재시도 작업 예약 완료")
    except Exception as e:
        logger.error(f"재시도 작업 예약 실패: {e}")

async def update_selected_book_data(genres_to_update):
    global last_update_time, failed_genres_cache
    
    logger.info(f"선택된 장르 도서 데이터 업데이트 시작: {genres_to_update}")
    
    tasks = []
    for genre in genres_to_update:
        tasks.append(fetch_book_data(genre))
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    
    new_failed_genres = []
    
    for genre, result in zip(genres_to_update, results):
        if isinstance(result, Exception):
            new_failed_genres.append(genre)
            logger.error(f"{genre} 장르 데이터 처리 중 예외 발생: {result}")
        elif not result:
            new_failed_genres.append(genre)
            logger.error(f"{genre} 장르 데이터 가져오기 실패")
        else:
            logger.info(f"{genre} 장르 데이터 성공적으로 업데이트")
            failed_genres_cache.discard(genre)
    
 
    failed_genres_cache.update(new_failed_genres)
    
    last_update_time = datetime.now()
    
    if new_failed_genres:
        logger.warning(f"일부 장르 업데이트 실패 ({', '.join(new_failed_genres)}), 나머지는 성공적으로 캐시됨")
    else:
        logger.info(f"선택된 모든 도서 데이터 업데이트 성공 완료: {last_update_time}")



def safe_request(url, params, max_retries=MAX_RETRIES, delay=RETRY_DELAY):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()  
            
            return response.json(), None
        except requests.HTTPError as e:
            logger.warning(f"API 응답 상태 코드 오류: {e}, URL: {url}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON 디코딩 오류: {e}, 응답 내용: {response.text[:200]}")
        except requests.RequestException as e:
            logger.error(f"요청 오류 발생: {e}, URL: {url}")
        
      
        if attempt < max_retries - 1:
            time.sleep(delay)
            continue
    
    return None, "API 요청 실패"

def get_aladin_book_info(isbn):
    
    params = {
        'ttbkey': ALADIN_KEY,
        'itemIdType': 'ISBN',
        'ItemId': isbn,
        'output': 'js',
        'Version': '20131101'
    }
    
    data, error = safe_request(ALADIN_API_URL, params)
    
    if error or not data:
        logger.error(f"알라딘 API 오류: {error}, ISBN: {isbn}")
        return {
            'title': "API 오류",
            'author': "정보를 가져올 수 없음",
            'cover_url': "https://placeholder.com/api-error"
        }
    
    try:
        book_item = data.get('item')[0]
        
        
        return {
            'title': book_item.get('title'),
            'author': book_item.get('author'),
            'cover_url': book_item.get('cover').replace('coversum/', 'cover500/')
        }
    except (KeyError, IndexError) as e:
        logger.error(f"알라딘 API 응답 처리 오류: {e}, ISBN: {isbn}")
        return {
            'title': "데이터 처리 오류",
            'author': "정보를 처리할 수 없음",
            'cover_url': "https://placeholder.com/data-processing-error"
        }

async def fetch_book_data(genre):
    
    kdc = GENRE_MAP.get(genre)
    
    
    today = datetime.today()
    one_month_ago = today - timedelta(days=30)
    start_date = one_month_ago.strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    
    params = {
        'authKey': INFO_NARU_KEY,
        'startDt': start_date,
        'endDt': end_date,
        'addCode': '0;2;9',
        'kdc': kdc,
        'pageNo': 1,
        'pageSize': 5,
        'format': 'json'
    }
    
    logger.info(f"{genre} 장르의 도서 데이터 가져오기 시작")
    data, error = safe_request(INFO_NARU_URL, params)
    
    if error or not data:
        logger.error(f"정보나루 API 오류: {error}")
        return False
    
    try:
        items = data.get('response', {}).get('docs', [])
        
        
        result = {
            "response": {
                "docs": []
            }
        }
        
       
        for item in items:
            book = item.get('doc', {})
            isbn = book.get('isbn13') or book.get("isbn10") or book.get('isbn', '')
            
            
            aladin_info = get_aladin_book_info(isbn)
            
           
            book['bookname'] = aladin_info['title']
            book['authors'] = aladin_info['author']
            book['bookImageURL'] = aladin_info['cover_url']
            
            
            result["response"]["docs"].append({"doc": book})
            
            logger.info(f"도서 정보 추가: {book['bookname']} - {book['authors']}")
        
        
        book_cache[genre] = result
        return True
    except Exception as e:
        logger.error(f"데이터 처리 중 예외 발생: {e}")
        return False


 
    
 



@app.get("/bookreco/{genre}")
async def bookreco(genre: str):
   
    logger.info(f"클라이언트 요청: {genre}")

    if genre not in book_cache or not book_cache[genre]:
        logger.info("없는 장르르")
        raise HTTPException(status_code=404, detail=f"{genre} 장르의 책 데이터가 아직 준비되지 않았습니다.")
    

    
    return book_cache[genre]



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)