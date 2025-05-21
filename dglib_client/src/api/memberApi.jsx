import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

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

export const cardPost = async (param) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    const form = new FormData();
    form.append('mid', param);
    const res = await axios.post(`${prefix}/cardinfo`, form, header);
    return res.data;
}

export const idExist = async (param) => {
    const res = await axios.get(`${prefix}/existId`, { params : param });
    return res.data;
}

export const getMemberList = async (paramsData) => {
    const res = await axios.get(`${prefix}/listMember`, { params : paramsData });
    return res.data;
}