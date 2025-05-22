from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dglib_python.config import logger, ALADIN_KEY, ALADIN_API_SEARCH_URL
import httpx
from dglib_python.models.book import book_cache
from dglib_python.schedulers.book_updater import start_scheduler, stop_scheduler, run_update_with_retry
from dglib_python.services.aladin import get_total_results_count, get_books_by_page

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("서버 시작")
    await run_update_with_retry()
    start_scheduler()

    logger.info("도서 데이터 로드 완료")

    yield
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

    if "response" in data and "docs" in data["response"]:
        data = {
            "response": {
                "docs": data["response"]["docs"][:5]
            }
        }

    return data

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

    return {
        "genre": genre,
        "page": page,
        "size": size,
        "total_items": total_books,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
        "items": paged_books
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
            "page": page,
            "size": size,
            "total_items": total_results,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
            "items": books
        }
    except Exception as e:
        logger.error(f"검색 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"검색 처리 중 오류가 발생했습니다: {str(e)}")

def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
     main()