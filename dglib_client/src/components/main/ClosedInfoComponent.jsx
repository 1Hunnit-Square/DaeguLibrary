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

    const filtered = closedDays
        ?.sort((a, b) => new Date(a.closedDate) - new Date(b.closedDate))
        ?.map(day => {
            const date = new Date(day.closedDate);
            return `${String(date.getDate()).padStart(2, '0')}일`;
        });

    return (
        <div className="flex text-sm p-4 justify-between">
            {/* 왼쪽: 휴관일 정보 */}
            <div className="flex-1 pr-4 border-r border-gray-300">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-semibold">휴관일 안내</h4>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevMonth} className="text-gray-500 hover:text-black">〈</button>
                        <span className="font-semibold">{month}월</span>
                        <button onClick={handleNextMonth} className="text-gray-500 hover:text-black">〉</button>
                    </div>
                </div>
                <div className="text-gray-700 mb-2">
                    {filtered.length > 0 ? filtered.map((d, i) => (
                        <span key={i} className="mr-2">{d}</span>
                    )) : <span>휴관일 없음</span>}
                </div>
            </div>

            {/* 오른쪽: 정기휴관일 안내 + 이용시간 */}
            <div className="flex-1 pl-4 space-y-3 text-gray-700 text-sm">
                {/* 정기휴관일 안내 */}
                <div className="flex items-start gap-1">
                    <span className="text-[16px]">📅</span>
                    <span className="text-[13px]">매주 월요일은 정기휴관일입니다.</span>
                </div>

                {/* 이용시간 안내 */}
                <div className="flex items-start gap-1">
                    <span className="text-[16px]">🕒</span>
                    <div className="text-[13px] leading-tight">
                        <p className="font-semibold">이용시간</p>
                        <p>평일: 09:00~21:00</p>
                        <p>주말: 09:00~18:00</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClosedInfoComponent;