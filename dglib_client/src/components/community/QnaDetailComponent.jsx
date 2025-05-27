import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_SERVER_HOST, API_ENDPOINTS } from "../../api/config";
import { memberIdSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";
import Button from "../common/Button";
import Loading from "../../routers/Loading";

const QnaDetailComponent = () => {
    const { qno } = useParams();
    const [question, setQuestion] = useState(null);
    const mid = useRecoilValue(memberIdSelector);
    const navigate = useNavigate();

    const isWriter = question && mid === question.writerId;
    const isVisible = question?.checkPublic || isWriter;
    const hasAnswer = !!question?.answer;

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await axios.get(
                    `${API_SERVER_HOST}${API_ENDPOINTS.qna}/${qno}`,
                    {
                        params: mid ? { requesterMid: mid } : {},
                    }
                );
                setQuestion(response.data);
            } catch (error) {
                console.error("QnA 상세 조회 실패:", error);
            }
        };

        fetchQuestion();
    }, [qno, mid]);

    if (!question) return <Loading />;
    if (!isVisible)
        return (
            <div className="text-center mt-10">
                🔒︎ 비공개 글입니다. 작성자만 열람할 수 있습니다.
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto text-sm">
            <h2 className="text-2xl font-bold text-center mb-6">{question.title}</h2>

            <table className="w-full border border-gray-300 mb-8">
                <tbody>
                    <tr className="border-b">
                        <td className="bg-gray-100 w-1/5 p-2 font-semibold">작성자</td>
                        <td className="p-2">{question.writerName}</td>
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
                    <h3 className="font-bold text-lg mb-2">답변</h3>
                    <table className="w-full border border-gray-300 mb-8">
                        <tbody>
                            <tr className="border-b">
                                <td className="bg-gray-100 w-1/5 p-2 font-semibold">답변자</td>
                                <td className="p-2">관리자</td>
                            </tr>
                            <tr className="border-b">
                                <td className="bg-gray-100 p-2 font-semibold">작성일</td>
                                <td className="p-2">
                                    {question.answer.postedAt?.substring(0, 10)}
                                </td>
                            </tr>
                            {question.answer.modifiedAt && (
                                <tr className="border-b">
                                    <td className="bg-gray-100 p-2 font-semibold">수정일</td>
                                    <td className="p-2">{question.answer.modifiedAt.substring(0, 10)}</td>
                                </tr>
                            )}
                            <tr>
                                <td className="bg-gray-100 p-2 font-semibold">내용</td>
                                <td className="p-2 whitespace-pre-wrap">
                                    {question.answer.content}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}

            <div className="flex justify-end gap-2">
                {isWriter && (
                    <>
                        <Button className="bg-gray-500 hover:bg-gray-600">수정하기</Button>
                        <Button className="bg-gray-500 hover:bg-gray-600">삭제하기</Button>
                    </>
                )}
                <Button onClick={() => navigate(-1)}>돌아가기</Button>
            </div>
        </div>
    );
};

export default QnaDetailComponent;
