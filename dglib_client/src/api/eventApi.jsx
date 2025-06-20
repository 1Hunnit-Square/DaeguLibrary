import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.event}`;

// 목록
export const getEventList = async (params) => {
    const res = await axiosClient.get(`${prefix}/list`, { params: params });
    return res.data;
}

// 상단고정
export const getEventPinnedList = async () => {
    const res = await axios.get(`${prefix}/listPinned`);
    return res.data;
}

// 상세
export const getEventDetail = async (eno) => {
    const res = await axiosClient.get(`${prefix}/detail/${eno}`);
    return res.data;
};

// 등록
export const regEvent = async (params) => {
    const header = { headers: { "Content-Type": 'multipart/form-data' } };
    const res = await axiosClient.post(`${prefix}/register`, params, header);
    return res.data;
}

// 수정
export const modEvent = async (eno, params) => {
    const header = { headers: { "Content-Type": 'multipart/form-data' } };
    const res = await axiosClient.put(`${prefix}/update/${eno}`, params, header);
    return res.data;
};

// 삭제
export const deleteEvent = async (eno) => {
    return axiosClient.delete(`${prefix}/delete/${eno}`);
};

// 배너 목록 조회
export const getEventBanners = async () => {
    const res = await axiosClient.get(`${prefix}/banner`);
    return res.data;
};

// 배너 등록 (eventNo + file)
export const registerEventBanner = async (eventNo, file) => {
    const formData = new FormData();
    formData.append("eventNo", eventNo);
    formData.append("file", file);

    const header = { headers: { "Content-Type": "multipart/form-data" } };
    const res = await axiosClient.post(`${prefix}/banner/register`, formData, header);
    return res.data;
};

// 배너 삭제
export const deleteEventBanner = async (bno) => {
  return axiosClient.delete(`${prefix}/banner/${bno}`);
};

// 배너 이미지 URL 생성 함수
export const getEventBannerImageUrl = (filePath) => {
    if (!filePath) return '';
    return `${prefix}/banner/view?filePath=${filePath}`;
};
