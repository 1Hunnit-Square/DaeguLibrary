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
        <div className="w-full h-full flex justify-center overflow-hidden">
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
                {/* 이용시간 */}
                <div className="py-5 h-full">
                    <div className="font-semibold text-xs sm:text-sm text-gray-800 mb-3">이용시간</div>
                    <div className="text-xs sm:text-sm text-gray-700 space-y-0.5">
                        <div className="flex justify-center gap-2 sm:gap-4 whitespace-nowrap">
                            <span className="font-semibold flex items-center">
                                <span className="inline-block w-1.5 h-1.5 bg-green-700 mr-2"></span>
                                평일
                            </span>
                            <span className="text-gray-600">09:00 ~ 21:00</span>
                        </div>
                        <div className="flex justify-center gap-2 sm:gap-4 whitespace-nowrap">
                            <span className="font-semibold flex items-center">
                                <span className="inline-block w-1.5 h-1.5 bg-green-700 mr-2"></span>
                                주말
                            </span>
                            <span className="text-gray-600">09:00 ~ 18:00</span>
                        </div>
                    </div>
                </div>

                {/* 구분선 */}
                <div className="w-full max-w-sm border-t border-gray-300" />

                {/* 휴관일 */}
                <div className="py-5 h-full">
                    <div className="text-xs sm:text-sm font-bold text-gray-800 mb-3">휴관일</div>
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-800 mb-1">
                        <button onClick={handlePrevMonth} className="font-bold text-green-600 hover:text-green-700 cursor-pointer">〈</button>
                        <span className="whitespace-nowrap">{`${year}년 ${month}월`}</span>
                        <button onClick={handleNextMonth} className="font-bold text-green-600 hover:text-green-700 cursor-pointer">〉</button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 break-words">
                        {formattedDates.length > 0 &&
                            formattedDates.map((d, i) => <span key={i}>{d}</span>)}
                    </div>
                    <div className="text-[11px] sm:text-xs text-gray-600 mt-1">
                        🔔 매주 <strong>월요일</strong>은 정기 휴관일입니다.
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ClosedInfoComponent;
