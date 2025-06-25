import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservationListByMemberPaged, deleteReservation } from '../../api/placeApi';
import { useRecoilValue } from 'recoil';
import { memberIdSelector } from '../../atoms/loginState';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePagination } from '../../hooks/usePage';
import Loading from '../../routers/Loading';
import dayjs from 'dayjs';

const UsedFacilityComponent = () => {
  const memberId = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;
  const size = 5;

  useEffect(() => {
    if (!memberId) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
    }
  }, [memberId, navigate]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['reservations', memberId, currentPage],
    queryFn: () => getReservationListByMemberPaged(memberId, currentPage, size),
    enabled: !!memberId,
    keepPreviousData: true,
  });

  const cancelMutation = useMutation({
    mutationFn: (pno) => deleteReservation(pno),
    onSuccess: () => {
      alert('신청이 취소되었습니다.');
      queryClient.invalidateQueries(['reservations', memberId]);
    },
    onError: (err) => {
      console.error('예약 취소 실패:', err);
      alert('예약 취소에 실패했습니다.');
    },
  });


  const reservations = data?.content || [];
  const { renderPagination } = usePagination(data, searchParams, setSearchParams, isLoading);

  if (!memberId) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {isLoading && (
        <div className="text-center py-6">
          <Loading />
        </div>
      )}

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
                  <th className="py-3 px-2 w-[25%]">이용일시</th>
                  <th className="py-3 px-2 w-[20%]">장소</th>
                  <th className="py-3 px-2 w-[10%]">인원</th>
                  <th className="py-3 px-2 w-[15%]">신청일자</th>
                  <th className="py-3 px-2 w-[15%]">상태</th>
                  <th className="py-3 px-2 w-[10%]">취소</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-500 text-base">
                      신청내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  reservations.map((item, index) => (
                    <tr key={item.pno} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-2 text-center">{index + 1 + currentPage * size}</td>
                      <td className="py-3 px-2 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-2 text-xs">
                          <div className="flex items-center gap-5">
                            <span className="border border-gray-400 px-2 py-0.5 rounded text-xs font-semibold">이용일자</span>
                            <span>{item.useDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="border border-gray-400 px-2 py-0.5 rounded text-xs font-semibold">이용시간</span>
                            <span>{item.startTime} ~ {item.endTime}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">{item.room}</td>
                      <td className="py-3 px-2 text-center">{item.people}명</td>
                      <td className="py-3 px-2 text-center">{dayjs(item.appliedAt).format('YYYY-MM-DD')}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-green-700 font-semibold text-xs px-2 py-1">
                          신청완료
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => {
                            if (dayjs(item.useDate).isBefore(dayjs(), 'day')) {
                              alert('이미 이용이 완료된 신청은 취소할 수 없습니다.');
                              return;
                            }
                            cancelMutation.mutate(item.pno);
                          }}
                          disabled={dayjs(item.useDate).isBefore(dayjs(), 'day')}
                          className={`px-2 py-1 text-xs rounded ${dayjs(item.useDate).isBefore(dayjs(), 'day')
                            ? 'bg-gray-300 text-white cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                            }`}
                        >
                          신청취소
                        </button>
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

export default UsedFacilityComponent;