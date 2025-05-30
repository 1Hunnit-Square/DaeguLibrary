import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.notice}`;

export const getNoticeList = async (params) => {
    const res = await axiosClient.get(`${prefix}/list`, { params : params });
    return res.data;
}

export const getNoticeDetail = async (path) => {
    const res = await axiosClient.get(`${prefix}/${path}`);
    return res.data;
}
