import axios from 'axios';
import axiosClient from '../util/axiosClient';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

const PROGRAM_URL = `${API_SERVER_HOST}${API_ENDPOINTS.program}`;

// 프로그램 배너 목록 조회
export const getProgramBanners = async () => {
  const res = await axios.get(`${PROGRAM_URL}/banners`);
  return res.data;
};

// 프로그램 배너 등록
export const registerProgramBanner = async (formData) => {
  const res = await axios.post(`${PROGRAM_URL}/banners/register`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// 프로그램 배너 삭제
export const deleteProgramBanner = async (bno) => {
  const res = await axios.delete(`${PROGRAM_URL}/banners/delete/${bno}`);
  return res.data;
};

// 배너 이미지 URL 생성 함수
export const getProgramBannerImageUrl = (filePath) => {
  if (!filePath) return '';
  return `${PROGRAM_URL}/banners/view?filePath=${encodeURIComponent(filePath)}`;
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
  const response = await axios.put(`${PROGRAM_URL}/update/${progNo}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// 삭제
export const deleteProgram = async (progNo) => {
  const response = await axios.delete(`${PROGRAM_URL}/delete/${progNo}`);
  return response.data;
};

// 프로그램 목록 조회(관리자용)
export const getAdminProgramList = async (params) => {
  const response = await axios.get(`${PROGRAM_URL}/admin/list`, { params });
  return response.data;
};

// 특정 프로그램의 신청자 목록 조회(관리자용)
export const getApplicantsByProgram = async (progNo) => {
  const response = await axios.get(`${PROGRAM_URL}/${progNo}/applicants`);
  return response.data;
};

// 전체 프로그램 목록 조회 (관리자 전체용)
export const getAllPrograms = async () => {
  const response = await axios.get(`${PROGRAM_URL}/all`);
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
  const res = await axios.get(`${PROGRAM_URL}/user/applied`, {
    params: { mid },
  });
  return Array.isArray(res.data) ? res.data : [];
};

// 프로그램 신청 취소(회원용)
export const cancelProgram = async (progUseNo) => {
  const response = await axios.delete(`${PROGRAM_URL}/cancel/${progUseNo}`);
  return response.data;
};

// 프로그램 목록 조회(회원용)
export const getUserProgramList = async (params) => {
  const response = await axios.get(`${PROGRAM_URL}/user/list`, { params });
  return response.data;
};

// 프로그램 신청 여부 확인(회원용)
export const checkAlreadyApplied = async (progNo, mid) => {
  const res = await axios.get(`${PROGRAM_URL}/applied`, {
    params: { progNo, mid },
  });
  return res.data === true;
};

// 신청 가능 여부 확인 (회원용)
export const isProgramAvailable = async (progNo) => {
  const response = await axios.get(`${PROGRAM_URL}/available/${progNo}`);
  return response.data;
};



