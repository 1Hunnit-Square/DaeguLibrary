import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.member}`;

export const loginPost = async (params) => {
    const header = { headers: { "Content-Type": "x-www-form-urlencoded" } };
    const form = new FormData();
    form.append('username', params.id);
    form.append('password', params.pw);
    const res = await axios.post(`${prefix}/login`, form, header);
    return res.data;
}

export const updateClaims = async () => {
    const res = await axiosClient.get(`${prefix}/updateClaims`);
    return res.data;
}

export const regPost = async (params) => {
    const header = { headers: { 'Content-Type': 'application/json' } };
    const res = await axios.post(`${prefix}/register`, params, header);
    return res.data;
}

export const getCard = async (param) => {
    const res = await axiosClient.get(`${prefix}/cardinfo`, { params: param });
    return res.data;
}


export const QrScan = async (params) => {
    const header = { headers: { 'Content-Type': 'application/json' } };
    const res = await axios.post(`${prefix}/qrscan`, params, header);
    return res.data;
}


export const idExist = async (param) => {
    const res = await axios.get(`${prefix}/existId`, { params: param });
    return res.data;
}

export const getMemberList = async (params) => {
    const res = await axiosClient.get(`${prefix}/listMember`, { params: params });
    return res.data;
}

export const getContactList = async (params) => {
    const res = await axiosClient.get(`${prefix}/listContact`, { params: params });
    return res.data;
}

export const getEmailInfoList = async (params) => {
    const res = await axiosClient.get(`${prefix}/listEmailInfo`, { params: params });
    return res.data;
}

export const postMemberManage = async (params) => {
    const header = { headers: { "Content-Type": "x-www-form-urlencoded" } };
    const res = await axios.post(`${prefix}/manageMember`, params, header);
    return res.data;
}

export const phoneExist = async (param) => {
    const res = await axios.get(`${prefix}/existPhone`, { params: param });
    return res.data;
}

export const checkPhoneId = async (param) => {
    const res = await axiosClient.get(`${prefix}/checkPhoneId`, { params: param });
    return res.data;
}


export const leaveApply = async (params) => {
    const header = { headers: { 'Content-Type': 'x-www-form-urlencoded' } };
    const res = await axiosClient.post(`${prefix}/leave`, params, header);
    return res.data;
}

export const idFind = async (params) => {
    const res = await axios.get(`${prefix}/findId`, { params: params });
    return res.data;
}

export const accountFind = async (params) => {
    const res = await axios.get(`${prefix}/existAccount`, { params: params });
    return res.data;
}

export const modMemberPw = async (params) => {
    const header = { headers: { "Content-Type": "x-www-form-urlencoded" } };
    const res = await axios.post(`${prefix}/modPwMember`, params, header);
    return res.data;
}

export const getMemberBasicInfo = async () => {
    const res = await axiosClient.get(`${prefix}/info`);
    return res.data;
}

export const getMemberInfo = async (params) => {
    const res = await axiosClient.get(`${prefix}/getMemberInfo`, { params: params });
    return res.data;
}

export const modPost = async (params) => {
    const header = { headers: { 'Content-Type': 'application/json' } };
    const res = await axiosClient.post(`${prefix}/modify`, params, header);
}

export const getInterestedBook = async (param) => {

    const headers = {

        'Content-Type': 'application/json'
    };
    const res = await axiosClient.get(`${prefix}/interestedbook`, { params: param, headers });
    return res.data;
}

export const reserveBook = async (reservationData) => {

    const headers = {

        'Content-Type': 'application/json'
    };
    const res = await axiosClient.post(`${prefix}/reservebook`, reservationData, { headers });
    return res.data;

}

export const unMannedReserve = async (reservationData) => {

    const headers = {

        'Content-Type': 'application/json'
    };
    const res = await axiosClient.post(`${prefix}/unmannedreserve`, reservationData, { headers });
    return res.data;

}

export const addInterestedBook = async (id) => {

    console.log(id);
    const headers = {

        'Content-Type': 'application/json'
    };
    const res = await axiosClient.post(`${prefix}/addinterestedbook`, { libraryBookIds: id }, { headers });
    return res.data;
}

export const deleteInterestedBook = async (ibIds) => {

    const headers = {

        'Content-Type': 'application/json'
    };
    const res = await axiosClient.delete(`${prefix}/deleteinterestedbook`, {
        data: { ibIds },
        headers,
    });
    return res.data;
}

export const getMemberBorrowList = async () => {
    const res = await axiosClient.get(`${prefix}/memberborrowlist`);
    return res.data;
}

export const extendBorrow = async (rentIds) => {
    console.log(rentIds);
    const headers = {
        'Content-Type': 'application/json'
    };
    const res = await axiosClient.post(`${prefix}/extendborrow`, rentIds, { headers });
    return res.data;
}

export const getMemberBorrowHistory = async (params = {}) => {
    const res = await axiosClient.get(`${prefix}/memberborrowhistory`, {
        params: params,
    });
    return res.data;
}

export const getMemberReserveList = async () => {
    const res = await axiosClient.get(`${prefix}/memberreservelist`);
    return res.data;
}

export const cancelReserveBook = async (reserveId) => {

    const res = await axiosClient.delete(`${prefix}/cancelreservebook`, { params: { reserveId } });
    return res.data;
}

export const getMemberYearBorrowHistory = async () => {
    const res = await axiosClient.get(`${prefix}/yearborrowhistory`);
    return res.data;
}

export const getMemberPhone = async () => {
    const res = await axiosClient.get(`${prefix}/getmemberphone`);
    return res.data;
}

export const regWishBook = async (book) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    const res = await axiosClient.post(`${prefix}/regwishbook`, book, { headers });
    return res.data;
}


export const getMemberWishBookList = async (year) => {

    const res = await axiosClient.get(`${prefix}/memberwishbooklist/${year}`,);
    return res.data;
}

export const cancelWishBook = async (wishNo) => {

    const res = await axiosClient.post(`${prefix}/cancelwishbook/${wishNo}`);
    return res.data;

}

export const getEbookInfo = async (ebookId) => {
    const res = await axiosClient.get(`${prefix}/ebookinfo/${ebookId}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.data;
}

export const getHighlights = async (ebookId) => {
    const res = await axiosClient.get(`${prefix}/highlights/${ebookId}`);
    return res.data;
}

export const addHighlight = async (highlightData) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    const res = await axiosClient.post(`${prefix}/addhighlight`, highlightData, { headers });
    return res.data;
}


export const updateHighlight = async (data) => {
    const response = await axiosClient.put(`${prefix}/updatehighlight`, data);
    return response.data;
}

export const deleteHighlight = async ({ highlightId, cfiRange }) => {
    const response = await axiosClient.delete(`${prefix}/deletehighlight/${highlightId}`);
    return response.data;
}

export const saveCurrentPage = async (data) => {
    const response = await axiosClient.post(`${prefix}/savepage`, data);
    return response.data;
}

export const getCurrentPage = async (ebookId) => {
    const response = await axiosClient.get(`${prefix}/currentpage/${ebookId}`);
    return response.data;
};

export const getMyEbook = async (param) => {

    const headers = {

        'Content-Type': 'application/json'
    };
    const res = await axiosClient.get(`${prefix}/myebook`, { params: param, headers });
    return res.data;
}

export const deleteEbook = async (ebookIds) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    const res = await axiosClient.delete(`${prefix}/deleteebook`, {
        data: { ebookIds },
        headers,
    });
    return res.data;
}


export const getMemberStats = async () => {
    const response = await axiosClient.get(`${prefix}/getMemberStats`);
    return response.data;
};
