import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import useQuillEditor from "../../hooks/useQuillEditor";
import { useCreateAnswer } from "../../hooks/useAnswerMutation";

const AnswerNewComponent = () => {
  const { qno } = useParams();
  const adminMid = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();

  const { content, setContent, QuillComponent } = useQuillEditor("", "답변 내용을 입력하세요...");
  const createAnswerMutation = useCreateAnswer(() => navigate(`/community/qna/${qno}`));

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    createAnswerMutation.mutate({
      qno: parseInt(qno),
      content,
      adminMid,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-6">답변 작성하기</h2>

      <div className="mb-4">
        <label className="font-semibold">답변 내용</label>
        {QuillComponent}
      </div>

      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded"
          onClick={() => navigate(-1)}
        >
          돌아가기
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={handleSubmit}
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default AnswerNewComponent;
