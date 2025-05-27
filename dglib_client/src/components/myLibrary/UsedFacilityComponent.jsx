import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { memberIdSelector } from '../../atoms/loginState';
import { useNavigate } from 'react-router-dom';
import Loading from '../../routers/Loading';

// 임시 mock, 병합 후 교체
const fetchReservations = async (memberId) => {
  return []; // 추후 axios 요청으로 변경
};

const UsedFacilityComponent = () => {
  const memberId = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 비로그인 시 리다이렉트
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
    enabled: !!memberId, // 로그인 상태일 때만 실행
    retry: false, // 실패 시 재시도 안 함 (에러 도배 방지)
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/places/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations', memberId]);
    },
  });

  if (!memberId) return null; // useEffect가 처리하므로 렌더링 방지

  return (
    <div className="p-6 mt-6">
      {/* 로딩 */}
      {isLoading && (
        <div className="text-center py-6">
          <Loading />
        </div>
      )}

      {/* 에러 */}
      {!isLoading && isError && (
        <div className="text-center text-sm text-red-500 py-4">
          신청 내역을 불러오지 못했습니다.
        </div>
      )}

      {/* 정상 표시 */}
      {!isLoading && !isError && (
        <table className="w-full text-center border-t border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2">번호</th>
              <th>이용일시</th>
              <th>장소</th>
              <th>이용인원</th>
              <th>신청일자</th>
              <th>접수상태</th>
              <th>취소</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-6 text-gray-500">
                  신청내역이 없습니다.
                </td>
              </tr>
            ) : (
              reservations.map((item, index) => (
                <tr key={item.id} className="border-t">
                  <td className="py-2">{index + 1}</td>
                  <td>
                    {item.useDate}
                    <br />
                    ({item.startTime} ~ {item.endTime})
                  </td>
                  <td>{item.roomName}</td>
                  <td>{item.personCount}명</td>
                  <td>{item.registerDate}</td>
                  <td>
                    <span className="bg-blue-300 text-white px-3 py-1 rounded-full text-xs">
                      신청완료
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => cancelMutation.mutate(item.id)}
                      className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded text-xs"
                    >
                      신청취소
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsedFacilityComponent;