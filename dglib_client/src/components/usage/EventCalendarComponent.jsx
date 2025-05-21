import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import koLocale from '@fullcalendar/core/locales/ko';
import Button from '../common/Button';
import SelectComponent from '../common/SelectComponent';
import { getClosedDays, registerAutoAllEvents } from '../../api/closedDayApi';

const EventCalendarComponent = () => {
  const calendarRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [events, setEvents] = useState([]);

  const handleGoToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      setSelectedYear(new Date().getFullYear());
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

    try {
      await registerAutoAllEvents(newYear);
    } catch (error) {
      console.warn('자동 등록 실패', error);
    }
  };

  const handleDatesSet = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    const currentDate = calendarApi.getDate();
    getClosedDays(currentDate.getFullYear(), currentDate.getMonth() + 1).then(setEvents);
  };

  useEffect(() => {
    setTimeout(() => {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;
      const currentDate = calendarApi.getDate();
      getClosedDays(currentDate.getFullYear(), currentDate.getMonth() + 1).then(setEvents);
    }, 100);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-lg shadow mt-12">
        <div className="mb-4 flex justify-end items-center gap-2">
            <SelectComponent
                options={Array.from({ length: 10 }, (_, i) => `${currentYear - 5 + i}년`)}
                value={`${selectedYear}년`}
                onChange={handleYearChange}
                selectClassName="w-28 text-sm"
                dropdownClassName="w-28"
            />
            <Button onClick={handleGoToday}>오늘</Button>
        </div>

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
