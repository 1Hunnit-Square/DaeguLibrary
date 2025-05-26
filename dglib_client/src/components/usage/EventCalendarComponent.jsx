import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import koLocale from '@fullcalendar/core/locales/ko';
import Button from '../common/Button';
import SelectComponent from '../common/SelectComponent';
import Loading from '../../routers/Loading';
import { useQuery } from '@tanstack/react-query';
import { getClosedDays, registerAutoAllEvents } from '../../api/closedDayApi';

const EventCalendarComponent = ({
  renderExtraCellContent = () => null,
  onMonthChange = () => { }
}) => {
  const calendarRef = useRef(null);
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const autoRegisteredYears = useRef(new Set());

  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['closedDays', selectedYear, selectedMonth],
    queryFn: () => getClosedDays(selectedYear, selectedMonth),
    enabled: !!selectedYear && !!selectedMonth
  });

  const handleGoToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      const today = new Date();
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth() + 1);
    }
  };

  const handleYearChange = async (yearLabel) => {
    const newYear = parseInt(yearLabel.replace('년', ''), 10);
    setSelectedYear(newYear);

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const newDate = new Date(newYear, calendarApi.getDate().getMonth(), 1);
      calendarApi.gotoDate(newDate);
    }

    if (!autoRegisteredYears.current.has(newYear)) {
      try {
        await registerAutoAllEvents(newYear);
        autoRegisteredYears.current.add(newYear);
        refetch();
      } catch (error) {
        console.warn('자동 등록 실패', error);
      }
    }
  };

  const handleDatesSet = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    const currentDate = calendarApi.getDate();
    const newYear = currentDate.getFullYear();
    const newMonth = currentDate.getMonth() + 1;

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    onMonthChange(newYear, newMonth);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-lg shadow mt-12">
      <div className="mb-4 flex justify-end items-center gap-2">
        <SelectComponent
          options={Array.from({ length: 10 }, (_, i) => `${now.getFullYear() - 5 + i}년`)}
          value={`${selectedYear}년`}
          onChange={handleYearChange}
          selectClassName="w-28 text-sm"
          dropdownClassName="w-28"
        />
        <Button onClick={handleGoToday}>오늘</Button>
      </div>

      {isLoading && <Loading />}
      {isError && <div className="text-center text-sm text-red-500">일정 불러오기 오류</div>}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale={koLocale}
        contentHeight="auto"
        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        buttonText={{ today: '오늘' }}
        titleFormat={{ year: 'numeric', month: 'long' }}
        datesSet={handleDatesSet}
        events={events.map(e => ({
          title: e.reason,
          date: e.closedDate,
          color: e.isClosed ? '#a52a2a' : '#00893B'
        }))}

        // 요일 헤더 스타일
        dayHeaderContent={({ date, text }) => {
          const day = date.getDay();
          let color = 'text-gray-600';
          if (day === 0) color = 'text-red-500';
          if (day === 6) color = 'text-blue-500';
          return <div className={`py-2 text-sm font-semibold ${color}`}>{text}</div>;
        }}

        // 셀 높이 + 테두리 스타일
        dayCellClassNames={() => 'h-32 align-top p-2 border border-gray-200 text-sm'}

        // 날짜 셀 커스터마이징 (날짜 + 추가 콘텐츠)
        dayCellContent={({ date }) => {
          const day = date.getDay();
          const dateStr = date.toISOString().slice(0, 10);
          const dateNum = date.getDate();
          const color = day === 0 ? 'text-red-500' : day === 6 ? 'text-blue-500' : 'text-gray-800';

          return (
            <div className="relative h-full w-full flex flex-col items-start justify-start">
              {/* 날짜 숫자: 오른쪽 상단 고정 */}
              <div
                className={`absolute top-1 right-1 text-[13px] font-semibold ${color}`}
                style={{ zIndex: 50, pointerEvents: 'none' }}
              >
                {dateNum}
              </div>

              {/* 나머지 셀 콘텐츠 */}
              <div className='w-full h-full mt-6 relative z-0'>
                {renderExtraCellContent(date)}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default EventCalendarComponent;