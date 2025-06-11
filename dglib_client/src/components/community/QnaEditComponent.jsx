import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import { getQnaDetail } from "../../api/qnaApi";
import useQuillEditor from "../../hooks/useQuillEditor";
import { useUpdateQuestion } from "../../hooks/useQuestionMutation";

const QnaEditComponent = () => {
  const { qno } = useParams();
  const mid = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [checkPublic, setCheckPublic] = useState(true);

  const {
    content,
    setContent,
    QuillComponent
  } = useQuillEditor("", "내용을 입력해주세요...");

  const updateMutation = useUpdateQuestion();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const detail = await getQnaDetail(qno, mid);
        setTitle(detail.title);
        setContent(detail.content);
        
        console.log("공개?" + typeof detail.checkPublic, detail.checkPublic);
        
        setCheckPublic(detail.checkPublic);
      } catch (error) {
        alert("질문을 불러오는데 실패했습니다.");
        navigate("/community/qna");
      }
    };
    fetchData();
  }, [qno, mid, setContent, navigate]);

  const handleSubmit = () => {
    updateMutation.mutate({
      qno,
      updateData: {
        title,
        content,
        checkPublic,
        writerMid: mid
      }
    }, navigate(-1));
    
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-6">질문 수정하기</h2>

      <div className="mb-4">
        <label className="font-semibold">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 p-2 mt-1"
          placeholder="50자 이내 제목을 입력해주세요"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">공개 여부</label>
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
          className="px-4 py-2 bg-[#00893B] text-white rounded"
          onClick={handleSubmit}
        >
          수정하기
        </button>
      </div>
    </div>
  );
};

export default QnaEditComponent;
