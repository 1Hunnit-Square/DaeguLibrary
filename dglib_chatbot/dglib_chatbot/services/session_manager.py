import time
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = logging.getLogger(__name__)


chat_sessions = {}

scheduler = AsyncIOScheduler()

async def cleanup_inactive_sessions():
    current_time = time.time()
    inactive_threshold = 3600

    sessions_to_remove = []
    for client_id, session_data in chat_sessions.items():
        last_activity = session_data.get("last_activity", 0)
        if current_time - last_activity > inactive_threshold:
            sessions_to_remove.append(client_id)

    for client_id in sessions_to_remove:
        if client_id in chat_sessions:
            del chat_sessions[client_id]
            logger.info(f"비활성 세션 삭제: {client_id}")

def update_session_activity(client_id):
    if client_id in chat_sessions:
        chat_sessions[client_id]["last_activity"] = time.time()


def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(cleanup_inactive_sessions, 'interval', minutes=10)
        scheduler.start()
        logger.info("세션 정리 스케줄러가 시작되었습니다.")