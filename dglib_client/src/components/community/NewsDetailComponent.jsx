import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNewsDetail } from "../../api/newsApi";
import { useParams } from "react-router-dom";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";
import Loading from "../../routers/Loading";
import { memberIdSelector, checkAuthSelector } from "../../atoms/loginState";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import DOMPurify from 'dompurify';
import { API_SERVER_HOST } from "../../api/config";
import Download from "../common/Download";
import { imgReplace } from "../../util/commonUtil";
import { API_ENDPOINTS } from "../../api/config";
import { deleteNews } from "../../api/newsApi";
import ContentComponent from "../common/ContentComponent";


const NewsDetailComponent = () => {
    const { nno } = useParams();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['newsDetail', nno],
        queryFn: () => getNewsDetail(nno),
        refetchOnWindowFocus: false,
    });
    const navigate = useNavigate();

    const checkAuthLoadable = useRecoilValueLoadable(checkAuthSelector(data?.writerMid));

    const checkAuth = useMemo(() => checkAuthLoadable.contents, [checkAuthLoadable]);

    const handleDelete = () => {
        if (window.confirm("글을 정말로 삭제하시겠습니까?")) {
            deleteNews(nno)
                .then(() => {
                    alert("삭제가 완료되었습니다.");
                    navigate("/community/news");
                })
                .catch((error) => {
                    alert("삭제 중 오류가 발생했습니다.");
                    console.error(error);
                });
        }
    };

    return (
        <div className="my-10">
            {isLoading && <Loading />}
            <div className="max-w-4xl mx-auto text-sm">


                {data && <table className="w-full mb-8">
                    <thead>
                        <tr>
                            <th colSpan={6} className="text-xl border-[#00893B] border-t-2 border-b-2 text-center p-3">{data.title}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-300">
                            <td className="w-1/6 p-2 font-semibold text-center">작성자</td>
                            <td className="w-2/6 p-2 pl-3">{data.name}</td>

                            <td className="p-2 w-1/6 font-semibold text-center">조회수</td>
                            <td className="w-2/6 p-2 pl-3">{data.viewCount}</td>

                        </tr>
                        <tr className="border-b border-gray-300">
                            <td className="p-2 font-semibold text-center">작성일</td>
                            <td className="p-2 pl-3">{data.postedAt}</td>
                            {data.modifiedAt && <>
                                <td className="p-2 font-semibold text-center">수정일</td>
                                <td className="p-2 pl-3">{data.modifiedAt}</td></>}
                        </tr>

                        {!!data.imageDTO?.length && (

                            data.imageDTO.map((file, index) =>
                                <tr key={index} className="border-b border-gray-300">
                                    <td className="p-2 font-semibold text-center">첨부 파일 ({index + 1})</td>
                                    <td colSpan={4} className="p-2 pl-3">
                                        <Download link={`${API_SERVER_HOST}${API_ENDPOINTS.view}/${file.filePath}`} fileName={file.originalName} />
                                    </td>
                                </tr>
                            )


                        )}
                        <tr><td className={"p-2"}></td></tr>
                        <tr>
                            <td colSpan={6} className="border w-full border-gray-300 p-3">
                                <ContentComponent content={data.content} />
                                {/* <div className="min-h-50" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(imgReplace(data.content)) }} /> */}
                            </td>
                        </tr>
                    </tbody>
                </table>

                }

                <div className="flex justify-end gap-2">
                    {checkAuth && (
                        <>
                            <Button
                                onClick={() => navigate(`/community/news/edit/${nno}`)}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                수정하기
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                삭제하기
                            </Button>
                        </>
                    )}
                    <Button onClick={() => navigate("/community/news")}>돌아가기</Button>
                </div>
            </div>
        </div>
    );
}
export default NewsDetailComponent;