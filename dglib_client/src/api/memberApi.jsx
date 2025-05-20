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

export const getInterestedBook = async (param, mid) => { //변경
    const res = await axios.get(`${prefix}/interestedbook`, { params : param, headers: { 'Authorization': mid } });
    return res.data;
}

export const reserveBook = async (reservationData) => { //변경
    console.log("예약 데이터", reservationData);
    const res = await axios.post(`${prefix}/reservebook`, reservationData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;

}

export const unMannedReserve = async (reservationData) => { //변경
    console.log("무인 예약 데이터", reservationData);
    const res = await axios.post(`${prefix}/unmannedreserve`, reservationData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;

}

export const addInterestedBook = async (bookData) => { //변경
    const res = await axios.post(`${prefix}/addinterestedbook`, bookData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

export const deleteInterestedBook = async (ibIds, mid) => { //변경
    const res = await axios.delete(`${prefix}/deleteinterestedbook`, {
        data: { ibIds },
        headers: { 'Authorization': mid }
    });
    return res.data;
}