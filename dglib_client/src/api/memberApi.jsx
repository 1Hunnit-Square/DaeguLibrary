import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import { getAuthHeader } from '../util/cookieUtil';
import axiosAuth from '../util/axiosClient';

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

export const getInterestedBook = async (param) => {
    const loginState = getAuthHeader();
    const headers = {
        'loginState': loginState && loginState.Authorization ? 'true' : 'false',
        'Content-Type': 'application/json'
    };
    const res = await axiosAuth.get(`${prefix}/interestedbook`, { params : param, headers });
    return res.data;
}

export const reserveBook = async (reservationData) => {
    const loginState = getAuthHeader();
    const headers = {
        'loginState': loginState && loginState.Authorization ? 'true' : 'false',
        'Content-Type': 'application/json'
    };
    const res = await axiosAuth.post(`${prefix}/reservebook`, reservationData, { headers });
    return res.data;

}

export const unMannedReserve = async (reservationData) => {
    const loginState = getAuthHeader();
    const headers = {
        'loginState': loginState && loginState.Authorization ? 'true' : 'false',
        'Content-Type': 'application/json'
    };
    const res = await axiosAuth.post(`${prefix}/unmannedreserve`, reservationData, { headers });
    return res.data;

}

export const addInterestedBook = async (id) => {
    const loginState = getAuthHeader();
    console.log(id);
    const headers = {
        'loginState': loginState && loginState.Authorization ? 'true' : 'false',
        'Content-Type': 'application/json'
    };
    const res = await axiosAuth.post(`${prefix}/addinterestedbook`, { libraryBookIds: id }, { headers });
    return res.data;
}

export const deleteInterestedBook = async (ibIds) => {
    const loginState = getAuthHeader();
    const headers = {
        'loginState': loginState && loginState.Authorization ? 'true' : 'false',
        'Content-Type': 'application/json'
    };
    const res = await axiosAuth.delete(`${prefix}/deleteinterestedbook`, {
        data: { ibIds },
        headers,
    });
    return res.data;
}