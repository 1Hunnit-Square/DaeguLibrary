import qs from 'qs';
import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';
import { getFingerprint } from '../util/fingerprint';




const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.book}`;

export const getBookreco = async (genre) => {
    const res = await axios.get(`${prefix}/bookreco/${genre}`);
    return res.data;
}

export const getBookrecoList = async (genre, page) => {
    const res = await axios.get(`${prefix}/bookrecolist/${genre}`, {
        params: { page }
    });
    return res.data;
}
export const getNsLibraryBookList = async (params = {}) => {
    const { page = 1, size = 10 } = params;
    const finalParams = { page, size, fingerprint: await getFingerprint() };
    if (params.query) {
        finalParams.query = params.query;
        finalParams.option = params.option;
    }
    if (params.previousQueries && params.previousQueries.length > 0) {
        finalParams.previousQueries = params.previousQueries;
        finalParams.previousOptions = params.previousOptions;
        finalParams.isChecked = params.isChecked;
    }
    const res = await axiosClient.get(`${prefix}/nslibrarybooklist`, {
        params: finalParams,
        headers: {
            'Content-Type': 'application/json',

        },
        paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
        }
    });
    return res.data;
}

export const getFsLibraryBookList = async (params = {}) => {
    const objectParams = Object.fromEntries(params.entries())
    console.log(objectParams)
    const finalParams = {
        ...objectParams,
        fingerprint: await getFingerprint()
    };

    const res = await axiosClient.get(`${prefix}/fslibrarybooklist`, {
        params: finalParams,
        headers: {
            'Content-Type': 'application/json',

        },
    });
    return res.data;
}

export const getNewLibraryBookList = async (params = {}) => {

    const res = await axiosClient.get(`${prefix}/newlibrarybooklist`, {
        params: params,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.data;
}

export const getLibraryBookDetail = async (isbn) => {
    const response = await axiosClient.get(`${prefix}/librarybookdetail/${isbn}`);
    return response.data;
};



export const searchBookApi = async (searchTerm, page = 1) => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const res = await axios.get(`${prefix}/search/${encodedSearchTerm}`, {
        params: { page }
    });
    return res.data;
}

export const getTopBorrowedBookList = async (params = {}) => {

    const res = await axiosClient.get(`${prefix}/topborrowedbooklist`, {
        params: params,
        headers: {
            'Content-Type': 'application/json',

        },
    });
    return res.data;
}







