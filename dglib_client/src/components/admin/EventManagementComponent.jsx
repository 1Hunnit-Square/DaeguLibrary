import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import CheckBox from '../common/CheckBox';
import SelectComponent from '../common/SelectComponent';
import Draggable from 'react-draggable';
import {
    getClosedDays,
    createClosedDay,
    deleteClosedDay,
    registerAutoEvents,
    registerAutoAllEvents
} from '../../api/closedDayApi';
import axios from 'axios';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const EventManagementComponent = () => {
    const calendarRef = useRef(null);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isClosed, setIsClosed] = useState(false);
    const [selectedType, setSelectedType] = useState('기념일');
    const [title, setTitle] = useState('');
    const [events, setEvents] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const autoRegisteredYears = useRef(new Set());

    useEffect(() => {
        setTimeout(() => {
            const calendarApi = calendarRef.current?.getApi();
            if (!calendarApi) return;

            const currentDate = calendarApi.getDate();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            getClosedDays(year, month).then(setEvents);
        }, 100);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsModalOpen(false);
            }
        };
        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen]);

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

        try{
            await registerAutoAllEvents(newYear);
        } catch (error) {
            console.warn('자동 등록 실패(이미 등록된 연도인지 확인 필요)', error);
        }

        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const currentDate = calendarApi.getDate();
            const newDate = new Date(newYear, currentDate.getMonth(), 1);
            calendarApi.gotoDate(newDate);
        }
    };

    const handleDateClick = (arg) => {
        const target = events.find(e => e.closedDate === arg.dateStr);
        if (target) {
            setIsEditMode(true);
            setIsClosed(target.isClosed);
            setTitle(target.reason);
        } else {
            setIsEditMode(false);
            setIsClosed(false);
            setTitle('');
        }
        setSelectedDate(arg.dateStr);
        setIsModalOpen(true);
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

    const refreshEvents = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const viewStart = calendarApi.view.currentStart;
            const year = viewStart.getFullYear();
            const month = viewStart.getMonth() + 1;
            getClosedDays(year, month).then(setEvents);
        }
    };

    const handleSaveSchedule = () => {
        if (!title.trim()) {
            alert("일정을 입력해주세요.");
            return;
        }

        const dto = {
            closedDate: selectedDate,
            isClosed,
            reason: title,
        };

        createClosedDay(dto).then(() => {
            setIsModalOpen(false);
            setIsClosed(false);
            setSelectedType('기념일');
            setTitle('');
            setIsEditMode(false);
            refreshEvents();
        })
        .catch((err) => {
            console.error('등록 실패:', err.response?.data || err.message);
            alert('등록 중 오류가 발생했습니다.');
        });
    };

    const handleDeleteSchedule = () => {
        if (!selectedDate) return;
        deleteClosedDay(selectedDate).then(() => {
            setIsModalOpen(false);
            setIsClosed(false);
            setTitle('');
            setIsEditMode(false);
            refreshEvents();
        });
    };

    return (
        <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-lg shadow mt-12">
            <div className="mb-4 flex justify-end items-center gap-2">
                <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="border border-[#A8D5BA] rounded px-3 py-1 text-sm text-gray-800"
                >
                    {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((year) => (
                        <option key={year} value={year}>{year}년</option>
                    ))}
                </select>
                <button
                    onClick={handleGoToday}
                    className="px-4 py-2 bg-[#00893B] text-white rounded hover:bg-[#006C2D]"
                >
                    오늘
                </button>
            </div>

            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={koLocale}
                contentHeight="auto"
                headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
                buttonText={{ today: '오늘' }}
                titleFormat={{ year: 'numeric', month: 'long' }}
                dateClick={handleDateClick}
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
                dayCellClassNames={() => 'h-32 align-top p-2 border border-gray-200 text-sm cursor-pointer'}
                dayCellContent={({ date }) => {
                    const day = date.getDay();
                    const dateNum = date.getDate();
                    let color = 'text-gray-800';
                    if (day === 0) color = 'text-red-500';
                    if (day === 6) color = 'text-blue-500';
                    return <div className={`text-sm font-semibold ${color}`}>{dateNum}</div>;
                }}
            />

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <Draggable handle=".modal-header">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md border border-gray-300 shadow-md pointer-events-auto">
                            <div className="modal-header flex justify-between items-center mb-4 cursor-move">
                                <h2 className="text-lg font-semibold">
                                    {selectedDate ? `${formatDate(selectedDate)} 일정 ${isEditMode ? '수정' : '등록'}` : '일정 등록'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)}>✕</button>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="date"
                                    value={selectedDate || ''}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                                <CheckBox
                                    label="휴관일로 지정"
                                    checked={isClosed}
                                    onChange={(e) => setIsClosed(e.target.checked)}
                                />
                                <SelectComponent
                                    options={['기념일', '공휴일']}
                                    value={selectedType}
                                    onChange={setSelectedType}
                                />
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="일정 이름을 입력하세요"
                                />
                                {isEditMode && (
                                    <button
                                        onClick={handleDeleteSchedule}
                                        className="w-full mt-2 px-4 py-2 bg-[#ac0010] text-white rounded hover:bg-[#9b111e]"
                                    >
                                        삭제
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveSchedule}
                                    className="w-full bg-[#00893B] text-white px-4 py-2 rounded hover:bg-[#006C2D]"
                                >
                                    {isEditMode ? '수정' : '등록'}
                                </button>
                            </div>
                        </div>
                    </Draggable>
                </div>
            )}
        </div>
    );
};

export default EventManagementComponent;
