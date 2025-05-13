import axios from 'axios';
import qs from 'qs';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.book}`;

export const getBookreco = async (genre) => {
    const res = await axios.get(`${prefix}/bookreco/${genre}`);
    return res.data;
}

export const getNsLibraryBookList = async (params = {}) => {
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
        console.log("previousQueries", finalParams.previousQueries);
        console.log("previousOptions", finalParams.previousOptions);
    }
    const res = await axios.get(`${prefix}/nslibrarybooklist`, {
        params: finalParams,
        paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
        }

    });
    return res.data;
}

export const getFsLibraryBookList = async (params = {}) => {
    const res = await axios.get(`${prefix}/fslibrarybooklist`, {
        params: params,
    });
    return res.data;
}



