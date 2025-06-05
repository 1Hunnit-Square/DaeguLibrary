import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { memberIdSelector, memberRoleSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";
import Button from "../common/Button";
import Loading from "../../routers/Loading";
import { useDeleteQuestion, useUpdateQuestion } from "../../hooks/useQuestionMutation";
import { getQnaDetail } from "../../api/qnaApi";
import { useDeleteAnswer } from "../../hooks/useAnswerMutation";

const QnaDetailComponent = () => {
  const { qno } = useParams();
  console.log("params로 받은 qno:", qno);
  const mid = useRecoilValue(memberIdSelector);
  const roleName = useRecoilValue(memberRoleSelector);
  const navigate = useNavigate();

  const { data: question, isLoading, isError } = useQuery({
    queryKey: ["qnaDetail", qno, mid],
    queryFn: () => getQnaDetail(qno, mid),
    enabled: !!qno,
    retry: false,
    onError: (err) => {
      const message = err.response?.data?.message;
      alert(message || "QnA 조회하지 못했습니다.");
    },
  });

  const renderAdminButtons = () => (
    <div className="flex justify-end gap-2">
      <Button
        className="bg-red-500 hover:bg-red-600"
        onClick={handleDelete}
      >
        질문삭제</Button>
      <Button
        className="bg-orange-400 hover:bg-orange-500"
        onClick={() => navigate(`/community/qna/answer/${qno}`)}
      >
        답변달기
      </Button>
    </div>
  );

  const renderAdminEditButtons = () => (
    <div className="flex justify-end gap-2">
      <Button
        className="bg-red-500 hover:bg-red-600"
        onClick={handleDelete}
      >
        전체삭제</Button>
      <Button
        className="bg-blue-400 hover:bg-blue-500"
        onClick={() => navigate(`/community/qna/answer/edit/${qno}`)}
      >
        답변수정
      </Button>
    </div>
  )

  const renderAnswerDeleteButtons = () => (
    <div className="gap-2">
      <Button
        className="bg-red-500 hover:bg-red-600"
        onClick={handleAnswerDelete}
      >
        답글삭제
      </Button>
    </div>
  )

  const renderOwnerButtons = () => (
    <div className="flex justify-end gap-2">
      <Button
        className="bg-red-500 hover:bg-red-600"
        onClick={handleDelete}
      >
        삭제하기
      </Button>
      <Button
        className="bg-blue-400 hover:bg-blue-500"
        onClick={() => navigate(`/community/qna/edit/${qno}`)}
      >
        수정하기
      </Button>
    </div>
  );

  const handleEdit = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    updateMutate({
      qno,
      title,
      content,
      checkPublic,
      memberMid: mid,
    });
  };

  const handleDelete = () => {
    console.log("삭제 할 qno:", qno);
    console.log("삭제 하는 requesterMid:", mid);
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      deleteQuestionMutation.mutate({ qno, requesterMid: mid });
    }
  };

  const handleAnswerDelete = () => {
    console.log("삭제할 답변 ano:", question?.answer?.ano);
    console.log("question.answer 전체:", question.answer);

    const ano = question?.answer?.ano;
    if (!ano) {
      alert("해당하는 답변을 찾지 못 했습니다.");
      return;
    }
    // if (window.confirm("답글을 삭제하시겠습니까?")) {
    //   deleteAnswerMutation.mutate(ano);
    // }
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      deleteAnswerMutation.mutate({ ano, requesterMid: mid });
    }
  };

  const deleteQuestionMutation = useDeleteQuestion(() => {
    alert("삭제되었습니다.");
    navigate("/community/qna");
  });

  const deleteAnswerMutation = useDeleteAnswer(() => {
    alert("삭제되었습니다.");
    navigate(`/community/qna/${qno}`);
  })

  if (isLoading) return <Loading text="QnA 정보를 불러오는 중입니다..." />;

  if (isError) {
    return (
      <div>
        <div className="text-center mt-20 text-red-600 font-semibold">
          이 글은 비공개이거나 존재하지 않습니다.
        </div>
        <div className="flex justify-center mt-8">
          <Button onClick={() => navigate(-1)}>목록</Button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  console.log("로그인 ID:", mid);
  console.log("질문 작성자 ID:", question.writerMid);
  const isOwner = mid === question.writerMid;
  const hasAnswer = !!question.answer;
  const isAdmin = roleName == "ADMIN";

  return (
    <div className="max-w-4xl mx-auto text-sm">
      <h2 className="text-2xl font-bold text-center mb-6">{question.title}</h2>

      <table className="w-full border border-gray-300 mb-8">
        <tbody>
          <tr className="border-b">
            <td className="bg-gray-100 w-1/5 p-2 font-semibold">작성자</td>
            <td className="p-2">{question.name}</td>
          </tr>
          <tr className="border-b">
            <td className="bg-gray-100 p-2 font-semibold">작성일</td>
            <td className="p-2">{question.postedAt?.substring(0, 10)}</td>
          </tr>
          {question.modifiedAt && (
            <tr className="border-b">
              <td className="bg-gray-100 p-2 font-semibold">수정일</td>
              <td className="p-2">{question.modifiedAt.substring(0, 10)}</td>
            </tr>
          )}
          <tr>
            <td className="bg-gray-100 p-2 font-semibold">내용</td>
            <td className="p-2 whitespace-pre-wrap">{question.content}</td>
          </tr>
        </tbody>
      </table>

      {hasAnswer && (
        <>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg mb-2">답변</h3>
            {hasAnswer && isAdmin && renderAnswerDeleteButtons()}
          </div>
          <table className="w-full border border-gray-300 mb-8">
            <tbody>
              <tr className="border-b">
                <td className="bg-gray-100 w-1/5 p-2 font-semibold">답변자</td>
                <td className="p-2">관리자</td>
              </tr>
              <tr className="border-b">
                <td className="bg-gray-100 p-2 font-semibold">작성일</td>
                <td className="p-2">{question.answer.postedAt?.substring(0, 10)}</td>
              </tr>
              {question.answer.modifiedAt && (
                <tr className="border-b">
                  <td className="bg-gray-100 p-2 font-semibold">수정일</td>
                  <td className="p-2">{question.answer.modifiedAt.substring(0, 10)}</td>
                </tr>
              )}
              <tr>
                <td className="bg-gray-100 p-2 font-semibold">내용</td>
                <td className="p-2 whitespace-pre-wrap">{question.answer.content}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {!hasAnswer && isAdmin && renderAdminButtons()}
      {hasAnswer && isAdmin && renderAdminEditButtons()}
      {isOwner && renderOwnerButtons()}


      <div className="flex justify-center gap-2">
        <Button onClick={() => navigate(`/community/qna`)}>목록</Button>
      </div>
    </div>
  );
};

export default QnaDetailComponent;
