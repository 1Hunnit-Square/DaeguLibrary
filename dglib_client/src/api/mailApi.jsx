import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.mail}`;

export const getMailList = async (params) => {
    const res = await axiosClient.get(`${prefix}/list`, { params : params });
    return res.data;
}

export const getMailDetail = async (path, params) => {
    const res = await axiosClient.get(`${prefix}/${path}`, { params : params });
    return res.data;
}


export const sendMailPost = async (params) => {
 const header = { headers: { "Content-Type": 'multipart/form-data' } };
    const res = await axiosClient.post(`${prefix}/sendMail`, params, header);
    return res.data;

}

export const delMail = async (path, params) => {
    const res = await axiosClient.delete(`${prefix}/${path}`, { params : params });
    return res.data;
}

export const delMailList = async (params) => {
    const header = { headers: { "Content-Type": "x-www-form-urlencoded" } };
    const res = await axiosClient.post(`${prefix}/delList`, params, header);
    return res.data;
}