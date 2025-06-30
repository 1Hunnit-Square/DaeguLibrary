import axios from 'axios';
import { API_ENDPOINTS, API_SERVER_HOST } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.place}`;

// ========================= 사용자 API ========================= //

// 예약 등록
export const registerPlace = async (dto) => {
  const res = await axios.post(`${prefix}/register`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

// 예약 취소
export const deleteReservation = async (pno) => {
  const res = await axios.delete(`${prefix}/${pno}`);
  return res.data;
};

// 예약 내역 조회
export const getReservationListByMemberPaged = async (memberId, page = 0, size = 10) => {
  const res = await axios.get(`${prefix}/member/${memberId}/page`, {
    params: { page, size }
  });
  return res.data;
};

// 월별 예약 현황 조회 (캘린더 표시용)
export const getReservationStatus = async (year, month) => {
  const res = await axios.get(`${prefix}/status`, {
    params: { year, month }
  });
  return Array.isArray(res.data) ? res.data : [];
};

// ========================= 관리자 API ========================= //

// 전체 시설 예약 목록 조회
export const getReservationListByAdmin = async (params = {}) => {
  const res = await axiosClient.get(`${prefix}/admin`, { params });
  return res.data;
};

// 특정 예약 강제 취소
export const cancelReservationByAdmin = async (pno) => {
  const res = await axiosClient.delete(`${prefix}/admin/delete/${pno}`);
  return res.data;
};