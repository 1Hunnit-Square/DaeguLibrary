import asyncio
from dglib_python.config import logger
from dglib_python.models.book import book_cache
from dglib_python.services.info_naru import fetch_popular_books

async def update_selected_book_data(genres_to_update: list[str]) -> bool:
   
    logger.info(f"선택된 장르 도서 데이터 업데이트 시작: {genres_to_update}")
    
    tasks = []
    for genre in genres_to_update:
        tasks.append(fetch_popular_books(genre))
    
    results = await asyncio.gather(*tasks)
    
    new_failed_genres = []
    
    for genre, result in zip(genres_to_update, results):
        if isinstance(result, Exception):
            new_failed_genres.append(genre)
            logger.error(f"{genre} 장르 데이터 처리 중 예외 발생: {result}")
        elif not result[0]:  
            new_failed_genres.append(genre)
            logger.error(f"{genre} 장르 데이터 가져오기 실패")
        else:
            logger.info(f"{genre} 장르 데이터 성공적으로 업데이트")
            book_cache.update_genre(genre, result[1]) 
    
   
    for genre in new_failed_genres:
        book_cache.mark_genre_failed(genre)
    
    book_cache.set_update_time()
    
    if new_failed_genres:
        logger.warning(f"일부 장르 업데이트 실패 ({', '.join(new_failed_genres)}), 나머지는 성공적으로 캐시됨")
        return False
    else:
        logger.info(f"선택된 모든 도서 데이터 업데이트 성공 완료")
        return True

async def update_failed_genres() -> bool:
  
    failed_genres = book_cache.get_failed_genres()
    if not failed_genres:
        logger.info("실패한 장르가 없습니다.")
        return True
    
    logger.info(f"실패 장르 재시도: {failed_genres}")
    return await update_selected_book_data(failed_genres)
