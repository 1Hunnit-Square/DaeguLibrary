import asyncio
import numpy as np
import json
import time
from faster_whisper import WhisperModel 
from dglib_chatbot.utils.config import logger
from dglib_chatbot.utils.clean_text import clean_text
import wave 
import time 
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
        writer.write(len(response_json).to_bytes(4, 'big') + response_json)
        await writer.drain()
        return

    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        gc.collect()

    try:
        segments, info = await asyncio.to_thread(
            ASR_MODEL.transcribe,
            audio_np,
            language="ko",
            vad_filter=True,
            vad_parameters=VAD_PARAMETERS,
            temperature=0.0,
            no_speech_threshold=0.8,
            compression_ratio_threshold=2.2,
            log_prob_threshold=-0.8,
            condition_on_previous_text=False,
            initial_prompt=None,
            repetition_penalty=1.1,
            no_repeat_ngram_size=3,
            suppress_tokens=[-1],
            suppress_blank=True,
            beam_size=1,
            best_of=1,
            patience=1.0,
            length_penalty=0.8,
            without_timestamps=True,
            hallucination_silence_threshold=2.0,
        )
        
        result_text = " ".join([seg.text for seg in segments]).strip()
        
        if hasattr(info, 'language_probability'):
            logger.info(f"[{client_addr}] 언어 감지 확률: {info.language_probability:.3f}")
        
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
                    response = {
                        "type": "chatbot_response",
                        "text": chat_response.get('parts', ''),
                        "request_text": result_text,
                        "service": chat_response.get('service', ''),
                        "to": chat_response.get('to', None),
                        "clientId": chat_response.get('clientId', client_id),
                        "audio_size": len(tts_audio_data),
                        "audio_data": audio_base64  
                    }
                else:
                    logger.info(f"[{client_addr}] TTS 생성 실패. 음성 데이터가 None입니다.")
                    response = {"type": "tts_error", "text": "TTS 생성 실패", "clientId": client_id}
            else: 
                response = {"type": "no_chatbot_response", "text": ""}

        response_json = json.dumps(response, ensure_ascii=False).encode('utf-8')
        writer.write(len(response_json).to_bytes(4, 'big') + response_json)
        await writer.drain()

    except Exception as e:
        logger.error(f"[{client_addr}] 음성 인식/전송 중 오류: {e}", exc_info=True)



async def _receive_client_info(reader: asyncio.StreamReader):
    try:
        length_bytes = await reader.readexactly(4)
        length = int.from_bytes(length_bytes, 'big')
        json_bytes = await reader.readexactly(length)
        json_str = json_bytes.decode('utf-8')
        client_info = json.loads(json_str)
        client_id = client_info.get('clientId', 'unknown')
        mid = client_info.get('mid', 'unknown')
        logger.info(f"클라이언트 정보 수신: clientId={client_id}, mid={mid}")
        return client_id, mid
    except Exception as e:
        logger.error(f"클라이언트 정보 수신 중 오류: {e}")
        return "error", str(e)


async def tcp_service(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    client_addr = writer.get_extra_info('peername')
    logger.info(f"✅ [{client_addr}] TCP 클라이언트 연결됨")

    client_id, mid = await _receive_client_info(reader)
    if client_id == 'error':
        logger.error(f"[{client_addr}] 클라이언트 정보 파싱 실패. 연결 종료. 원인: {mid}")
        writer.close()
        await writer.wait_closed()
        return

    audio_buffer = bytearray()
    temp_buffer = bytearray()
    is_speaking = False
    last_speech_time = time.time()
    max_buffer_size = int(MAX_BUFFER_SECONDS / CHUNK_SECONDS) * CHUNK_BYTES

    async def _send_status(speaking: bool):
        try:
            status_response = {"type": "speaking_status", "is_speaking": speaking, "clientId": client_id}
            response_json = json.dumps(status_response, ensure_ascii=False).encode('utf-8')
            writer.write(len(response_json).to_bytes(4, 'big') + response_json)
            await writer.drain()
            logger.info(f"[{client_addr}] 상태 전송: is_speaking={speaking}")
        except Exception as e:
            logger.error(f"[{client_addr}] 상태 전송 중 오류: {e}")

    try:
        while True:
            data = await reader.read(CHUNK_BYTES)
            if not data:
                logger.info(f"[{client_addr}] 클라이언트 연결 종료. 남은 오디오 처리.")
                if audio_buffer:
                    if is_speaking:
                        await _send_status(False) 
                    await _transcribe_and_send(writer, audio_buffer, client_id, mid)
                break
            
            temp_buffer.extend(data)
            
            while len(temp_buffer) >= CHUNK_BYTES:
                chunk = temp_buffer[:CHUNK_BYTES]
                del temp_buffer[:CHUNK_BYTES]
                
                audio_chunk_np = np.frombuffer(chunk, dtype=np.int16)
                volume = np.sqrt(np.mean(audio_chunk_np.astype(np.float64)**2))

                if volume > VOLUME_THRESHOLD:
                    if not is_speaking:
                        logger.info(f"[{client_addr}] 말하기 시작 (볼륨: {volume:.2f})")
                        is_speaking = True
                        await _send_status(True) 
                    audio_buffer.extend(chunk)
                    last_speech_time = time.time()
                elif is_speaking:
                    audio_buffer.extend(chunk)
                    if time.time() - last_speech_time > SILENCE_SECONDS:
                        logger.info(f"[{client_addr}] 정적 감지. 발화 종료.")
                        is_speaking = False
                        await _send_status(False)
                        buffer_to_process = audio_buffer[:]
                        audio_buffer.clear()
                        await _transcribe_and_send(writer, buffer_to_process, client_id, mid)
                
                if len(audio_buffer) > max_buffer_size:
                    logger.warning(f"[{client_addr}] 최대 버퍼 크기 도달. 강제 인식 수행.")
                    if is_speaking:
                        is_speaking = False
                        await _send_status(False)
                    await _transcribe_and_send(writer, audio_buffer, client_id, mid)
                    audio_buffer.clear()

    except Exception as e:
        logger.error(f"[{client_addr}] tcp_service 처리 중 오류 발생: {e}", exc_info=True)
    finally:
        logger.info(f"❌ TCP 클라이언트 연결 종료: {client_addr}")
        writer.close()
        await writer.wait_closed()


async def start_tcp_server():
    server = await asyncio.start_server(tcp_service, '0.0.0.0', 3030)

    addr = server.sockets[0].getsockname()
    logger.info(f"✅ TCP 서버가 {addr} 에서 리스닝을 시작했습니다. (프로토콜: 원래 방식)")
    
    
    return server, asyncio.create_task(server.serve_forever())