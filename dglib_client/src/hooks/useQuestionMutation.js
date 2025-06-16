import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuestion, updateQuestion, deleteQuestion } from "../api/qnaApi";
import { useNavigate } from "react-router-dom";

export const useCreateQuestion = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      alert("질문이 등록되었습니다.");
      navigate("/community/qna");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "등록 실패");
    }
  });
};

export const useUpdateQuestion = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: (_, variables) => {
      alert("질문이 수정되었습니다.");
      navigate(`/community/qna/${variables.qno}`, { replace: true });
    }
  });
};

export const useDeleteQuestion = (onSuccessCallback) => {
  return useMutation({
    mutationFn: ({ qno, requesterMid }) =>
      deleteQuestion(qno, requesterMid),
    onSuccess: () => {
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      alert(err.response?.data?.message || "삭제 실패");
    }
  });
};