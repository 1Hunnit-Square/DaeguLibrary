import axios from 'axios';

const API_SERVER_HOST = 'http://localhost:8090';
const prefix = `${API_SERVER_HOST}/api/book`;

export const getBookreco = async (genre) => {
    const res = await axios.get(`${prefix}/bookreco/${genre}`);
    return res.data;
}

export const searchBookApi = async (searchTerm, page = 1) => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const res = await axios.get(`${prefix}/search/${encodedSearchTerm}?page=${page}`);
    return res.data;
}

export const regBook = async (bookData) => {
    const res = await axios.post(`${prefix}/regbook`, bookData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}

export const getLibraryBookList = async (page = 1, size = 10) => {
    const res = await axios.get(`${prefix}/librarybooklist`, {
        params: {
            page,
            size
        }
    });
    return res.data;
}

export const getLibraryBookDetail = async (librarybookid) => {
    const res = await axios.get(`${prefix}/librarybookdetail/${librarybookid}`);
    return res.data;
}

export const getRentalList = async (page = 1, size = 10) => {
    const res = await axios.get(`${prefix}/rentallist`, {
        params: {
            page,
            size
        }
    });
    return res.data;
}

export const reserveBook = async (reservationData) => {
    const res = await axios.post(`${prefix}/reservebook`, reservationData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;

}

export const getReserveBookList = async (page = 1, size = 10) => {
    const res = await axios.get(`${prefix}/reservebooklist`, {
        params: {
            page,
            size
        }
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

export const returnBook = async (returnData) => {

    const payload = returnData.map(rentId => ({rentId}));
    console.log(payload);
    const res = await axios.post(`${prefix}/returnbook`, payload, { headers: { 'Content-Type': 'application/json' } });
    if (res.status !== 200) {
        return res.data;
    }
    return res.data;
}

export const searchLibraryBookbyLibraryBookId = async (libraryBookId) => {
    const res = await axios.get(`${prefix}/searchlibrarybook/${libraryBookId}`);
    return res.data;
}

export const rentBook = async (rentData) => {
    const res = await axios.post(`${prefix}/rentbook`, rentData, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
}


