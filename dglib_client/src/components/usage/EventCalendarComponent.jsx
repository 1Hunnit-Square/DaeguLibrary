import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import koLocale from '@fullcalendar/core/locales/ko';
import Button from '../common/Button';
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
            const today = new Date();
            setSelectedYear(today.getFullYear());
        }
    };

    const handleYearChange = async (e) => {
        const newYear = parseInt(e.target.value, 10);
        setSelectedYear(newYear);

        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const currentDate = calendarApi.getDate();
            const newDate = new Date(newYear, currentDate.getMonth(), 1);
            calendarApi.gotoDate(newDate);
        }

        try {
            await registerAutoAllEvents(newYear);
        } catch (error) {
            console.warn('자동 등록 실패 (이미 등록 되었는지 확인)', error);
        }
    };

    const handleDatesSet = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;

        const currentDate = calendarApi.getDate();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        getClosedDays(year, month).then(data => {
            setEvents(data);
        });
    };

    useEffect(() => {
        setTimeout(() => {
            const calendarApi = calendarRef.current?.getApi();
            if (!calendarApi) return;

            const currentDate = calendarApi.getDate();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            getClosedDays(year, month).then(data => {
                setEvents(data);
            });
        }, 100);
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-lg shadow mt-12">
            <div className="mb-4 flex justify-end items-center gap-2">
                <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="h-10 px-3 py-2 border border-[#A8D5BA] rounded text-sm text-gray-800"
                >
                    {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((year) => (
                        <option key={year} value={year}>{year}년</option>
                    ))}
                </select>
                <button
                    onClick={handleGoToday}
                    className="h-10 px-4 py-2 bg-[#00893B] text-white rounded hover:bg-[#006C2D]"
                >
                    오늘
                </button>
            </div>

            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                locale={koLocale}
                contentHeight="auto"
                headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
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
