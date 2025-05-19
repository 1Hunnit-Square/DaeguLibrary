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

export const deleteLibraryBook = async (librarybookid, isbn) => {
    const res = await axios.delete(`${prefix}/deletelibrarybook/${librarybookid}/${isbn}`);
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
    const payload = reserveUpdate.map(item => ({
        reserveId: item.reserveId,
        state: item.state,
        reservationRank: item.reservationRank,
        libraryBookId: item.libraryBookId,
        mid: item.mid,
    }));
    const res = await axios.post(`${prefix}/cancelreservebook`, payload, { headers: { 'Content-Type': 'application/json' } });
    if (res.status !== 200) {
        return res.data;
    }
    return res.data;

}

export const reReserveBook = async (reserveUpdate) => {
    const payload = reserveUpdate.map(item => ({
        reserveId: item.reserveId,
        state: item.state,
        reservationRank: item.reservationRank,
        libraryBookId: item.libraryBookId,
        mid: item.mid,
    }));
    console.log("reReserveBook payload", payload);
    const res = await axios.post(`${prefix}/rereservebook`, payload, { headers: { 'Content-Type': 'application/json' } });
    if (res.status !== 200) {
        return res.data;
    }
    return res.data;
}

export const completeBorrowing = async (reserveUpdate) => {
    const payload = reserveUpdate.map(item => ({
        reserveId: item.reserveId,
        state: item.state,
        reservationRank: item.reservationRank,
        libraryBookId: item.libraryBookId,
        mid: item.mid,
    }));
    const res = await axios.post(`${prefix}/completeborrowing`, payload, { headers: { 'Content-Type': 'application/json' } });
    if (res.status !== 200) {
        return res.data;
    }
    return res.data;
}
