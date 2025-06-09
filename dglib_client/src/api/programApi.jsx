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
  const response = await axios.post(`${API_SERVER_HOST}/api/programs/check-room`, payload);
  return response.data;
};

// 사용 가능한 강의실 목록 조회
export const getAvailableRooms = async (payload) => {
  const response = await axios.post(`${API_SERVER_HOST}/api/programs/available-rooms`, payload);
  return response.data;
};

// 등록
export const registerProgram = async (formData) => {
  const response = await axios.post(PROGRAM_URL, formData, {
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
  const response = await axios.delete(`${PROGRAM_URL}/${progNo}`);
  return response.data;
};

// 첨부파일 다운로드
export const downloadProgramFile = async (progNo) => {
  const response = await axios.get(`${PROGRAM_URL}/file/${progNo}`, {
    responseType: 'blob',
  });
  return response;
};

// 프로그램 신청(회원용)
export const applyProgram = async (progNo, mid) => {
  const response = await axiosClient.post(
    `${API_SERVER_HOST}/api/programs/apply`,
    { progNo, mid },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// 프로그램 신청 내역(회원용)
export const getProgramUseList = async (mid) => {
  const res = await axios.get(`${API_SERVER_HOST}${API_ENDPOINTS.program}/use`, {
    params: { mid },
  });
  return Array.isArray(res.data) ? res.data : [];
};

// 프로그램 신청 취소(회원용)
export const cancelProgram = async (progUseNo) => {
  const response = await axios.delete(`${API_SERVER_HOST}/api/programs/cancel/${progUseNo}`);
  return response.data;
};


