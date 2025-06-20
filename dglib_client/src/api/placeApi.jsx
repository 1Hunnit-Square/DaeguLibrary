import axios from 'axios';
import { API_ENDPOINTS, API_SERVER_HOST } from './config';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.place}`;

// 월별 예약 현황 조회(사용자용)
export const getReservationStatus = async (year, month) => {
  const res = await axios.get(`${prefix}/status`, {
    params: { year, month }
  });
  return Array.isArray(res.data) ? res.data : [];
};

// 예약 등록
export const registerPlace = async (dto) => {
  const res = await axios.post(`${prefix}/register`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

// 관리자 전용: 시설대여 신청 목록 조회
export const getReservationListByAdmin = async (params = {}) => {
  const res = await axios.get(`${prefix}/admin`, { params });
  return res.data;
};

// 관리자 전용: 시설대여 신청 취소
export const cancelReservationByAdmin = async (pno) => {
  const res = await axios.delete(`${prefix}/admin/delete/${pno}`);
  return res.data;
};
