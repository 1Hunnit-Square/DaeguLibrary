import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNoticeDetail } from "../../api/noticeApi";
import { useParams } from "react-router-dom";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";
import Loading from "../../routers/Loading";
import { memberIdSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";
import DOMPurify from 'dompurify';
import { API_SERVER_HOST } from "../../api/config";
import Download from "../common/Download";

const NoticeDetailComponent = () => {
const { ano } = useParams();
const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['noticeDetail', ano],
        queryFn: () => getNoticeDetail(ano),
        refetchOnWindowFocus: false,
    });
const navigate = useNavigate();
const mid = useRecoilValue(memberIdSelector);

const imgReplace = (content) => {
    const replaced = content.replace(
  /<img\s+[^>]*src="(\/[^"]+)"[^>]*>/g,
  (match, path) => match.replace(path, `${API_SERVER_HOST}${path}`));
  return replaced;
}
       return (
         <div className = "my-10">
         {isLoading && <Loading />}
            <div className="max-w-4xl mx-auto text-sm">
                
    
                 {data && <table className="w-full mb-8">
                    <th colSpan ={6} className="text-xl border-[#00893B] border-t-2 border-b-2 text-center p-3">{data.title}</th>
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
                        
                        {!!data.fileDTO.length && (
                            
                                data.fileDTO.map((file, index) => 
                                        <tr className="border-b border-gray-300">
                                        <td className="p-2 font-semibold text-center">첨부 파일 ({index+1})</td>
                                        <td className="p-2 pl-3">
                                            <Download link={`${API_SERVER_HOST}${file.filePath}`} fileName={file.originalName} />
                                        </td>
                                        </tr>
                                )
                                
                           
                        )}
                        <tr><td className={"p-2"}></td></tr>
                        <tr>
                            <td colSpan={6} className="border w-full border-gray-300 p-3">
                                <div className="min-h-50" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(imgReplace(data.content)) }} /></td>
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