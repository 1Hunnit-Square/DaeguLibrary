import qs from 'qs';
import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import { getAuthHeader } from '../util/cookieUtil';
import axiosClient from '../util/axiosClient';
import axiosAuth from '../util/axiosClient';




const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.book}`;

export const getBookreco = async (genre) => {
    const res = await axios.get(`${prefix}/bookreco/${genre}`);
    return res.data;
}
export const getNsLibraryBookList = async (params = {}) => {
    const loginState = getAuthHeader();
    const { page = 1, size = 10 } = params;
    const finalParams = { page, size };
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
            'loginState': loginState && loginState.Authorization ? 'true' : 'false'
        },
        paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
        }
    });
    return res.data;
}

export const getFsLibraryBookList = async (params = {}) => {
    const loginState = getAuthHeader();
    const res = await axiosClient.get(`${prefix}/fslibrarybooklist`, {
        params: params,
        headers: {
            'Content-Type': 'application/json',
            'loginState': loginState && loginState.Authorization ? 'true' : 'false'
        },
    });
    return res.data;
}

export const getNewLibraryBookList = async (params = {}) => {
    const loginState = getAuthHeader();
    const res = await axiosClient.get(`${prefix}/newlibrarybooklist`, {
        params: params,
        headers: {
            'Content-Type': 'application/json',
            'loginState': loginState && loginState.Authorization ? 'true' : 'false'
        },
    });
    return res.data;
}

export const getLibraryBookDetail = async (librarybookid) => {
    const loginState = getAuthHeader();
    const res = await axiosClient.get(`${prefix}/librarybookdetail/${librarybookid}`, {
        headers: {
            'Content-Type': 'application/json',
            'loginState': loginState && loginState.Authorization ? 'true' : 'false'
        },
    });
    return res.data;
};



export const searchBookApi = async (searchTerm, page = 1) => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const res = await axios.get(`${prefix}/search/${encodedSearchTerm}`, {
        params: { page }
    });
    return res.data;
}







