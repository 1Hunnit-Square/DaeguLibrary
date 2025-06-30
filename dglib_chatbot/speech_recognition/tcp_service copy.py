import asyncio
import numpy as np
import json
import time
from faster_whisper import WhisperModel 
from dglib_chatbot.utils.config import logger
from dglib_chatbot.utils.clean_text import clean_text
import wave 
from speech_recognition.tts_request import tts_post_async
from dglib_chatbot.services.chatbot_preprocessing import chatbot_preprocessing, ChatRequest
import base64
import torch
import gc

# --- 설정 값 ---
SAMPLE_RATE = 16000
CHUNK_SECONDS = 1.0
CHUNK_BYTES = int(SAMPLE_RATE * CHUNK_SECONDS * 2)
SILENCE_SECONDS = 2
VOLUME_THRESHOLD = int(0.007 * 32768)
MAX_BUFFER_SECONDS = 30

logger.info("Whisper 모델 로딩 중... (large-v3, cuda, float16)")
ASR_MODEL = WhisperModel("large-v3", device="cuda", compute_type="float16")
logger.info("✅ Whisper 모델 (CUDA) 로딩 완료.")

VAD_PARAMETERS = {
    "threshold": 0.3,        
    "min_speech_duration_ms": 100,   
    "max_speech_duration_s": 30,     
    "min_silence_duration_ms": 500,  
    "speech_pad_ms": 50,            
}

# --- 음성 인식 및 응답 전송 함수 ---
async def _transcribe_and_send(writer: asyncio.StreamWriter, audio_buffer: bytearray, client_id: str, mid: str = None):
    client_addr = writer.get_extra_info('peername')
    if not audio_buffer:
        logger.info(f"[{client_addr}] 처리할 오디오 없음. 전송 생략.")
        return

    logger.info(f"[{client_addr}] 음성 인식 시작... (오디오 길이: {len(audio_buffer)} bytes)")
    audio_np = np.frombuffer(audio_buffer, dtype=np.int16).astype(np.float32) / 32768.0

    audio_rms = np.sqrt(np.mean(audio_np**2))
    MIN_AUDIO_RMS = 0.001
    if audio_rms < MIN_AUDIO_RMS:
        logger.info(f"[{client_addr}] 오디오 신호가 너무 약함 (RMS: {audio_rms:.6f}). 인식 건너뜀.")
        response = {"type": "no_speech_detected", "text": ""}
        response_json = json.dumps(response, ensure_ascii=False).encode('utf-8')
        # 응답 프로토콜: [길이(4)] + [JSON]
        writer.write(len(response_json).to_bytes(4, 'big'))
        writer.write(response_json)
        await writer.drain()
        return

    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        gc.collect()

    try:
        segments, info = ASR_MODEL.transcribe(audio_np, language="ko", vad_filter=True, vad_parameters=VAD_PARAMETERS)
        result_text = " ".join([seg.text for seg in segments]).strip()
        
        if not result_text:
            response = {"type": "no_speech_detected", "text": ""}
        else:
            chat_response = await chatbot_preprocessing(ChatRequest(parts=result_text, clientId=client_id, mid=mid))
            chat_response_clean = clean_text(chat_response['parts'])
            logger.info(f"[{client_addr}] 챗봇 응답: {chat_response_clean}")
            if chat_response_clean:
                tts_audio_data = await tts_post_async(chat_response_clean)
                if tts_audio_data is not None:
                    audio_base64 = base64.b64encode(tts_audio_data).decode('utf-8')
                    response = { "type": "chatbot_response", "text": chat_response.get('parts', ''), "request_text": result_text, "audio_data": audio_base64 }
                else:
                    response = {"type": "tts_error", "text": "TTS 생성 실패"}
            else: # 챗봇 응답이 비어있는 경우
                response = {"type": "no_chatbot_response", "text": ""}

        response_json = json.dumps(response, ensure_ascii=False).encode('utf-8')
        writer.write(len(response_json).to_bytes(4, 'big'))
        writer.write(response_json)
        await writer.drain()

    except Exception as e:
        logger.error(f"[{client_addr}] 음성 인식/전송 중 오류: {e}", exc_info=True)


