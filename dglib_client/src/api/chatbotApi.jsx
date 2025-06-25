import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.chatbot}`;

export const getChatbotResponse = async (param) => {
    const res = await axiosClient.post(`${prefix}/chat`, param, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return res.data;
}

export const resetChatHistory = async (clientId) => {
    const res = await axiosClient.post(`${prefix}/reset`, { clientId }, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return res.data;
}

export const checkaccess = async () => {
    const res = await axiosClient.get(`${prefix}/checkaccess`, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return res.data;
}

export const pushFeedback = async (feedback) => {
    const res = await axiosClient.post(`${prefix}/feedback`, feedback, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return res.data;
}
