import json
import time
import requests
import asyncio
import httpx
from dglib_python.config import logger, MAX_RETRIES, RETRY_DELAY

# def safe_request(url, params, max_retries=MAX_RETRIES, delay=RETRY_DELAY):
   

#     for attempt in range(max_retries):
#         try:
#             response = requests.get(url, params=params, timeout=10)
#             response.raise_for_status()  
            
#             return response.json(), None
#         except requests.HTTPError as e:
#             logger.warning(f"API 응답 상태 코드 오류: {e}, URL: {url}")
#         except json.JSONDecodeError as e:
#             logger.error(f"JSON 디코딩 오류: {e}, 응답 내용: {response.text[:200]}")
#         except requests.RequestException as e:
#             logger.error(f"요청 오류 발생: {e}, URL: {url}")
        
        
#         if attempt < max_retries - 1:
#             time.sleep(delay)
#             continue
    
#     return None, "API 요청 실패"

async def safe_request(url, params, max_retries=MAX_RETRIES, delay=RETRY_DELAY):
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            try:
                response = await client.get(url, params=params, timeout=10)
                response.raise_for_status()
                return response.json(), None
            except httpx.HTTPStatusError as e:
                logger.warning(f"API 응답 상태 코드 오류: {e}, URL: {url}")
            except json.JSONDecodeError as e:
                logger.error(f"JSON 디코딩 오류: {e}, 응답 내용: {response.text[:200]}")
            except httpx.RequestError as e:
                logger.error(f"요청 오류 발생: {e}, URL: {url}")
            
            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
                continue
                
        return None, "API 요청 실패"