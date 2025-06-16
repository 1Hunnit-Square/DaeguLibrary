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
        <div className="flex flex-col sm:flex-row h-full p-2 sm:p-3 lg:p-4">
            {/* 왼쪽: 휴관일 */}
            <div className="flex-1 flex flex-col items-center justify-center pb-2 sm:pb-0 sm:pr-2 lg:pr-3">
                <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2 font-semibold text-xs sm:text-sm lg:text-base">
                    <span>🌷 휴관일</span>
                    <button onClick={handlePrevMonth} className="text-green-600 hover:text-green-800 cursor-pointer text-xs sm:text-sm">〈</button>
                    <span className="text-xs sm:text-sm">{`${year}년 ${month}월`}</span>
                    <button onClick={handleNextMonth} className="text-green-600 hover:text-green-800 cursor-pointer text-xs sm:text-sm">〉</button>
                </div>

                <div className="flex flex-wrap gap-x-1 sm:gap-x-2 lg:gap-x-3 gap-y-1 text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 justify-center">
                    {formattedDates.length > 0 &&
                        formattedDates.map((d, i) => (
                            <span key={i} className="whitespace-nowrap">{d}</span>
                        ))
                    }
                </div>

                <div className="text-xs sm:text-xs lg:text-sm text-gray-700 flex items-center gap-1 text-center">
                    <span>🔔</span>
                    <span className="hidden sm:inline">매주 월요일은 정기휴관일입니다.</span>
                    <span className="sm:hidden">매주 월요일 휴관</span>
                </div>
            </div>

            {/* 오른쪽: 이용시간 */}
            <div className="flex-1 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-gray-300 pt-2 sm:pt-0 sm:pl-2 lg:pl-3">
                <div className="font-semibold text-xs sm:text-sm lg:text-base mb-1 sm:mb-2">🕒 이용시간</div>
                <div className="text-xs sm:text-sm text-center">
                    <p>평일: 09:00 ~ 21:00</p>
                    <p>주말: 09:00 ~ 18:00</p>
                </div>
            </div>
        </div>
    );
};

export default ClosedInfoComponent;
