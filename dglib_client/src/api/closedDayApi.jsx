import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.calendar}`;

// 등록
export const createClosedDay = async (dto) => {
    const res = await axios.post(`${prefix}/register`, dto, {
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
};

// 조회
export const getClosedDays = async (year, month) => {
    const res = await axios.get(`${prefix}`, {
        params: { year, month },
    });
    return res.data;
};

// 특정 날짜의 공휴일 여부 및 이름 조회 (모달창 표시용)
export const getHolidayInfoByDate = async (date) => {
    const res = await axios.get(`${prefix}/holidayInfo`, {
        params: { date }
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

// 전체 자동 등록 (월요일 + 공휴일 + 개관일)
// 연도 최초 진입 시 전체 자동 등록이 필요한 경우 사용
// 내부적으로 서버에서 모든 자동 등록 항목을 일괄 처리함
export const registerAutoAllEvents = async (year) => {
    const res = await axios.post(`${prefix}/auto`, null, {
        params: { year }
    });
    return res.data;
};

// 항목별 자동 등록 (수동 호출용)
// 월요일 / 공휴일 / 개관일을 따로 등록하고 싶을 때 사용
// 관리자 수동 등록 UI 등에서 개별 호출 가능
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