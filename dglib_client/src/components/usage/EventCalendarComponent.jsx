import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import koLocale from '@fullcalendar/core/locales/ko';
import Button from '../common/Button';
import SelectComponent from '../common/SelectComponent';
import { useQuery } from '@tanstack/react-query';
import { getClosedDays, registerAutoAllEvents } from '../../api/closedDayApi';

const EventCalendarComponent = () => {
  const calendarRef = useRef(null);
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const autoRegisteredYears = useRef(new Set());

  // 일정 데이터 가져오기
  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['closedDays', selectedYear, selectedMonth],
    queryFn: () => getClosedDays(selectedYear, selectedMonth),
    enabled: !!selectedYear && !!selectedMonth
  });

  // 오늘 날짜로 이동
  const handleGoToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      const today = new Date();
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth() + 1);
    }
  };

  // 연도 변경 시 자동 등록 후 날짜 이동
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
        refetch(); // 자동 등록 후 다시 불러오기
      } catch (error) {
        console.warn('자동 등록 실패', error);
      }
    }
  };

  // 월 변경 감지
  const handleDatesSet = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    const currentDate = calendarApi.getDate();
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth() + 1);
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

      {isLoading && <div className="text-center text-sm">일정 불러오는 중...</div>}
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
        dayHeaderContent={({ date, text }) => {
          const day = date.getDay();
          let color = 'text-gray-600';
          if (day === 0) color = 'text-red-500';
          if (day === 6) color = 'text-blue-500';
          return <div className={`py-2 text-sm font-semibold ${color}`}>{text}</div>;
        }}
        dayCellClassNames={() => 'h-32 align-top p-2 border border-gray-200 text-sm'}
        dayCellContent={({ date }) => {
          const day = date.getDay();
          const dateNum = date.getDate();
          let color = 'text-gray-800';
          if (day === 0) color = 'text-red-500';
          if (day === 6) color = 'text-blue-500';
          return <div className={`text-sm font-semibold ${color}`}>{dateNum}</div>;
        }}
      />
    </div>
  );
};

export default EventCalendarComponent;