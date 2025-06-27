import axios from 'axios';
import axiosClient from '../util/axiosClient';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

const PROGRAM_URL = `${API_SERVER_HOST}${API_ENDPOINTS.program}`;

// ========================= 사용자 API ========================= //

// 사용자 - 전체 프로그램 목록 조회
export const getUserProgramList = async (params) => {
  const response = await axios.get(`${PROGRAM_URL}/user/list`, { params });
  return response.data;
};

// 사용자 - 신청
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

// 사용자 - 신청 내역 조회 (페이징)
export const getProgramUseListPaged = async (mid, page = 0, size = 10) => {
  const response = await axios.get(`${PROGRAM_URL}/user/applied/page`, {
    params: { mid, page, size },
  });
  return response.data;
};

// 사용자 - 신청 취소
export const cancelProgram = async (progUseNo) => {
  const response = await axios.delete(`${PROGRAM_URL}/cancel/${progUseNo}`);
  return response.data;
};

// 사용자 - 신청 여부 확인
export const checkAlreadyApplied = async (progNo, mid) => {
  const response = await axios.get(`${PROGRAM_URL}/applied`, {
    params: { progNo, mid },
  });
  return response.data === true;
};

// 사용자 - 신청 가능 여부 확인
export const isProgramAvailable = async (progNo) => {
  const response = await axios.get(`${PROGRAM_URL}/available/${progNo}`);
  return response.data;
};

// ========================= 관리자 API ========================= //

// 관리자 - 프로그램 목록 조회
export const getAdminProgramList = async (params) => {
  const response = await axios.get(`${PROGRAM_URL}/admin/list`, { params });
  return response.data;
};

// 관리자 - 전체 프로그램 목록 (검색용)
export const getAllPrograms = async () => {
  const response = await axios.get(`${PROGRAM_URL}/all`);
  return response.data;
};

// 관리자 - 신청자 목록 조회
export const getApplicantsByProgram = async (progNo) => {
  const response = await axios.get(`${PROGRAM_URL}/${progNo}/applicants`);
  return response.data;
};

// 끝나지않은 프로그램 목록 조회
export const getProgramNotEnd = async () => {
  const response = await axios.get(`${PROGRAM_URL}/admin/notEnd`);
  return response.data;
};

// ========================= 공통 프로그램 API ========================= //

// 프로그램 상세 조회
export const getProgramDetail = async (progNo) => {
  const response = await axios.get(`${PROGRAM_URL}/${progNo}`);
  return response.data;
};

// 프로그램 등록
export const registerProgram = async (formData) => {
  const response = await axios.post(`${PROGRAM_URL}/register`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// 프로그램 수정
export const updateProgram = async (progNo, formData) => {
  const response = await axios.put(`${PROGRAM_URL}/update/${progNo}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// 프로그램 삭제
export const deleteProgram = async (progNo) => {
  const response = await axios.delete(`${PROGRAM_URL}/delete/${progNo}`);
  return response.data;
};

// 장소 중복 확인
export const checkRoomAvailability = async (payload) => {
  const response = await axios.post(`${PROGRAM_URL}/check-room`, payload);
  return response.data;
};

// 강의실 상태 확인
export const getRoomAvailabilityStatus = async (payload) => {
  const response = await axios.post(`${PROGRAM_URL}/room-status`, payload);
  return response.data;
};

// ========================= 프로그램 배너 API ========================= //

// 배너 목록 조회
export const getProgramBanners = async () => {
  const response = await axios.get(`${PROGRAM_URL}/banners`);
  return response.data;
};

// 배너 등록
export const registerProgramBanner = async (formData) => {
  const response = await axiosClient.post(`${PROGRAM_URL}/banners/register`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// 배너 삭제
export const deleteProgramBanner = async (bno) => {
  const response = await axiosClient.delete(`${PROGRAM_URL}/banners/delete/${bno}`);
  return response.data;
};

// 배너 이미지 경로 생성
export const getProgramBannerImageUrl = (filePath) => {
  if (!filePath) return '';
  return `${PROGRAM_URL}/banners/view?filePath=${encodeURIComponent(filePath)}`;
};