import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNoticeDetail } from "../../api/noticeApi";
import { useParams } from "react-router-dom";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";
import Loading from "../../routers/Loading";
import { memberIdSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";

const NoticeDetailComponent = () => {
const { ano } = useParams();
const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['noticeDetail', ano],
        queryFn: () => getNoticeDetail(ano)
    });
const navigate = useNavigate();
const mid = useRecoilValue(memberIdSelector);

       return (
         <div className = "my-10">
         {isLoading && <Loading />}
            <div className="max-w-4xl mx-auto text-sm">
                
    
                 {data && <table className="w-full border border-gray-300 mb-8">
                    <th colSpan ={2} className="text-2xl font-bold text-center mb-6">{data.title}</th>
                    <tbody>
                        <tr className="border-b">
                            <td className="bg-gray-100 w-1/5 p-2 font-semibold">작성자</td>
                            <td className="p-2">{data.name}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="bg-gray-100 p-2 font-semibold">작성일</td>
                            <td className="p-2">{data.postedAt?.substring(0, 10)}</td>
                        </tr>
                        {data.modifiedAt && (
                            <tr className="border-b">
                                <td className="bg-gray-100 p-2 font-semibold">수정일</td>
                                <td className="p-2">{data.modifiedAt.substring(0, 10)}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="bg-gray-100 p-2 font-semibold">내용</td>
                            <td className="p-2 whitespace-pre-wrap">{data.content}</td>
                        </tr>
                    </tbody>
                </table>

                   }
    
                <div className="flex justify-end gap-2">
                    {mid && (
                        <>
                            <Button className="bg-gray-500 hover:bg-gray-600">수정하기</Button>
                            <Button className="bg-gray-500 hover:bg-gray-600">삭제하기</Button>
                        </>
                    )}
                    <Button onClick={() => navigate(-1)}>돌아가기</Button>
                </div>
                 </div>
           </div>
);
}
export default NoticeDetailComponent;