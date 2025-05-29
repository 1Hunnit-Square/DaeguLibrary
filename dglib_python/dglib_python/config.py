import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# 정보나루 API 설정
INFO_NARU_URL = 'http://data4library.kr/api/loanItemSrch'
INFO_NARU_RECO = 'http://data4library.kr/api/recommandList'
INFO_NARU_KEY = 'c1888c7a4825d9bd126707b7edf5314571ec8da864cd982b5eac20238ea88a5a'

# 알라딘 API 설정
ALADIN_API_URL = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx'
ALADIN_KEY = 'ttbsk35021617001'
ALADIN_API_SEARCH_URL = 'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx'

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