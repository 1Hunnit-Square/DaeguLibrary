import axios from "axios";
import { API_SERVER_HOST, API_ENDPOINTS } from "./config";

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.qna}`;

//조회
export const getQnaList = async (params) => {
  const response = await axios.get(`${prefix}`, { params });
  return response.data;
};

//상세 조회
export const getQnaDetail = async (qno, requesterMid) => {
  const response = await axios.get(`${prefix}/${qno}`, {
    params: requesterMid ? { requesterMid } : {},
  });
  return response.data;
};

//등록
export const createQna = async (data) => {
  const response = await axios.post(`${prefix}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

//수정
export const updateQna = async (qno, updateData) => {
  const response = await axios.put(`${prefix}/${qno}`, updateData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

//삭제
export const deleteQna = async (qno, requesterMid) => {
  const response = await axios.delete(`${prefix}/${qno}`, {
    params: requesterMid ? { requesterMid } : {}
  });
  return response.data;
};

