import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClosedDays } from '../../api/closedDayApi';

const ClosedInfoComponent = () => {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    const { data: closedDays = [] } = useQuery({
        queryKey: ['closedDays', year, month],
        queryFn: () => getClosedDays(year, month),
    });

    const formattedDates = closedDays
        ?.sort((a, b) => new Date(a.closedDate) - new Date(b.closedDate))
        ?.map(day => {
            const date = new Date(day.closedDate);
            return `${date.getDate()}일`;
        });

    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(prev => prev - 1);
        } else {
            setMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(prev => prev + 1);
        } else {
            setMonth(prev => prev + 1);
        }
    };

    return (
        <div className="flex flex-wrap justify-center bg-white rounded-lg shadow-md px-6 py-5 min-h-[120px] text-sm">
            {/* 왼쪽: 휴관일 */}
            <div className="basis-full md:basis-1/2 flex flex-col items-center justify-center border-t md:border-t-0 pt-4 md:pt-0 text-[13px] text-gray-800">
                <div className="flex items-center gap-4 mb-2 font-semibold text-[17px]">
                    <span>🌷 휴관일</span>
                    <button onClick={handlePrevMonth} className="text-green-600 hover:text-green-800 cursor-pointer">〈</button>
                    <span>{`${year}년 ${month}월`}</span>
                    <button onClick={handleNextMonth} className="text-green-600 hover:text-green-800 cursor-pointer">〉</button>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-semibold text-gray-800 mb-3">
                    {formattedDates.length > 0 ? (
                        formattedDates.map((d, i) => (
                            <span key={i} className="whitespace-nowrap">{d}</span>
                        ))
                    ) : (
                        <span>휴관일 없음</span>
                    )}
                </div>

                <div className="text-xs text-gray-700 flex items-center gap-3">
                    <span className="text-xs">🔔</span>
                    <span>매주 월요일은 정기휴관일입니다.</span>
                </div>
            </div>

            {/* 오른쪽: 이용시간 */}
            <div className="basis-full md:basis-1/2 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-400 pt-4 md:pt-0 pl-0 md:pl-1 text-[13px] text-gray-800">
                <div className="font-semibold text-[17px] mb-3">🕒 이용 시간</div>
                <div className="flex items-start gap-2 text-[16px]">
                    <div className="leading-tight">
                        <p>평일: 09:00 ~ 21:00</p>
                        <p>주말: 09:00 ~ 18:00</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClosedInfoComponent;
