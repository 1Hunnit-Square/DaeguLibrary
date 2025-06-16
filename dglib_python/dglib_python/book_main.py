from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dglib_python.config import logger, ALADIN_KEY, ALADIN_API_SEARCH_URL
from typing import List
from dglib_python.models.book import book_cache
from dglib_python.schedulers.book_updater import start_scheduler, stop_scheduler, run_update_with_retry
from dglib_python.services.aladin import get_total_results_count, get_books_by_page, get_aladin_keyword_by_isbn
from dglib_python.services.info_naru import get_member_reco_books
from pydantic import BaseModel
import httpx
from dglib_python.utils.client import set_client



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("서버 시작")
    client = httpx.AsyncClient(timeout=10.0)
    set_client(client)
    
    
    
    await run_update_with_retry()
    start_scheduler()

    logger.info("도서 데이터 로드 완료")

    yield
    
    await client.aclose()
    stop_scheduler()
    logger.info("서버 종료")

app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/bookreco/{genre}")
async def bookreco(genre: str):
    logger.info(f"클라이언트 요청: {genre}")

    data = book_cache.get_genre_data(genre)
    if not data:
        raise HTTPException(status_code=404, detail=f"{genre} 장르의 책 데이터가 아직 준비되지 않았습니다.")

    all_books = data.get("response", {}).get("docs", [])
    flattened_books = [item.get("doc", item) for item in all_books[:5]]

    return {
        "genre": genre,
        "content": flattened_books
    }

@app.get("/bookrecolist/{genre}")
async def bookrecolist(genre: str, page: int = Query(default=1, ge=1), size: int = Query(default=10, ge=10, le=100)):
    logger.info(f"클라이언트 요청: {genre} (페이지: {page}, 페이지당: {size})")

    data = book_cache.get_genre_data(genre)
    if not data:
        raise HTTPException(status_code=404, detail=f"{genre} 장르의 책 데이터가 아직 준비되지 않았습니다.")


    all_books = data.get("response", {}).get("docs", [])
    total_books = len(all_books)

    total_pages = (total_books + size - 1) // size
    start_idx = (page - 1) * size
    end_idx = min(start_idx + size, total_books)

    paged_books = all_books[start_idx:end_idx]
    flattened_books = [item.get("doc", item) for item in paged_books]

    return {
        "genre": genre,
        "pageable": {"pageNumber" : page - 1},
        "size": size,
        "totalElements": total_books,
        "totalPages": total_pages,
        "hasNext": page < total_pages,
        "hasPrev": page > 1,
        "content": flattened_books
    }





@app.get("/search/{search_term}")
async def book_search(
    search_term: str,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=10, le=100)
):

    logger.info(f"클라이언트 요청: '{search_term}' (페이지: {page}, 페이지당: {size})")

    try:

        total_results = await get_total_results_count(search_term)
        books = await get_books_by_page(search_term, page, size)
        total_pages = (total_results + size - 1) // size

        return {
            "query": search_term,
            "pageable": {"pageNumber" : page - 1},
            "size": size,
            "totalElements": total_results,
            "totalPages": total_pages,
            "hasNext": page < total_pages,
            "hasPrev": page > 1,
            "content": books
        }
    except Exception as e:
        logger.error(f"검색 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"검색 처리 중 오류가 발생했습니다: {str(e)}")


@app.post("/wordcloud")
async def wordcloud(isbn: List[str]):
    word_cloud = None
    if isbn:
        word_cloud = await get_aladin_keyword_by_isbn(isbn)
    logger.info(word_cloud)
    return {"data": word_cloud}


class MemberRecoBookDTO(BaseModel):
    isbns: List[str]
    gender: int
    age: int


@app.post("/memberrecobook")
async def member_reco_book(dto: MemberRecoBookDTO):
    logger.info(f"클라이언트 요청: {dto}")
    reco_book_list = await get_member_reco_books(dto.isbns, dto.gender, dto.age)
    logger.info(f"추천 도서 목록: {reco_book_list}")

    return reco_book_list

@app.get("/")
async def root():
    return {"message": "App is running"}

def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
     main()