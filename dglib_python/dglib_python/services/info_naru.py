
from datetime import datetime, timedelta
from dglib_python.config import logger, INFO_NARU_URL, INFO_NARU_KEY, GENRE_MAP, INFO_NARU_RECO
from dglib_python.utils.http import safe_request
from dglib_python.services.aladin import get_aladin_book_info
import asyncio

async def fetch_popular_books(genre: str):
    kdc = GENRE_MAP.get(genre)
    if not kdc:
        logger.error(f"알 수 없는 장르: {genre}")
        return False, {}

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
        'pageSize': 20,
        'format': 'json'
    }

    logger.info(f"{genre} 장르의 도서 데이터 가져오기 시작")
    data, error = await safe_request(INFO_NARU_URL, params)  # await 추가

    if error or not data:
        logger.error(f"정보나루 API 오류: {error}")
        return False, {}

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

            aladin_info = await get_aladin_book_info(isbn)  # get_aladin_book_info도 async로 변경 필요
            if aladin_info is None:
                logger.error(f"알라딘 정보 없음: ISBN {isbn}")
                continue

            book['bookname'] = aladin_info['title']
            book['authors'] = aladin_info['author']
            book['bookImageURL'] = aladin_info['cover_url']
            book['description'] = aladin_info['description']
            book['publisher'] = aladin_info['publisher']
            book['publication_year'] = aladin_info['pubDate']


            result["response"]["docs"].append({"doc": book})
            logger.info(f"도서 정보 추가: {book['bookname']} - {book['authors']}")

        return True, result
    except Exception as e:
        logger.error(f"데이터 처리 중 예외 발생: {e}")
        return False, {}

async def get_member_reco_books(isbn_list: list[str], gender: int = 0, age: int = 30):

    
    combined_isbn = ';'.join(isbn_list)
    logger.info(f"요청할 ISBN 목록: {combined_isbn}")

    params = {
    'authKey': INFO_NARU_KEY,
    'isbn13': combined_isbn,
    'type': 'mania',
    'format': 'json',
    'pageNo': 1,
    'pageSize': 20,
    'gender': gender,
    'age': age,
    }

    data, error = await safe_request(INFO_NARU_RECO, params)

    if error or not data:
        logger.error(f"정보나루 API 오류: {error}")
        return {
            "success": False,
            "error": error or "데이터를 받아오지 못했습니다",
            "message": "정보나루 API 요청 실패"
        }
    try:
        items = data.get('response', {}).get('docs', [])
        result = {

                "docs": []
            }

        logger.info(items)


        
        for item in items:
            book = item.get('book', {})
            isbn = book.get('isbn13') or book.get("isbn10") or book.get('isbn', '')

            aladin_info = await get_aladin_book_info(isbn)
            if aladin_info is None:
                logger.error(f"알라딘 정보 없음: ISBN {isbn}")
                continue

            book['bookname'] = aladin_info.get('title')
            book['authors'] = aladin_info.get('author')
            book['bookImageURL'] = aladin_info.get('cover_url')
            book['description'] = aladin_info.get('description')
            book['publisher'] = aladin_info.get('publisher')
            book['publication_year'] = aladin_info.get('pubDate')


            result["docs"].append({"book": book})
            logger.info(f"도서 정보 수정: {book['bookname']} - {book['authors']}")

        return result
    except Exception as e:
        logger.error(f"데이터 처리 중 예외 발생: {e}")
        return {"success": False, "error": str(e)}





