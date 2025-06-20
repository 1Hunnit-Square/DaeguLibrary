import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.admin}`;


// 공지사항 관리자
export const getAdminNoticeList = async (params) => {
  console.log("보내는 params", params);
  const response = await axiosClient.get(`${prefix}/notice`, { params : params });
  console.log("받은 데이터", response.data);
  return response.data;
};

export const getAdminNewsList = async (params) => {
  console.log("보내는 params", params);
  const response = await axiosClient.get(`${prefix}/news`, { params : params });
  console.log("받은 데이터", response.data);
  return response.data;
};






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

    return res.data;

}


export const completeBorrowing = async (reserveUpdate) => {
    const payload = reserveUpdate.map(reserveId => ({reserveId}));
    const res = await axios.post(`${prefix}/completeborrowing`, payload, { headers: { 'Content-Type': 'application/json' } });

    return res.data;
}

export const updateOverdueMember = async () => {
    const res = await axios.post(`${prefix}/updateoverduemember`);

    return res.data;
}

export const getWishBookList = async (params = {}) => {
    const res = await axios.get(`${prefix}/wishbooklist`, {
        params: params,
    });
    return res.data;
}

export const rejectWishBook = async (wishNo) => {
    const res = await axios.post(`${prefix}/rejectwishbook/${wishNo}`);

    return res.data;
}

export const regEbook = async (ebookData) => {
    const res = await axios.post(`${prefix}/regebook`, ebookData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
}

export const getEbookList = async (params = {}) => {
    const res = await axios.get(`${prefix}/ebooklist`, {
        params: params,
    });
    return res.data;
}

export const updateEbook = async (ebookData) => {
    const res = await axios.post(`${prefix}/updateebook`, ebookData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
}

export const deleteEbook = async (ebookId) => {
    const res = await axios.delete(`${prefix}/deleteebook/${ebookId}`);
    return res.data;
}


