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
export const createQuestion = async (data) => {
  const response = await axios.post(`${prefix}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

//수정
export const updateQuestion = async (qno, updateData) => {
  const response = await axios.put(`${prefix}/${qno}`, updateData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

//삭제
export const deleteQuestion = async (qno, requesterMid) => {
  const response = await axios.delete(`${prefix}/${qno}`, {
    params: requesterMid ? { requesterMid } : {},
  });
  return response.data;
};


//답변생성
export const createAnswer = async(qno, answerData)=> {
  const response = await axios.post(`${prefix}/${qno}/answer`, answerData);
  return response.data;
};

//답변수정
export const updateAnswer = async(qno, answerData)=>{
  const response = await axios.put(`${prefix}/${qno}/answer`, answerData);
  return response.data;
};

//답변삭제
export const deleteAnswer = async (qno)=>{
  const response = await axios.delete(`${prefix}/${qno}/answer`);
  return response.data;
};