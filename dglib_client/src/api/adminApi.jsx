import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.admin}`;

export const regBook = async (bookData) => {
    const res = await axios.post(`${prefix}/regbook`, bookData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

export const regBookCheck = async (isbn) =>{
    const res = await axios.get(`${prefix}/regbookcheck/${isbn}`);
    return res.data;

}

export const changeLibraryBook = async (params) => {
    console.log(params);
    const res = await axios.post(`${prefix}/changelibrarybook`, params, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

export const borrowBook = async (borrowData) => {
    const res = await axios.post(`${prefix}/borrowbook`, borrowData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

export const searchMemberNumber = async (memberNumber) => {

    const res = await axios.get(`${prefix}/searchmembernumber/${memberNumber}`);
    return res.data;
}

export const searchByLibraryBookId = async (libraryBookId) => {
    const res = await axios.get(`${prefix}/searchlibrarybook/${libraryBookId}`);
    return res.data;
}

export const getLibraryBookList = async (params = {}) => {
    const res = await axios.get(`${prefix}/librarybooklist`, {
        params: params,
    });
    return res.data;
}

export const getRentalList = async (params = {}) => {
    const res = await axios.get(`${prefix}/rentallist`, {
        params: params,
    });
    return res.data;
}

export const returnBook = async (returnData) => {

    const payload = returnData.map(rentId => ({rentId}));
    console.log(payload);
    const res = await axios.post(`${prefix}/returnbook`, payload, { headers: { 'Content-Type': 'application/json' } });
    if (res.status !== 200) {
        return res.data;
    }
    return res.data;
}

export const getReserveBookList = async (params = {}) => {
    const res = await axios.get(`${prefix}/reservebooklist`, {
        params: params,
    });
    return res.data;
}

export const cancelReserveBook = async (reserveUpdate) => {
    const payload = reserveUpdate.map(reserveId => ({reserveId}));
    const res = await axios.post(`${prefix}/cancelreservebook`, payload, { headers: { 'Content-Type': 'application/json' } });
    if (res.status !== 200) {
        return res.data;
    }
    return res.data;

}


export const completeBorrowing = async (reserveUpdate) => {
    const payload = reserveUpdate.map(reserveId => ({reserveId}));
    const res = await axios.post(`${prefix}/completeborrowing`, payload, { headers: { 'Content-Type': 'application/json' } });
    if (res.status !== 200) {
        return res.data;
    }
    return res.data;
}

export const updateOverdueMember = async () => {
    const res = await axios.post(`${prefix}/updateoverduemember`);
    if (res.status !== 200) {
        return res.data;
    }
    return res.data;
}
