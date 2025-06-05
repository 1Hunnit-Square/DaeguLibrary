import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_SERVER_HOST } from '../../api/config';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { memberIdSelector } from '../../atoms/loginState';
import { useNavigate } from 'react-router-dom';
import Loading from '../../routers/Loading';
import dayjs from 'dayjs';
import { API_ENDPOINTS } from '../../api/config';

const fetchReservations = async (memberId) => {
  const res = await axios.get(`${API_SERVER_HOST}${API_ENDPOINTS.place}/member/${memberId}`);
  return Array.isArray(res.data) ? res.data : [];
};

const UsedFacilityComponent = () => {
  const memberId = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!memberId) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
    }
  }, [memberId, navigate]);

  const {
    data: reservations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['reservations', memberId],
    queryFn: () => fetchReservations(memberId),
    enabled: !!memberId,
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => axios.delete(`${API_SERVER_HOST}/api/places/${id}`),
    onSuccess: () => {
      alert('신청이 취소되었습니다.');
      queryClient.invalidateQueries(['reservations', memberId]);
    },
  });

  if (!memberId) return null;

  return (
    <div className="p-6 mt-6">
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
        <div className="overflow-x-auto shadow-md rounded-lg">
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
                    <td className="py-3 px-2 text-center">{index + 1}</td>
                    <td className="py-3 px-2 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-2 text-xs">
                        <div className="flex items-center gap-5">
                          <span className="border border-gray-400 px-2 py-0.5 rounded text-xs">이용일자</span>
                          <span>{item.useDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="border border-gray-400 px-2 py-0.5 rounded text-xs">이용시간</span>
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
                        className={`px-3 py-1 text-xs rounded ${dayjs(item.useDate).isBefore(dayjs(), 'day')
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
      )}
    </div>
  );
};

export default UsedFacilityComponent;