import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_SERVER_HOST, API_ENDPOINTS } from "../../api/config";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import axios from "axios";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const QnaCreateComponent = () => {
  const mid = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [checkPublic, setCheckPublic] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_SERVER_HOST}${API_ENDPOINTS.qna}`, {
        title,
        content,
        checkPublic,
        memberMid: mid
      });
      alert("등록되었습니다.");
      navigate("/community/qna");
    } catch (error) {
      console.error("등록 실패", error);
      alert("등록에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h2 className="text-xl font-bold mb-6">도서관 Q&A 글쓰기</h2>

      <div className="mb-4">
        <label className="font-semibold">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 p-2 mt-1"
          placeholder="100자 이내 제목을 입력해주세요"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">공개여부</label>
        <div className="mt-1">
          <label className="mr-4">
            <input
              type="radio"
              name="checkPublic"
              checked={checkPublic === true}
              onChange={() => setCheckPublic(true)}
            />{" "}
            공개
          </label>
          <label>
            <input
              type="radio"
              name="checkPublic"
              checked={checkPublic === false}
              onChange={() => setCheckPublic(false)}
            />{" "}
            비공개
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="font-semibold">질문 내용</label>
        <ReactQuill value={content} onChange={setContent} />
      </div>

      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded"
          onClick={() => navigate(-1)}
        >
          돌아가기
        </button>
        <button
          className="px-4 py-2 bg-[#00893B] text-white rounded"
          onClick={() => setShowConfirm(true)}
        >
          등록하기
        </button>
      </div>

      {showConfirm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p className="mb-4">문의 내용을 등록하시겠습니까?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-[#00893B] text-white rounded"
                onClick={handleSubmit}
              >
                예
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowConfirm(false)}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QnaCreateComponent;
