import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.member}`;

export const loginPost = async (loginParam) => {
    const header = { headers: {"Content-Type": "x-www-form-urlencoded"}};
    const form = new FormData();
    form.append('username', loginParam.id);
    form.append('password', loginParam.pw);
    const res = await axios.post(`${prefix}/login`, form, header);
    return res.data;
}

