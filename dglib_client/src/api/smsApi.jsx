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

export const checkAuthCode = async (params) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    const form = new FormData();
    form.append("phoneNum", params.phone)
    form.append("authCode",params.code);
    const res = await axios.post(`${prefix}/checkCode`, form, header);
    return res.data;
}