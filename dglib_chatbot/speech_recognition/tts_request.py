import asyncio
import json
import tempfile
import os
from dglib_chatbot.utils.config import logger
from dglib_chatbot.utils.client import get_client

async def tts_post_async(text: str):
    """비동기 TTS 요청 및 오디오 파일 저장"""
    url = "http://127.0.0.1:9880/tts"
    
    payload = {
        "text": text,
        "text_lang": "ko", 
        "ref_audio_path": r"C:\Users\개발자\Desktop\gpt-sovits request\reference.wav",  
        "prompt_lang": "ko",
        "prompt_text": "시작하겠습니다. 네, 일단 첫 번째 질문, 오늘의 TMI인데요. 오늘의 TMI, 제가 올해",
        "top_k": 15,
        "top_p": 1.0,
        "temperature": 1.0,
        "text_split_method": "cut5",
        "batch_size": 1,
        "batch_threshold": 0.75,
        "split_bucket": True,
        "speed_factor": 1.0,
        "fragment_interval": 0.3,
        "seed": -1,       
        "media_type": "wav",
        "streaming_mode": False,
        "parallel_infer": False,
        "repetition_penalty": 1.35,
        "sample_steps": 8,
        "super_sampling": False
    }
    
    try:
        client = get_client()
        response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            logger.info("TTS 생성 성공!")
            
            output_file = "output_tts.wav"
            with open(output_file, "wb") as f:
                f.write(response.content)
            return response.content
            
           
            
        else:
            logger.error(f"TTS 요청 실패! 상태 코드: {response.status_code}")
            return b''
            
            
    except Exception as e:
        logger.error(f"TTS 요청 중 오류: {e}")
        return b''
        