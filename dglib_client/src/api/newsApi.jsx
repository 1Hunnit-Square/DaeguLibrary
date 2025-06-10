import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.news}`;

// 목록
export const getNewsList = async (params) => {
    const res = await axiosClient.get(`${prefix}/list`, { params: params });
    return res.data;
}

// 상세
export const getNewsDetail = async (path) => {
    const res = await axiosClient.get(`${prefix}/${path}`);
    return res.data;
}

// 등록
export const regNews = async (params) => {
    const header = { headers: { "Content-Type": 'multipart/form-data' } };
    const res = await axios.post(`${prefix}/register`, params, header);
    return res.data;
}

// // 수정
// export const modNews = (nno, formData) => {
//   const accessToken = localStorage.getItem("accessToken");
//   if (!accessToken) {
//     throw new Error("accessToken이 존재하지 않습니다.");
//   }

//   return axiosClient.put(`/api/news/${nno}`, formData, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       "Content-Type": "multipart/form-data"
//     }
//   });
// };

export const modNews = async (path, params) => {
    const header = { headers: {"Content-Type": 'multipart/form-data'}};
    const res = await axiosClient.put(`${prefix}/${path}`, params, header);
    return res.data;
}

// 삭제
export const deleteNews = (nno) => {
    return axios.delete(`${prefix}/${nno}`);
};