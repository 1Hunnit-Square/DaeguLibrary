import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS, SMS_KEY } from './config';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.sms}`;

export const sendAuthCode = async (param) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    const form = new FormData();
    form.append("phoneNum", param)
    form.append("smsKey",SMS_KEY);
    const res = await axios.post(`${prefix}/sendCode`, form, header);
    return res.data;
}

export const sendSms = async (paramData) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    paramData.append("smsKey",SMS_KEY);
    const res = await axios.post(`${prefix}/sendsms`, paramData, header);
    return res.data;
}

export const checkAuthCode = async (params) => {
    const res = await axios.get(`${prefix}/checkCode`, { params : params });
    return res.data;
}

export const regTemplate =  async (param) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    const res = await axios.post(`${prefix}/regTemplate`, param, header);
    return res.data;
}

export const getTemplate = async (params) => {
    const res = await axios.get(`${prefix}/getTemplate`, { params : params });
    return res.data;
}

export const findTemplate = async (params) => {
    const res = await axios.get(`${prefix}/findTemplate`, { params : params });
    return res.data;
}

export const delTemplate = async (param) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    const res = await axios.post(`${prefix}/delTemplate`, param, header);
    return res.data;
}