import logging
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from cachetools import TTLCache

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


ALADIN_API_URL = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx'
ALADIN_KEY = 'ttbsk35021617001'

async def get_total_results_count(query):
    
    async with httpx.AsyncClient() as client:
        params = {
            'ttbkey': ALADIN_KEY,
            'Query': query,
            'QueryType': 'Keyword',
            'SearchTarget': 'Book',
            'MaxResults': 1, 
            'start': 1,
            'output': 'js',
            'Version': '20131101'
        }
        
        try:
            response = await client.get('https://www.aladin.co.kr/ttb/api/ItemSearch.aspx', params=params, timeout=10.0)
            response.raise_for_status()
            
            data = response.json()
            total_results = data.get('totalResults', 0)
            
            return total_results
        except Exception as e:
            logger.error(f"총 결과 수 조회 중 오류: {str(e)}")
            return 0

async def get_books_by_page(query, page=1, items_per_page=10):
    start = ((page - 1) * items_per_page) + 1
    
    async with httpx.AsyncClient() as client:
        logger.info(f"검색 페이지 요청: {query} - 페이지 {page}")
        
        params = {
            'ttbkey': ALADIN_KEY,
            'Query': query,
            'QueryType': 'Keyword',
            'SearchTarget': 'Book',
            'MaxResults': items_per_page,
            'start': start,
            'output': 'js',
            'Version': '20131101'
        }
        
        try:
            response = await client.get('https://www.aladin.co.kr/ttb/api/ItemSearch.aspx', params=params, timeout=10.0)
            response.raise_for_status()
            
            data = response.json()
            books = data.get('item', [])
            
         
            
            return books
        except Exception as e:
            logger.error(f"API 요청 오류: {str(e)}")
            return []

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("서버 시작")
    yield
    logger.info("서버 종료")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search/{search_term}")
async def book_search(
    search_term: str,
    page: int = Query(default=1, ge=1),
    items_per_page: int = Query(default=10, ge=10, le=100)
):
   
    logger.info(f"클라이언트 요청: '{search_term}' (페이지: {page}, 페이지당: {items_per_page})")
    
    try:
       
        total_results = await get_total_results_count(search_term)
        books = await get_books_by_page(search_term, page, items_per_page)
        total_pages = (total_results + items_per_page - 1) // items_per_page
        
        return {
            "query": search_term,
            "page": page,
            "items_per_page": items_per_page,
            "total_items": total_results,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
            "items": books
        }
    except Exception as e:
        logger.error(f"검색 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"검색 처리 중 오류가 발생했습니다: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)