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