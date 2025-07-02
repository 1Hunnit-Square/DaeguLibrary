import axios from 'axios';
import { API_SERVER_HOST, API_ENDPOINTS } from './config';
import axiosClient from '../util/axiosClient';

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.metrics}`;

export const getMetricsStats = async () => {
    const res = await axios.get(`${prefix}/getMetrics`);
    return res.data;
}