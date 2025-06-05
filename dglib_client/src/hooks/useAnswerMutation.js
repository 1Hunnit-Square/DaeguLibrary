import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAnswer, updateAnswer, deleteAnswer } from "../api/qnaApi";

export const useCreateAnswer = (onSuccess = () => { }, onError = () => { }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerData) => createAnswer(answerData),
    onSuccess: (_, variables) => {
      alert("답변이 등록되었습니다.");
      queryClient.invalidateQueries(["qnaDetail", variables.qno]);
      onSuccess();
    },
    onError: (error) => {
      alert(error.response?.data?.message || "답변 등록 실패");
      onError();
    }
  });
};

export const useUpdateAnswer = (onSuccess = () => { }, onError = () => { }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ qno, answerData }) => updateAnswer({ qno, answerData }),
    onSuccess: (_, variables) => {
      alert("답변이 수정되었습니다.");
      queryClient.invalidateQueries(["qnaDetail", variables.qno]);
      onSuccess();
    },
    onError: (error) => {
      alert(error.response?.data?.message || "답변 수정 실패");
      onError();
    }
  });
};

export const useDeleteAnswer = (onSuccessCallback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ano, requesterMid, qno }) =>
      deleteAnswer(ano, requesterMid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["qnaDetail", variables.qno]);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      alert(err.response?.data?.message || "삭제 실패");
    }
  });
};