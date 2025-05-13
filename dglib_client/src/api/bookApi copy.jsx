import axios from 'axios';
import qs from 'qs';

const API_SERVER_HOST = 'http://localhost:8090';
const prefix = `${API_SERVER_HOST}/api/book`;

export const getBookreco = async (genre) => {
    const res = await axios.get(`${prefix}/bookreco/${genre}`);
    return res.data;
}

export const getLibraryBookList = async (params = {}) => {
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



    const res = await axios.get(`${prefix}/librarybooklist`, {
        params: finalParams,
        paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
        }

    });
    return res.data;
}

