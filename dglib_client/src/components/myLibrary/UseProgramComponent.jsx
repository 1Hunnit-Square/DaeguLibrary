import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { memberIdSelector } from '../../atoms/loginState';
import { getProgramUseListPaged, cancelProgram } from '../../api/programApi';
import { usePagination } from '../../hooks/usePage';
import Loading from '../../routers/Loading';

const UseProgramComponent = () => {
    const mid = useRecoilValue(memberIdSelector);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1", 10) - 1;
    const size = 5;

    useEffect(() => {
        if (!mid) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
        }
    }, [mid, navigate]);

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['programUses', mid, currentPage],
        queryFn: () => getProgramUseListPaged(mid, currentPage, size),
        enabled: !!mid,
        keepPreviousData: true,
    });

    const handleCancel = async (progUseNo) => {
        if (!window.confirm("정말 신청을 취소하시겠습니까?")) return;
        try {
            await cancelProgram(progUseNo);
            alert("신청이 취소되었습니다.");
            window.location.reload();
        } catch (err) {
            alert("신청 취소 중 오류가 발생했습니다.");
        }
    };

    const { renderPagination } = usePagination(data, searchParams, setSearchParams, isLoading);

    const programUses = data?.content || [];

    if (!mid) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {isLoading && <div className="text-center py-6"><Loading /></div>}

            {!isLoading && isError && (
                <div className="text-center text-sm text-red-500 py-4">
                    신청 내역을 불러오지 못했습니다.
                </div>
            )}

            {!isLoading && !isError && (
                <>
                    <div className="overflow-x-auto shadow-sm rounded-xl">
                        <table className="w-full table-fixed bg-white text-sm">
                            <thead className="bg-[#00893B] text-white text-xs uppercase">
                                <tr>
                                    <th className="py-3 px-2 w-[5%]">번호</th>
                                    <th className="py-3 px-2 w-[25%]">프로그램명</th>
                                    <th className="py-3 px-2 w-[20%]">날짜 및 시간</th>
                                    <th className="py-3 px-2 w-[15%]">신청일자</th>
                                    <th className="py-3 px-2 w-[10%]">신청현황</th>
                                    <th className="py-3 px-2 w-[10%]">신청상태</th>
                                    <th className="py-3 px-2 w-[10%]">취소</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {programUses.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-6 text-center text-gray-500 text-base">
                                            신청내역이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    programUses.map((item, index) => (
                                        <tr key={item.progUseNo} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-2 text-center">{index + 1 + currentPage * size}</td>
                                            <td className="py-3 px-2 text-center">
                                                <div className="font-bold">{item.progName}</div>
                                                <div className="text-xs text-gray-700 flex justify-center items-center gap-2 mt-1">
                                                    <span className="inline-block border border-gray-400 px-2 py-0.5 rounded text-xs leading-tight">강사</span>
                                                    <span className="leading-tight">{item.teachName}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-center text-xs">
                                                <div className="flex flex-col gap-2 items-start">
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold border border-gray-400 px-2 py-0.5 rounded text-xs">
                                                            강의일
                                                        </span>
                                                        <span>{item.startDate} ~ {item.endDate}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold border border-gray-400 px-2 py-0.5 rounded text-xs">
                                                            강의시간
                                                        </span>
                                                        <span>
                                                            {item.startTime} ~ {item.endTime} (
                                                            {Array.isArray(item.daysOfWeek)
                                                                ? item.daysOfWeek.map(num => ['일', '월', '화', '수', '목', '금', '토'][num % 7]).join(', ')
                                                                : '없음'}
                                                            )
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-center text-sm">
                                                {dayjs(item.applyAt).format('YYYY-MM-DD')}
                                            </td>
                                            <td className="py-3 px-2 text-center text-sm">
                                                (
                                                <span className={`${item.current / item.capacity >= 0.8 ? 'text-red-600' : 'text-blue-600'} font-semibold`}>
                                                    {item.current}
                                                </span> / {item.capacity})
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span className={`font-semibold text-xs px-2 py-1 ${item.status === '강의종료' ? 'text-gray-700' : 'text-green-700'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {item.status === "강의종료" ? (
                                                    <span className="text-gray-400 text-xl">-</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCancel(item.progUseNo)}
                                                        className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 cursor-pointer"
                                                    >
                                                        신청취소
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 페이지네이션 */}
                    <div className="pt-5">
                        {renderPagination()}
                    </div>
                </>
            )}
        </div>
    );
};

export default UseProgramComponent;