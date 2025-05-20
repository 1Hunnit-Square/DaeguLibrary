import qs from 'qs';
import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import { getCookie } from '../util/cookieUtil';


const getAuthHeader = () => {

  const memberCookie = getCookie("auth")



  return memberCookie ? { 'Authorization': `Bearer ${memberCookie.accessToken}` } : {};
}

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.book}`;

export const getBookreco = async (genre) => {
    const res = await axios.get(`${prefix}/bookreco/${genre}`);
    return res.data;
}

export const getNsLibraryBookList = async (params = {}) => {
    const headers = getAuthHeader();
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

    const res = await axios.get(`${prefix}/nslibrarybooklist`, {
        params: finalParams,
        headers,
        paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
        }

    });
    return res.data;
}

export const getFsLibraryBookList = async (params = {}, mid) => { //변경
    const res = await axios.get(`${prefix}/fslibrarybooklist`, {
        params: params,
        headers: {
            'Authorization': mid
        }
    });
    return res.data;
}

export const getLibraryBookDetail = async (librarybookid, mid) => { //변경
    const res = await axios.get(`${prefix}/librarybookdetail/${librarybookid}`, {
        headers: {
            'Authorization': mid
        }
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







