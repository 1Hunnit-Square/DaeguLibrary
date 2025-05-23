import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import koLocale from '@fullcalendar/core/locales/ko';
import { useQuery } from '@tanstack/react-query';
import { getClosedDays } from '../../api/closedDayApi';
import Loading from '../../routers/Loading';

const ApplyFacilityComponent = () => {
  const calendarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const roomName = location.state?.roomName;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ['closedDays', year, month],
    queryFn: () => getClosedDays(year, month),
    enabled: !!year && !!month
  });

  const closedDayList = events
    .filter(e => e.isClosed)
    .map(e => e.closedDate); // 'YYYY-MM-DD'

  const formatDate = (date) => date.toISOString().split('T')[0];

  const handleReserve = (clickedRoom, dateStr) => {
    navigate("/reservation/facility/apply/form", {
      state: { roomName: clickedRoom, selectedDate: dateStr }
    });
  };

  const handleDatesSet = () => {
    const current = calendarRef.current?.getApi()?.getDate();
    if (!current) return;
    setYear(current.getFullYear());
    setMonth(current.getMonth() + 1);
  };

  const facilityList = ['동아리실', '세미나실'];

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">신청 가능 날짜</h2>

      {isLoading && <Loading />}
      {isError && <p className="text-sm text-red-500">데이터 로드 실패</p>}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        locale={koLocale}
        initialView="dayGridMonth"
        datesSet={handleDatesSet}
        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        dayHeaderContent={({ date, text }) => {
          const day = date.getDay();
          let color = 'text-gray-600';
          if (day === 0) color = 'text-red-500';
          if (day === 6) color = 'text-blue-500';
          return <div className={`py-2 text-sm font-semibold ${color}`}>{text}</div>;
        }}
        dayCellClassNames={() => 'h-40 align-top p-1 border border-gray-200 text-sm'}
        dayCellContent={({ date }) => {
          const calendarApi = calendarRef.current?.getApi();
          const currentMonth = calendarApi?.getDate().getMonth();
          const dateStr = formatDate(date);
          const day = date.getDay();

          const isOtherMonth = date.getMonth() !== currentMonth;
          const isClosed = closedDayList.includes(dateStr) || date.getDay() === 1; // 월요일 포함


          return (
            <div className="flex flex-col items-center gap-1">
              <div
                className={`font-semibold text-sm ${
                  day === 0 ? 'text-red-500' : day === 6 ? 'text-blue-500' : ''
                } ${isOtherMonth ? 'text-gray-400' : ''}`}
              >
                {date.getDate()}
              </div>

              {isOtherMonth ? null : isClosed ? (
                <div className="text-xs text-red-600 mt-1">휴관일</div>
              ) : (
                facilityList.map((room) => (
                  <button
                    key={room}
                    onClick={() => handleReserve(room, dateStr)}
                    className="text-xs bg-green-700 text-white px-2 py-1 rounded hover:bg-green-800 cursor-pointer"
                  >
                    {room}
                  </button>
                ))
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default ApplyFacilityComponent;
