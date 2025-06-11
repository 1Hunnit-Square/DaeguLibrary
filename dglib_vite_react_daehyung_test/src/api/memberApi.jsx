import axios from 'axios';

const API_SERVER_HOST = 'http://localhost:8090';
const prefix = `${API_SERVER_HOST}/member`;

export const searchMemberNumber = async (memberNumber) => {
    const res = await axios.get(`${prefix}/searchmembernumber/${memberNumber}`);
    return res.data;
}