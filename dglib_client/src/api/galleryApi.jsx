import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.gallery}`;

// 목록
export const getGalleryList = async (params) => {
    const res = await axiosClient.get(`${prefix}/list`, { params: params });
    return res.data;
}

// 상세
export const getGalleryDetail = async (path) => {
    const res = await axiosClient.get(`${prefix}/${path}`);
    return res.data;
}

// 등록
export const regGallery = async (params) => {
    const header = { headers: { "Content-Type": 'multipart/form-data' } };
    const res = await axiosClient.post(`${prefix}/register`, params, header);
    return res.data;
}

// 수정
export const modGallery = async (path, params) => {
    const header = { headers: {"Content-Type": 'multipart/form-data'}};
    const res = await axiosClient.put(`${prefix}/${path}`, params, header);
    return res.data;
}

// 삭제
export const deleteGallery = (gno) => {
    return axiosClient.delete(`${prefix}/${gno}`);
};

// 썸네일
export const getGalleryThumbnail = (filePath) => {
    if(!filePath) return '';
    return `${API_SERVER_HOST}/api/view/${filePath}`;
};