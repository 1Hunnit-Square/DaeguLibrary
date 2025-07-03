import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarComponent from '../usage/CalendarComponent';
import { useQuery } from '@tanstack/react-query';
import { getClosedDays } from '../../api/closedDayApi';
import { getReservationStatus } from '../../api/placeApi';

const ApplyFacilityComponent = () => {
  const today = new Date();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const { data: closedDays = [] } = useQuery({
    queryKey: ['closedDays', selectedYear, selectedMonth],
    queryFn: () => getClosedDays(selectedYear, selectedMonth),
  });

  const { data: statusData = [] } = useQuery({
    queryKey: ['reservationStatus', selectedYear, selectedMonth],
    queryFn: () => getReservationStatus(selectedYear, selectedMonth),
  });

  const isClosedDate = (targetDate) => {
    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    return closedDays.some(day => day.closedDate === formatted && day.isClosed);
  };

  const handleDateClick = async (date, room) => {
    const formattedDate = formatDate(date);
    try {
      navigate('/reservation/facility/apply/form', {
        state: {
          roomName: room,
          date: formattedDate
        }
      });
    } catch (e) {
      alert(e.response?.data?.message || "예약 중 오류 발생");
    }
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-lg shadow-md">
      <section className="bg-[#e5f5ec] p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-green-800 mb-2 leading-relaxed">이용신청 시 유의사항</h2>
          <div className="w-10 border-b-2 border-green-800 mb-4"></div>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed tracking-wide">
            자격: 독서토론 및 독서진흥 활동을 위한 모임
          </p>
          <p className='text-sm md:text-base text-red-600 leading-relaxed tracking-wide'>
            ※ 예약 변경은 불가능합니다, 취소 후 재예약해 주세요.
          </p>
        </div>
      </section>

      <CalendarComponent
        showYearSelect={false}
        onMonthChange={(year, month) => {
          setSelectedYear(year);
          setSelectedMonth(month);
        }}
        renderExtraCellContent={(date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const isPast = date < today;
          const isClosed = isClosedDate(date);
          const dateStr = formatDate(date);

          const matched = statusData.find(item => item.date === dateStr);
          const statusMap = matched?.status || {};

          const roomList = ['동아리실', '세미나실'];

          if (isClosed) return null;
          if (isPast) {
            return (
              <div className="relative h-full w-full flex items-end justify-center pb-1 mt-1">
                <div className="text-[11px] text-gray-400 text-center">종료</div>
              </div>
            );
          }

          return (
            <div className="relative h-full flex flex-col justify-end items-end w-full pb-1 mt-3">
              <div className="flex flex-col gap-[4px] w-full ">
                {roomList.map((room, idx) => {
                  const isFullyBooked = statusMap[room] === 'full';
                  return (
                    <button
                      key={idx}
                      onClick={() => !isFullyBooked && handleDateClick(date, room)}
                      disabled={isFullyBooked}
                      className={`
                        text-xs px-2 py-[2px] w-full rounded border transition pb-1 
                        ${isFullyBooked
                          ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'border-blue-300 text-gray-800 bg-blue-300 hover:bg-blue-400 cursor-pointer'}
                      `}
                    >
                      {room}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default ApplyFacilityComponent;