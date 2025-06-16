from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.base import JobLookupError
from dglib_python.config import logger, GENRE_MAP
import pytz
from dglib_python.services.book_service import update_selected_book_data, update_failed_genres

scheduler = AsyncIOScheduler(
    timezone=pytz.timezone('Asia/Seoul'),
    job_defaults={
        'misfire_grace_time': 60,
        'coalesce': True
    }
)

async def daily_full_update():
    logger.info("=== 일일 전체 업데이트 시작 ===")
    if await update_selected_book_data(list(GENRE_MAP.keys())):
        logger.info("일일 전체 업데이트 완료")
    else:
        logger.warning("일일 업데이트 중 일부 실패")
        await schedule_retry()


async def run_update_with_retry():

    try:
        if await update_failed_genres() if scheduler.get_jobs() else await update_selected_book_data(list(GENRE_MAP.keys())):
            logger.info("모든 장르 업데이트 성공 완료.")
        else:
            logger.warning("일부 장르 업데이트 실패. 5분 후 재시도 예약.")
            await schedule_retry()

    except Exception as e:
        logger.error(f"업데이트 작업 실패: {e}. 5분 후 재시도 예약.")
        await schedule_retry()

async def schedule_retry():
    kr_tz = pytz.timezone('Asia/Seoul')
    retry_time = datetime.now(kr_tz) + timedelta(minutes=5)
    job_id = f"retry_update_{retry_time.timestamp()}"

    try:

        try:
            scheduler.remove_job(job_id)
        except JobLookupError:
            pass

        scheduler.add_job(
            run_update_with_retry,
            'date',
            run_date=retry_time,
            id=job_id,
            name=f"도서 업데이트 재시도 ({retry_time.strftime('%H:%M:%S')})",
            replace_existing=True
        )
        logger.info(f"{retry_time.strftime('%Y-%m-%d %H:%M:%S')}에 재시도 작업 예약 완료")
    except Exception as e:
        logger.error(f"재시도 작업 예약 실패: {e}")

def start_scheduler():

    scheduler.add_job(daily_full_update, 'cron', hour=0, minute=0)
    scheduler.start()
    logger.info("스케줄러 시작됨")

def stop_scheduler():

    scheduler.shutdown()
    logger.info("스케줄러 종료됨")