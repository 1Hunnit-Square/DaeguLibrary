import axios from 'axios';
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
