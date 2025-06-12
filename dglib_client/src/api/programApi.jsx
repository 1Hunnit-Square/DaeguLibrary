import axios from 'axios';
import axiosClient from '../util/axiosClient';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

const PROGRAM_URL = `${API_SERVER_HOST}${API_ENDPOINTS.program}`;

// 목록 조회 (검색, 상태 필터 포함)
export const getProgramList = async (params) => {
  const response = await axios.get(PROGRAM_URL, { params });
  return response.data;
};

// 상세 조회
export const getProgramDetail = async (progNo) => {
  const response = await axios.get(`${PROGRAM_URL}/${progNo}`);
  return response.data;
};

// 장소 중복 확인 (등록 전)
export const checkRoomAvailability = async (payload) => {
  const response = await axios.post(`${PROGRAM_URL}/check-room`, payload);
  return response.data;
};

// 강의실 상태 확인
export const getRoomAvailabilityStatus = async (payload) => {
  const response = await axios.post(`${PROGRAM_URL}/room-status`, payload);
  return response.data;
};


// 등록
export const registerProgram = async (formData) => {
  const response = await axios.post(`${PROGRAM_URL}/register`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// 수정
export const updateProgram = async (progNo, formData) => {
  const response = await axios.put(`${PROGRAM_URL}/${progNo}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// 삭제
export const deleteProgram = async (progNo) => {
  const response = await axios.delete(`${PROGRAM_URL}/delete/${progNo}`);
  return response.data;
};

// 프로그램 신청(회원용)
export const applyProgram = async (progNo, mid) => {
  const response = await axiosClient.post(
    `${PROGRAM_URL}/apply`,
    { progNo, mid },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
};

// 프로그램 신청 내역(회원용)
export const getProgramUseList = async (mid) => {
  const res = await axios.get(`${PROGRAM_URL}/use`, {
    params: { mid },
  });
  return Array.isArray(res.data) ? res.data : [];
};

// 프로그램 신청 취소(회원용)
export const cancelProgram = async (progUseNo) => {
  const response = await axios.delete(`${PROGRAM_URL}/cancel/${progUseNo}`);
  return response.data;
};

// 특정 프로그램의 신청자 목록 조회(관리자용)
export const getApplicantsByProgram = async (progNo) => {
  const response = await axios.get(`${PROGRAM_URL}/${progNo}/applicants`);
  return response.data;
};
