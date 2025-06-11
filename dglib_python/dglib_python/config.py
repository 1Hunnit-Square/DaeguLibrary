import logging
import os

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# 정보나루 API 설정
INFO_NARU_URL = 'http://data4library.kr/api/loanItemSrch'
INFO_NARU_RECO = 'http://data4library.kr/api/recommandList'

INFO_NARU_KEY = os.environ.get("INFO_NARU_KEY", "Not Found")


# 알라딘 API 설정
ALADIN_API_URL = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx'

ALADIN_API_SEARCH_URL = 'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx'
ALADIN_KEY = os.environ.get("ALADIN_KEY", "Not Found")

# HTTP 요청 설정
MAX_RETRIES = 3
RETRY_DELAY = 2

# 장르 매핑
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