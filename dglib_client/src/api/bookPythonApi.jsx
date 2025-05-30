import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';


const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.bookapi}`;


export const getBookreco = async (genre) => {
    const res = await axiosClient.get(`${prefix}/bookreco/${genre}`);
    return res.data;
}

export const getBookrecoList = async (genre, page) => {
    const res = await axiosClient.get(`${prefix}/bookrecolist/${genre}`, {
        params: { page }
    });
    return res.data;
}

export const searchBookApi = async (searchTerm, page = 1) => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const res = await axiosClient.get(`${prefix}/search/${encodedSearchTerm}`, {
        params: { page }
    });
    return res.data;
}




export const getWordCloud = async () => {
    const res = await axiosClient.get(`${prefix}/wordcloud`);
    return res.data;
}

export const getMemberRecoBook = async () => {
    const res = await axiosClient.get(`${prefix}/memberrecobook`);
    return res.data;
}