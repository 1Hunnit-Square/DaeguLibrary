import axios from 'axios';

const API_SERVER_HOST = 'http://localhost:8090';
const prefix = `${API_SERVER_HOST}/api/book`;

export const getBookreco = async (genre) => {
    const res = await axios.get(`${prefix}/bookreco/${genre}`);
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

