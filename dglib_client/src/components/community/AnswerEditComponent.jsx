import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useQuery } from "@tanstack/react-query";
import { memberIdSelector, memberRoleSelector } from "../../atoms/loginState";
import { getQnaDetail } from "../../api/qnaApi";
import { useUpdateAnswer } from "../../hooks/useAnswerMutation";
import Loading from "../../routers/Loading";
import DOMPurify from "dompurify";
import QuillComponent from "../common/QuillComponent";
import { useEffect, useState } from "react";

const AnswerEditComponent = () => {
  const { qno } = useParams();
  const navigate = useNavigate();

  const adminMid = useRecoilValue(memberIdSelector);
  const role = useRecoilValue(memberRoleSelector);

  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    if (!adminMid) {
      alert("로그인이 필요합니다.");
      navigate("/login", { replace: true });
      setIsAuthorized(false);
    } else if (role !== "ADMIN") {
      alert("관리자만 답변을 수정할 수 있습니다.");
      navigate("/community/qna", { replace: true });
      setIsAuthorized(false);
    }
  }, [adminMid, role, navigate]);

  const { data: question, isLoading } = useQuery({
    queryKey: ["getQnaDetail", qno],
    queryFn: () => getQnaDetail(qno, adminMid),
    retry: false,
    enabled: isAuthorized,
  });

  const updateAnswerMutation = useUpdateAnswer(() => {
    navigate(`/community/qna/${qno}`);
  });

  const handleSubmit = (formData, post) => {
    formData.append("qno", qno);
    formData.append("adminMid", adminMid);

    updateAnswerMutation.mutate(
      { qno, answerData: formData },
      {
        onSettled: () => {
          post.setPost(false);
        },
      }
    );
  };

  if (!isAuthorized) return null;
  if (isLoading || !question) return <Loading text="질문 정보를 불러오는 중입니다..." />;
  if (!question.answer) {
    alert("수정할 답변이 없습니다.");
    navigate(-1);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto my-10">
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr>
            <th colSpan={6} className="text-xl border-[#00893B] border-t-2 border-b-2 text-center p-3">
              {question.title}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-300">
            <td className="w-1/6 p-2 font-semibold text-center">작성자</td>
            <td className="w-2/6 p-2 pl-3">{question.name}</td>
            <td className="w-1/6 p-2 font-semibold text-center">조회수</td>
            <td className="w-2/6 p-2 pl-3">{question.viewCount}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="w-1/6 p-2 font-semibold text-center">작성일</td>
            <td className="w-2/6 p-2 pl-3">{question.postedAt}</td>
            {question.modifiedAt && (
              <>
                <td className="w-1/6 p-2 font-semibold text-center">수정일</td>
                <td className="w-2/6 p-2 pl-3">{question.modifiedAt}</td>
              </>
            )}
          </tr>
          <tr>
            <td colSpan={6} className="border w-full border-gray-300 p-3">
              <div
                className="min-h-50"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(question.content),
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full mt-20 mb-8 text-sm">
        <thead>
          <tr>
            <th colSpan={6} className="text-xl border-[#00893B] border-t-2 border-b-2 text-center p-3">
              답변 수정
            </th>
          </tr>
        </thead>
      </table>

      <QuillComponent
        onParams={handleSubmit}
        onBack={() => navigate(-1)}
        useTitle={false}
        usePinned={false}
        usePublic={false}
        upload={[]}
        modMap={{ data: question.answer }}
      />
    </div>
  );
};

export default AnswerEditComponent;
