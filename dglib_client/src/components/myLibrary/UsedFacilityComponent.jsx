import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_SERVER_HOST } from '../../api/config';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { memberIdSelector } from '../../atoms/loginState';
import { useNavigate } from 'react-router-dom';
import Loading from '../../routers/Loading';
import Button from '../common/Button';
import dayjs from 'dayjs';

const fetchReservations = async (memberId) => {
  const res = await axios.get(`${API_SERVER_HOST}/api/places/member/${memberId}`);
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
        <table className="w-full text-center border-t border-black text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3">번호</th>
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
                <td colSpan="7" className="py-6 text-gray-600">
                  신청내역이 없습니다.
                </td>
              </tr>
            ) : (
              reservations.map((item, index) => (
                <tr key={item.pno} className="border-t text-sm text-center">
                  <td className="py-4">{index + 1}</td>
                  <td className="py-4 text-center">
                    <div className="inline-flex items-center gap-4 justify-center">
                      <div className="flex items-center gap-1">
                        <span className="border border-gray-300 text-xs px-2 py-0.5 rounded">
                          이용일자
                        </span>
                        <span>{item.useDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="border border-gray-300 text-xs px-2 py-0.5 rounded">
                          이용시간
                        </span>
                        <span>{item.startTime} ~ {item.endTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">{item.room}</td>
                  <td className="py-4">{item.people}명</td>
                  <td className="py-4">{dayjs(item.appliedAt).format('YYYY-MM-DD')}</td>
                  <td className="py-4">
                    <span
                      className="inline-flex items-center justify-center bg-blue-500 text-white text-xs px-3 h-[30px] rounded"
                    >
                      신청완료
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <Button
                        onClick={() => cancelMutation.mutate(item.pno)}
                        className="bg-red-500 hover:bg-red-700 text-white text-xs px-3 h-[30px] rounded flex items-center justify-center"
                      >
                        신청취소
                      </Button>
                    </div>
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