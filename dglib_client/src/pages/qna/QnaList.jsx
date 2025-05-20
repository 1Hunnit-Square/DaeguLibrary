import { useEffect, useState } from "react";
import axios from "axios";
import { API_SERVER_HOST, API_ENDPOINTS } from "../../api/config";
import Button from "../../components/common/Button";



const LockIcon = () => <span style={{ color: 'gray' }}>🔒︎</span>;

const StatusBadge = ({ status }) => {
    const badgeStyle = {
        display: "inline-block",
        padding: "2px 7px",
        borderRadius: "20px",
        fontSize: "12px",
        color: "white",
        fontWeight: "bold",
        backgroundColor: status === "완료" ? "#f1b300" : "#999999",
    };
    return <span style={badgeStyle}>{status}</span>
}

const QnaList = () => {
    const [qnaItems, setQnaItems] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    useEffect(() => {
        fetchData();
    }, [page, size]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_SERVER_HOST}${API_ENDPOINTS.qna}`, {
                params: {
                    page,
                    size,
                    requesterMid: "user1",
                },
            });

            console.log("받은 데이터", response.data);

            const contentArray = Array.isArray(response.data?.content)
                ? response.data.content
                : [];

            setQnaItems(contentArray);
        } catch (error) {
            console.error("질문 목록 불러오기 실패", error);
            setQnaItems([]);
        }
    };

    return (
        <div style={{ padding: "20px" }}>

            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
                tableLayout: "fixed"  // 열 비율 균등 분배
            }}>
                <colgroup>
                    <col style={{ width: "5%" }} />    {/* 번호 */}
                    <col style={{ width: "10%" }} />   {/* 처리상황 */}
                    <col style={{ width: "35%" }} />   {/* 제목 */}
                    <col style={{ width: "10%" }} />    {/* 공개여부 */}
                    <col style={{ width: "8%" }} />   {/* 작성자 */}
                    <col style={{ width: "8%" }} />   {/* 작성일 */}
                    <col style={{ width: "8%" }} />    {/* 조회수 */}
                </colgroup>
                <thead>
                    <tr style={{ borderBottom: "2px solid #00893B", borderTop: "2px solid #00893B" }}>
                        <th style={{ padding: "10px" }}>번호</th>
                        <th style={{ padding: "10px" }}>처리상황</th>
                        <th style={{ padding: "10px" }}>제목</th>
                        <th style={{ padding: "10px" }}>공개여부</th>
                        <th style={{ padding: "10px" }}>작성자</th>
                        <th style={{ padding: "10px" }}>작성일</th>
                        <th style={{ padding: "10px" }}>조회수</th>
                    </tr>
                </thead>
                <tbody>
                    {qnaItems.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                등록된 글이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        qnaItems.map((item) => (
                            <tr key={item.qno} style={{ borderBottom: "1px solid #ddd", textAlign: "center" }}>
                                <td >{item.qno}</td>
                                <td><StatusBadge status={item.status} /></td>
                                <td style={{ textAlign: "left", padding: "12px 8px", paddingLeft: "20px" }}>{item.title}</td>
                                <td>{item.checkPublic ? "" : <LockIcon />}</td>
                                <td>{item.memberMid}</td>
                                <td>{item.postedAt?.substring(0, 10)}</td>
                                <td>{item.viewCount}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>


            <div>
                <Button
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className="mr-2"
                >
                   {'<'}
                </Button>

                <span className="mx-2">{page + 1}</span>

                <Button
                    onClick={() => setPage(prev => Math.max(prev + 1, 0))}
                    disabled={qnaItems.length < size}
                    className="mr-2"
                >
                    {'>'}
                </Button>
            </div>

        </div>
    );
};

export default QnaList;
