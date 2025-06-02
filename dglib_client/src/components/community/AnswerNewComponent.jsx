import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector, memberRoleSelector } from "../../atoms/loginState";
import Button from "../common/Button";
import axios from "axios";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const AnswerNewComponent = () => {
  const { qno } = useParams();
  const adminMid = useRecoilValue(memberIdSelector);
  const roleName = useRecoilValue(memberRoleSelector);
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  if (roleName !== "ADMIN") {
    return (
      <div className="text-center mt-20 text-red-600 font-semibold">
        관리자만 답변을 작성할 수 있습니다.
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      await axios.post(`/api/answer/${qno}`, {
        content,
        adminMid,
      });
      alert("답변이 등록되었습니다.");
      navigate(`/community/qna/${qno}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "답변 등록 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-6">답변 작성</h2>
      <ReactQuill
        value={content}
        onChange={setContent}
        placeholder="답변 내용을 입력해주세요..."
      />
      <div className="flex justify-end gap-2">
        <Button onClick={handleSubmit}>등록하기</Button>
        <Button onClick={() => navigate(-1)}>돌아가기</Button>
      </div>
    </div>
  );
};

export default AnswerNewComponent;
