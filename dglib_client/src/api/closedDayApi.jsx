import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.calendar}`;

// 월별 휴관일 조회
export const getClosedDays = async (year, month) => {
    const res = await axios.get(`${prefix}`, {
        params: { year, month },
    });
    return res.data;
};

// 휴관일 등록
export const createClosedDay = async (dto) => {
    const res = await axios.post(`${prefix}/register`, dto, {
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
};

// 수정
export const updateClosedDay = async (dto) => {
    const res = await axios.put(`${prefix}/modify`, dto, {
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
};



// 삭제
export const deleteClosedDay = async (date) => {
    const res = await axios.delete(`${prefix}/${date}`);
    return res.data;
};

// 자동 등록 호출 (월요일, 공휴일, 개관일)
export const registerAutoEvents = async (year) => {
    await axios.post(`${prefix}/auto/mondays`, null, {
        params: { year }
    });
    await axios.post(`${prefix}/auto/holidays`, null, {
        params: { year }
    });
    await axios.post(`${prefix}/auto/anniv`, null, {
        params: { year }
    });
};

export const registerAutoAllEvents = async (year) => {
    const res = await axios.post(`${prefix}/auto`, null, {
        params: { year }
    });
    return res.data;
};

