import axios from "axios";
import { API_SERVER_HOST, API_ENDPOINTS } from "./config";
import axiosClient from "../util/axiosClient";

const prefix = `${API_SERVER_HOST}${API_ENDPOINTS.qna}`;

//목록
export const getQnaList = async (params) => {
  const response = await axiosClient.get(`${prefix}`, { params });
  return response.data;
};

//상세 조회
export const getQnaDetail = async (qno, requesterMid) => {
  const response = await axiosClient.get(`${prefix}/${qno}`, {
    params: requesterMid ? { requesterMid } : {},
  });
  return response.data;
};

//등록
export const createQuestion = async (data) => {
  const response = await axiosClient.post(`${prefix}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

//수정
export const updateQuestion = async ({ qno, updateData }) => {
  const response = await axiosClient.put(`${prefix}/${qno}`, updateData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// 삭제
export const deleteQuestion = (qno, requesterMid) => {
  console.log("삭제 요청 URL:", `${prefix}/${qno}`);
  console.log("요청자:", requesterMid);

  return axiosClient.delete(`${prefix}/${qno}`, {
    params: requesterMid ? { requesterMid } : {},
  });
};

//답변생성
export const createAnswer = async (answerData) => {
  const response = await axiosClient.post(`${API_SERVER_HOST}/api/answer`, answerData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

//답변수정
export const updateAnswer = async ({ qno, answerData }) => {
  const response = await axiosClient.put(`${API_SERVER_HOST}/api/answer/question/${qno}`, answerData, {
    headers: {
      "Content-Type": "multipart/form-data", // 꼭 넣어야 함
    },
  });
  return response.data;
};

//답변삭제
export const deleteAnswer = async (ano, requesterMid) => {
  const response = await axiosClient.delete(`${API_SERVER_HOST}/api/answer/${ano}`, {
    data: { requesterMid },
  });
  return response.data;
};

//관리자 목록
export const getAdminQnaList = async (params) => {
  const response = await axiosClient.get(`${prefix}/admin`, { params });
  return response.data;
};
