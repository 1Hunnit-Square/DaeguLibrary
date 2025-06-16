import asyncio
from dglib_chatbot.utils.config import logger

async def voice_detect(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):

    client_addr = writer.get_extra_info('peername')
    logger.info(f"클라이언트 연결됨: {client_addr}")

    data_buffer = bytearray()

    try:
        length_bytes = await reader.readexactly(4)
        if not length_bytes:
            raise ConnectionError("클라이언트가 길이를 보내기 전에 연결을 닫았습니다.")

        message_length = int.from_bytes(length_bytes, 'big')

        data_buffer = await reader.readexactly(message_length)
        if not data_buffer:
            raise ConnectionError("클라이언트가 데이터를 보내기 전에 연결을 닫았습니다.")
        

        received_str = data_buffer.decode('utf-8')
        logger.info(f"✅ 클라이언트로부터 수신한 전체 데이터: {received_str}")

        

        response_message = f"{received_str} 수신됨"

        encoded_message = response_message.encode('utf-8')

        message_length = len(encoded_message).to_bytes(4, 'big')

        writer.write(message_length + encoded_message)


        await writer.drain()
       
    except Exception as e:
        logger.error(f"🔥 데이터 수신 중 오류 발생: {e}")
        writer.close()
        await writer.wait_closed()
        return 
    finally:
        logger.info(f"클라이언트 연결 종료: {client_addr}")
        writer.close()
        await writer.wait_closed()
        logger.info("연결이 종료되었습니다.")
    
    

async def start_tcp_server():
    server = await asyncio.start_server(voice_detect, '0.0.0.0', 3030)

    logger.info("소켓 연결됨 :" + str(server.sockets[0].getsockname()))
    logger.info("TCP 서버가 시작되었습니다. 클라이언트 연결을 기다립니다...")

    async with server:
        await server.serve_forever()