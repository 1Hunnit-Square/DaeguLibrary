import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import CheckBox from '../common/CheckBox';
import SelectComponent from '../common/SelectComponent';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../../routers/Loading';

import { getClosedDays, createClosedDay, updateClosedDay, deleteClosedDay, registerAutoAllEvents } from '../../api/closedDayApi';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const getYearOptions = () =>
  Array.from({ length: 10 }, (_, i) => `${new Date().getFullYear() - 5 + i}년`);

const getDayColor = (day, base = 'text-gray-600') => {
  if (day === 0) return 'text-red-500';
  if (day === 6) return 'text-blue-500';
  return base;
};

const EventManagementComponent = () => {
  const calendarRef = useRef(null);
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [originalDate, setOriginalDate] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [selectedType, setSelectedType] = useState('기념일');
  const [title, setTitle] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const autoRegisteredYears = useRef(new Set());

  const { data: events = [], refetch, isLoading, isError } = useQuery({
    queryKey: ['closedDays', selectedYear, selectedMonth],
    queryFn: () => getClosedDays(selectedYear, selectedMonth),
    enabled: !!selectedYear && !!selectedMonth,
  });

  const saveMutation = useMutation({
    mutationFn: (dto) => (isEditMode ? updateClosedDay(dto) : createClosedDay(dto)),
    onSuccess: () => {
      queryClient.invalidateQueries(['closedDays', selectedYear, selectedMonth]);
      resetModal();
    },
    onError: (err) => alert('저장 중 오류 발생: ' + (err.response?.data || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: (date) => deleteClosedDay(date),
    onSuccess: () => {
      queryClient.invalidateQueries(['closedDays', selectedYear, selectedMonth]);
      resetModal();
    },
    onError: (err) => alert('삭제 중 오류 발생: ' + (err.response?.data || err.message)),
  });

  const resetModal = () => {
    setIsModalOpen(false);
    setIsClosed(false);
    setSelectedType('기념일');
    setTitle('');
    setIsEditMode(false);
    setSelectedDate(null);
    setOriginalDate(null);
  };

  const updateDateStateFromCalendar = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    const currentDate = calendarApi.getDate();
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth() + 1);
  };

  const handleGoToday = () => {
    calendarRef.current?.getApi()?.today();
    updateDateStateFromCalendar();
  };

  const handleYearChange = async (label) => {
    const newYear = parseInt(label.replace('년', ''), 10);
    setSelectedYear(newYear);

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(new Date(newYear, calendarApi.getDate().getMonth(), 1));
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

  const handleDatesSet = () => updateDateStateFromCalendar();

  const handleDateClick = (arg) => {
    const target = events.find(e => e.closedDate === arg);
    setIsEditMode(!!target);
    setIsClosed(target?.isClosed || false);
    setTitle(target?.reason || '');
    setOriginalDate(target?.closedDate || null);
    setSelectedDate(arg);
    setIsModalOpen(true);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    const target = events.find(e => e.closedDate === newDate);
    if (target) {
      setIsEditMode(true);
      setIsClosed(target.isClosed);
      setTitle(target.reason);
      setOriginalDate(target.closedDate);
    } else {
      setIsEditMode(false);
      setIsClosed(false);
      setTitle('');
      setOriginalDate(null);
    }
  };

  const handleSaveSchedule = () => {
    if (!title.trim()) return alert("일정을 입력해주세요.");

    const dto = {
      closedDate: selectedDate,
      isClosed,
      reason: title,
      ...(isEditMode ? { originalDate } : {})
    };
    saveMutation.mutate(dto);
  };

  const handleDeleteSchedule = () => {
    if (selectedDate) deleteMutation.mutate(selectedDate);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-lg shadow mt-12">
      <div className="mb-4 flex items-center gap-2 justify-end z-0 relative">
        <SelectComponent
          options={getYearOptions()}
          value={`${selectedYear}년`}
          onChange={handleYearChange}
          selectClassName="w-28 text-sm"
          dropdownClassName="w-28 z-40"
        />
        <Button onClick={handleGoToday} className="h-10">오늘</Button>
        {isRegisterLoading ? (
          <div className='h-10 flex items-center justify-center'>
            <Loading />
          </div>
        ) : (
          <Button
            onClick={async () => {
              setIsRegisterLoading(true);
              try {
                await registerAutoAllEvents(new Date().getFullYear());
                alert('공휴일 및 휴관일이 등록되었습니다.');
                refetch();
              } catch (e) {
                alert('공휴일 및 휴관일 등록 실패: ' + (e.response?.date || e.message));
              } finally {
                setIsRegisterLoading(false);
              }
            }}
            className="h-10 bg-gray-500 hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            {isRegisterLoading && <Loading size="20px" />}
            공휴일 수동 등록
          </Button>
        )}
      </div>

      {isLoading && <Loading />}
      {isError && <div className="text-center text-sm text-red-500">일정 불러오기 오류</div>}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={koLocale}
        fixedWeekCount={false}
        contentHeight="auto"
        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        buttonText={{ today: '오늘' }}
        titleFormat={{ year: 'numeric', month: 'long' }}
        datesSet={handleDatesSet}
        dateClick={(e) => handleDateClick(e.dateStr)}
        eventClick={(e) => handleDateClick(e.event.startStr)}
        eventDidMount={(info) => {
          info.el.style.cursor = 'pointer';
        }}
        events={events.map(e => ({
          title: e.reason,
          date: e.closedDate,
          color: e.isClosed ? '#a52a2a' : '#00893B'
        }))}
        dayHeaderContent={({ date, text }) => (
          <div className={`py-2 text-sm font-semibold ${getDayColor(date.getDay())}`}>{text}</div>
        )}
        dayCellClassNames={() => 'h-32 align-top p-2 border border-gray-200 text-sm hover:bg-gray-100'}
        dayCellContent={({ date }) => (
          <div className={`text-sm font-semibold ${getDayColor(date.getDay(), 'text-gray-800')}`}>{date.getDate()}</div>
        )}
      />

      <div className="mt-2 text-sm text-gray-600 italic">✔ 날짜를 클릭하면 일정을 편집할 수 있습니다.</div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
          <Modal
            isOpen={true}
            title={selectedDate ? `${formatDate(selectedDate)} 일정 ${isEditMode ? '수정' : '등록'}` : '일정 등록'}
            onClose={resetModal}
          >
            <div className="space-y-4">
              <input
                type="date"
                value={selectedDate || ''}
                onChange={handleDateChange}
                className="w-full border rounded px-3 py-2"
              />
              <CheckBox label="휴관일로 지정" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} />
              <SelectComponent options={['기념일', '공휴일']} value={selectedType} onChange={setSelectedType} dropdownClassName="z-40" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="일정 이름을 입력하세요"
              />
              <button
                onClick={handleSaveSchedule}
                className="w-full bg-[#00893B] text-white px-4 py-2 rounded hover:bg-[#006C2D] cursor-pointer"
              >
                {isEditMode ? '수정' : '등록'}
              </button>
              {isEditMode && (
                <button
                  onClick={handleDeleteSchedule}
                  className="w-full mt-2 px-4 py-2 bg-[#ac0010] text-white rounded hover:bg-[#9b111e] cursor-pointer"
                >
                  삭제
                </button>
              )}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default EventManagementComponent;