import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.notice}`;

export const getNoticeList = async (params) => {
    const res = await axios.get(`${prefix}/list`, { params : params });
    return res.data;
}

export const getNoticePinnedList = async () => {
    const res = await axios.get(`${prefix}/listPinned`);
    return res.data;
}

export const getNoticeTopList = async (param) => {
    const res = await axios.get(`${prefix}/listTop`, { params : param });
    return res.data;
}

export const getNoticeDetail = async (path) => {
    const res = await axios.get(`${prefix}/${path}`);
    return res.data;
}

export const regNotice = async (params) => {
    const header = { headers: {"Content-Type": 'multipart/form-data'}};
    const res = await axiosClient.post(`${prefix}/register`, params, header);
    return res.data;
}

export const modNotice = async (path, params) => {
    const header = { headers: {"Content-Type": 'multipart/form-data'}};
    const res = await axiosClient.put(`${prefix}/${path}`, params, header);
    return res.data;
}

export const delNotice = async (path) => {
    const res = await axiosClient.delete(`${prefix}/${path}`);
    return res.data;
}
