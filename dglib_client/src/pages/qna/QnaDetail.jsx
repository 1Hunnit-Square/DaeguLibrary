import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS, API_SERVER_HOST } from "../../api/config";
import { useLogin } from "../../hooks/useLogin";



const QnaDetail = () => {
    const { qno } = useParams();
    const [question, setQuestion] = useState(null);
    const { isLogin, loginInfo } = useLogin(); // 로그인 정보 가져오기

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const params = isLogin ? { requesterMid: loginInfo.mid } : {};

                const response = await axios.get(`${API_SERVER_HOST}${API_ENDPOINTS.qna}/${qno}`, {
                    params
                });

                setQuestion(response.data);
            } catch (error) {
                console.error("❌ QnA 상세 조회 실패:", error);
            }
        };

        fetchQuestion();
    }, [qno, isLogin, loginInfo]);

    if(!question) return <div>불러오는 중...</div>;

    return(
        <div className="px-6 py-4">
            <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
            <div className="mb-2 text-sm text-gray-500">
                작성자: {question.memberMid} | 등록일: {question.postedAt?.substring(0, 10)} | 조회수: {question.viewCount}
            </div>
            <div className="border-t pt-4">{question.content}</div>
        </div>
    );
};

export default QnaDetail;
