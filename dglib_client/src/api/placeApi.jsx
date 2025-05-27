import axios from 'axios';
import { API_SERVER_HOST } from './config';

export const getReservationStatus = async (year, month) => {
  const res = await axios.get(`${API_SERVER_HOST}/api/places/status`, {
    params: { year, month }
  });
  return Array.isArray(res.data) ? res.data : [];
};

export const registerPlace = async (dto) => {
  const res = await axios.post(`${API_SERVER_HOST}/api/places/register`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

