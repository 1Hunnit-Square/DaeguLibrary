import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/AxiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.member}`;

export const loginPost = async (params) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    const form = new FormData();
    form.append('username', params.id);
    form.append('password', params.pw);
    const res = await axios.post(`${prefix}/login`, form, header);
    return res.data;
}

export const regPost = async (params) => {
    const header = { headers: {'Content-Type': 'application/json'}};
    const res = await axios.post(`${prefix}/register`, params, header);
    return res.data;
}

export const getCard = async (param) => {
    const res = await axiosClient.get(`${prefix}/cardinfo`, { params : param });
    return res.data;
}

export const idExist = async (param) => {
    const res = await axios.get(`${prefix}/existId`, { params : param });
    return res.data;
}

export const getMemberList = async (params) => {
    const res = await axiosClient.get(`${prefix}/listMember`, { params : params });
    return res.data;
}

export const PostMemberManage = async (params) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    const res = await axios.post(`${prefix}/manageMember`, params, header);
    return res.data;
}

export const phoneExist = async (param) => {
    const res = await axios.get(`${prefix}/existPhone`, { params : param });
    return res.data;
}

export const idFind = async (params) => {
    const res = await axios.get(`${prefix}/findId`, { params : params });
    return res.data;
}