# --- 메인 TCP 서비스 로직 ---
async def tcp_service(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    client_addr = writer.get_extra_info('peername')
    logger.info(f"✅ [{client_addr}] TCP 클라이언트 연결됨")

    client_id = None
    mid = None
    is_client_info_received = False
    audio_buffer = bytearray()
    last_speech_time = time.time()
    is_speaking = False
    max_buffer_size = int(MAX_BUFFER_SECONDS * SAMPLE_RATE * 2)
    
    # ... (_send_status 함수는 여기에 위치해도 됨) ...

    try:
        while True:
            # 1. 메시지 타입(1바이트)을 먼저 읽습니다.
            message_type_byte = await reader.readexactly(1)
            message_type = int.from_bytes(message_type_byte, 'big')
            logger.debug(f"[{client_addr}] 메시지 타입 수신: {message_type}")

            if message_type == 1: # 클라이언트 정보
                length_bytes = await reader.readexactly(4)
                length = int.from_bytes(length_bytes, 'big')
                if length > 0:
                    json_bytes = await reader.readexactly(length)
                    client_info = json.loads(json_bytes.decode('utf-8'))
                    client_id = client_info.get('clientId')
                    mid = client_info.get('mid')
                is_client_info_received = True
                logger.info(f"[{client_addr}] 클라이언트 정보 처리 완료: clientId=[{client_id}], mid=[{mid}]")

            elif message_type == 2: # 오디오 청크
                if not is_client_info_received:
                    logger.warning(f"[{client_addr}] 클라이언트 정보 없이 오디오 데이터 수신. 무시.")
                    continue
                
                # 타입 뒤에 바로 데이터가 오므로 넉넉하게 읽습니다.
                data = await reader.read(8192)
                if not data:
                    break
                
                # (이하 오디오 처리 로직)
                audio_buffer.extend(data)
                # ... (VAD 등 로직) ...
                if len(audio_buffer) > (SAMPLE_RATE * 2 * 5): # 5초 이상이면 일단 처리
                    await _transcribe_and_send(writer, audio_buffer, client_id, mid)
                    audio_buffer.clear()

            else:
                logger.warning(f"[{client_addr}] 알 수 없는 메시지 타입 수신: {message_type}")

    except asyncio.IncompleteReadError:
        logger.warning(f"[{client_addr}] 클라이언트가 연결을 비정상적으로 종료.")
    except Exception as e:
        logger.error(f"[{client_addr}] 처리 중 오류 발생: {e}", exc_info=True)
    finally:
        if audio_buffer:
            logger.info(f"[{client_addr}] 연결 종료. 남은 오디오 처리.")
            await _transcribe_and_send(writer, audio_buffer, client_id, mid)
        
        logger.info(f"❌ [{client_addr}] 연결 처리 종료.")
        writer.close()
        await writer.wait_closed()


# --- main.py에서 호출될 서버 시작 함수 ---
async def start_tcp_server():
    # 포트는 ngrok이 포워딩해주는 3030이 맞습니다.
    server = await asyncio.start_server(tcp_service, '0.0.0.0', 3030)

    addr = server.sockets[0].getsockname()
    logger.info(f"✅ TCP 서버가 {addr} 에서 리스닝을 시작했습니다. (프로토콜: 타입 헤더 방식)")

    try:
        # 이 태스크는 lifespan의 cancel() 호출에 의해 종료될 수 있습니다.
        await server.wait_closed()
    except asyncio.CancelledError:
        logger.info("start_tcp_server 태스크가 취소되었습니다.")
    finally:
        if server.is_serving():
             server.close()
        logger.info("TCP 서버 리스닝이 종료되었습니다.")