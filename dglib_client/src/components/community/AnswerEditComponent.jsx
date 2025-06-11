import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import { getQnaDetail } from "../../api/qnaApi";
import useQuillEditor from "../../hooks/useQuillEditor";
import { useUpdateAnswer } from "../../hooks/useAnswerMutation";

const AnswerEditComponent = () => {
  const { qno } = useParams();
  const adminMid = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();

  const {
    content,
    setContent,
    QuillComponent
  } = useQuillEditor("", "답변 내용을 입력하세요...");

  const updateAnswerMutation = useUpdateAnswer(() => {
    navigate(`/community/qna/${qno}`);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const detail = await getQnaDetail(qno, adminMid);
        if (!detail.answer) {
          alert("수정할 답변이 없습니다.");
          navigate(-1);
        } else {
          setContent(detail.answer.content);
        }
      } catch (err) {
        alert("답변 데이터를 불러오는 데 실패했습니다.");
        navigate(-1);
      }
    };
    fetchData();
  }, [qno, adminMid, navigate, setContent]);

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    updateAnswerMutation.mutate({
      qno: parseInt(qno),
      answerData: {
        content,
        adminMid
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-6">답변 수정하기</h2>

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
          수정하기
        </button>
      </div>
    </div>
  );
};

export default AnswerEditComponent;
