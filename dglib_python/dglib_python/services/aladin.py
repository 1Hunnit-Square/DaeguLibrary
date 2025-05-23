from dglib_python.config import logger, ALADIN_API_URL, ALADIN_KEY, ALADIN_API_SEARCH_URL
from dglib_python.utils.http import safe_request
import httpx
import html

async def get_aladin_book_info(isbn: str) -> dict:

    params = {
        'ttbkey': ALADIN_KEY,
        'itemIdType': 'ISBN',
        'ItemId': isbn,
        'output': 'js',
        'Version': '20131101'
    }

    data, error = await safe_request(ALADIN_API_URL, params)

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
            'title': html.unescape(book_item.get('title', '')),
            'author': html.unescape(book_item.get('author', '')),
            'cover_url': book_item.get('cover', '').replace('coversum/', 'cover500/'),
            'description': html.unescape(book_item.get('description', '')),
            'publisher': html.unescape(book_item.get('publisher', '')),
            'pubDate': book_item.get('pubDate', ''),


        }
    except (KeyError, IndexError) as e:
        logger.error(f"알라딘 API 응답 처리 오류: {e}, ISBN: {isbn}")
        return {
            'title': "데이터 처리 오류",
            'author': "정보를 처리할 수 없음",
            'cover_url': "https://placeholder.com/data-processing-error"
        }


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
            response = await client.get(ALADIN_API_SEARCH_URL, params=params, timeout=10.0)
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
            'start': page,
            'output': 'js',
            'Version': '20131101'
        }

        try:
            response = await client.get(ALADIN_API_SEARCH_URL, params=params, timeout=10.0)
            response.raise_for_status()

            data = response.json()

            books = data.get('item', [])
            for book in books:
                cover_url = book.get('cover')
                book['cover'] = cover_url.replace('coversum/', 'cover500/')
                book['description'] = html.unescape(book.get('description', ''))
                book['author'] = html.unescape(book.get('author', ''))
                book['title'] = html.unescape(book.get('title', ''))
                book['publisher'] = html.unescape(book.get('publisher', ''))






            return books
        except Exception as e:
            logger.error(f"API 요청 오류: {str(e)}")
            return []