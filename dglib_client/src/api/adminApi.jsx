
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.admin}`;


// 공지사항 관리자
export const getBoardList = async (params) => {
  console.log("보내는 params", params);
  const response = await axiosClient.get(`${prefix}/board`, { params : params });
  console.log("받은 데이터", response.data);
  return response.data;
};

export const hideBoards = (boardType, ids, hidden) => {
  return axiosClient.put(`${prefix}/board/hide`, {
    boardType,
    ids,
    hidden,
  });
};

export const deleteBoards = (boardType, ids) => {
  return axiosClient.delete(`${prefix}/board`, {
    data: { boardType, ids },
  });
};




export const regBook = async (bookData) => {
    const res = await axiosClient.post(`${prefix}/regbook`, bookData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

export const regBookCheck = async (isbn) =>{
    const res = await axiosClient.get(`${prefix}/regbookcheck/${isbn}`);
    return res.data;

}

export const changeLibraryBook = async (params) => {
    console.log(params);
    const res = await axiosClient.post(`${prefix}/changelibrarybook`, params, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

export const borrowBook = async (borrowData) => {
    const res = await axiosClient.post(`${prefix}/borrowbook`, borrowData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

export const searchMemberNumber = async (memberNumber) => {

    const res = await axiosClient.get(`${prefix}/searchmembernumber/${memberNumber}`);
    return res.data;
}

export const searchByLibraryBookId = async (libraryBookId) => {
    const res = await axiosClient.get(`${prefix}/searchlibrarybook/${libraryBookId}`);
    return res.data;
}

export const getLibraryBookList = async (params = {}) => {
    const res = await axiosClient.get(`${prefix}/librarybooklist`, {
        params: params,
    });
    return res.data;
}

export const getRentalList = async (params = {}) => {
    const res = await axiosClient.get(`${prefix}/rentallist`, {
        params: params,
    });
    return res.data;
}

export const returnBook = async (returnData) => {

    const payload = returnData.map(rentId => ({rentId}));
    console.log(payload);
    const res = await axiosClient.post(`${prefix}/returnbook`, payload, { headers: { 'Content-Type': 'application/json' } });

    return res.data;
}

export const getReserveBookList = async (params = {}) => {
    const res = await axiosClient.get(`${prefix}/reservebooklist`, {
        params: params,
    });
    return res.data;
}

export const cancelReserveBook = async (reserveUpdate) => {
    const payload = reserveUpdate.map(reserveId => ({reserveId}));
    const res = await axiosClient.post(`${prefix}/cancelreservebook`, payload, { headers: { 'Content-Type': 'application/json' } });

    return res.data;

}


export const completeBorrowing = async (reserveUpdate) => {
    const payload = reserveUpdate.map(reserveId => ({reserveId}));
    const res = await axiosClient.post(`${prefix}/completeborrowing`, payload, { headers: { 'Content-Type': 'application/json' } });

    return res.data;
}

export const updateOverdueMember = async () => {
    const res = await axiosClient.post(`${prefix}/updateoverduemember`);

    return res.data;
}

export const getWishBookList = async (params = {}) => {
    const res = await axiosClient.get(`${prefix}/wishbooklist`, {
        params: params,
    });
    return res.data;
}

export const rejectWishBook = async (wishNo) => {
    const res = await axiosClient.post(`${prefix}/rejectwishbook/${wishNo}`);

    return res.data;
}

export const regEbook = async (ebookData) => {
    const res = await axiosClient.post(`${prefix}/regebook`, ebookData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
}

export const getEbookList = async (params = {}) => {
    const res = await axiosClient.get(`${prefix}/ebooklist`, {
        params: params,
    });
    return res.data;
}

export const updateEbook = async (ebookData) => {
    const res = await axiosClient.post(`${prefix}/updateebook`, ebookData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
}

export const deleteEbook = async (ebookId) => {
    const res = await axiosClient.delete(`${prefix}/deleteebook/${ebookId}`);
    return res.data;
}

export const getTop10Books = async (params) => {
    const res = await axiosClient.get(`${prefix}/top10books`, {
        params: params,
    });
    return res.data;
}
