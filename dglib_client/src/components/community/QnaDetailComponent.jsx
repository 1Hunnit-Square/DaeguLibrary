import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { memberIdSelector, memberRoleSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";
import Button from "../common/Button";
import Loading from "../../routers/Loading";
import { useDeleteQuestion } from "../../hooks/useQuestionMutation";
import { getQnaDetail } from "../../api/qnaApi";
import { useDeleteAnswer } from "../../hooks/useAnswerMutation";
import DOMPurify from 'dompurify';


const QnaDetailComponent = () => {
  const { qno } = useParams();
  console.log("params로 받은 qno:", qno);
  const mid = useRecoilValue(memberIdSelector);
  const roleName = useRecoilValue(memberRoleSelector);
  const navigate = useNavigate();

  const { data: question, isLoading, isError } = useQuery({
    queryKey: ["qnaDetail", qno, mid],
    queryFn: async () => { 
      
      return await getQnaDetail(qno, mid).then(res =>  res)
      .catch(err => {
        if(err.response?.data?.message == "Not Access Question")
          return null;
        else
          throw err;
      })
     },
    enabled: !!qno,
    retry: false,
  });

  const renderAdminButtons = () => (
    <>
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
    </>
  );

  const renderAdminEditButtons = () => (
    <>
      <Button
        className="bg-gray-500 hover:bg-red-600"
        onClick={handleDelete}
      >
        전체삭제</Button>
      <Button
        className="bg-blue-400 hover:bg-blue-500"
        onClick={() => navigate(`/community/qna/answer/edit/${qno}`)}
      >
        답변수정
      </Button>
    </>
  )

  const renderAnswerDeleteButtons = () => (
    <Button
      className="bg-red-500 hover:bg-red-600"
      onClick={handleAnswerDelete}
    >
      답글삭제
    </Button>
  )

  const renderOwnerButtons = () => (
    <>
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
    </>
  );

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

    if (window.confirm("정말로 삭제하시겠습니까?")) {
      deleteAnswerMutation.mutate({ ano, requesterMid: mid, qno });
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

  if(!question && isLoading) return (<Loading />);
  if (!question && !isLoading) {
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

 

  console.log("로그인 ID:", mid);
  console.log("질문 작성자 ID:", question.writerMid);
  const isOwner = mid === question.writerMid;
  const hasAnswer = !!question.answer;
  const isAdmin = roleName == "ADMIN";


  return (
    <div className="max-w-4xl mx-auto my-10">
      {isLoading && <Loading />}
    
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
            <td className="p-2 w-1/6 font-semibold text-center">조회수</td>
            <td className="w-2/6 p-2 pl-3">{question.viewCount}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="p-2 font-semibold text-center">작성일</td>
            <td className="p-2 pl-3">{question.postedAt}</td>
            {question.modifiedAt &&
              <>
                <td className="p-2 font-semibold text-center">수정일</td>
                <td className="p-2 pl-3">{question.modifiedAt}</td>
              </>
            }
          </tr>
          <tr><td className={"p-2"}></td></tr>
          <tr>
            <td colSpan={6} className="border w-full border-gray-300 p-3">
              <div 
              className="min-h-50" 
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(question.content) 
                }} 
                />
                </td>
          </tr>
        </tbody>
      </table>

      {hasAnswer && (
        <div>
          <table className="w-full mt-20 mb-8 text-sm">
            <thead>
              <tr>
                <th colSpan={6} className="text-xl border-[#00893B] border-t-2 border-b-2 text-center p-3">답변</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="w-1/6 p-2 font-semibold text-center">작성자</td>
                <td className="w-2/6 p-2 pl-3">관리자</td>

                <td className="p-2 w-1/6 font-semibold text-center"></td>
                <td className="w-2/6 p-2 pl-3"></td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold text-center">작성일</td>
                <td className="p-2 pl-3">{question.answer.postedAt}</td>
                {question.answer.modifiedAt && <>
                  <td className="p-2 font-semibold text-center">수정일</td>
                  <td className="p-2 pl-3">{question.answer.modifiedAt}</td></>}
              </tr>
              <tr><td className={"p-2"}></td></tr>
              <tr>
                <td colSpan={6} className="border w-full border-gray-300 p-3">
                  <div className="min-h-50" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.answer.content) }} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end flex-wrap gap-2 mb-6">
        {isOwner && renderOwnerButtons()}
        {!hasAnswer && isAdmin && renderAdminButtons()}
        {hasAnswer && isAdmin && (
          <>
            {renderAdminEditButtons()}
            {renderAnswerDeleteButtons()}
          </>
        )}
      </div>


      <div className="flex justify-center gap-2">
        <Button onClick={() => navigate(`/community/qna`)}>목록</Button>
      </div>
    </div>
  );
};

export default QnaDetailComponent;
