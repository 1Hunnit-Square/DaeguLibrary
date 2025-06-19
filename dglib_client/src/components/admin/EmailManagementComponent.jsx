import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import { getMailList } from "../../api/mailApi";
import Loading from "../../routers/Loading";
import { usePagination } from "../../hooks/usePage";
import EmailReadComponent from "./EmailReadComponent";
import { getMailDetail } from "../../api/mailApi";
import SelectComponent from "../common/SelectComponent";
import Button from "../common/Button";

const EmailComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);

    const { data: mailData = { content: [], totalElements: 0 }, isLoading, error, refetch } = useQuery({
        queryKey: ['mailList', searchURLParams.toString()],
        queryFn: () => {
                            const params = {
                                page: parseInt(searchURLParams.get("page") || "1"),
                                size: parseInt(searchURLParams.get("size") || "10"),
                                mailType: searchURLParams.get("mailType") || "RECIEVER",
                            };
        
                            if (searchURLParams.has("query")) {
                                params.query = searchURLParams.get("query") || "";
                                params.option = searchURLParams.get("option") || "회원ID";
                            }
                            console.log(params);
                            return getMailList(params);
                        }
    });

    const mailList = useMemo(() => mailData.content, [mailData.content]);
    const mailPage = useMemo(() => mailData.pageable, [mailData.pageable]);

    const { renderPagination } = usePagination(mailData, searchURLParams, setSearchURLParams, isLoading);

    const readToStr = (read) => {
        return read ? "읽음" : "읽지않음";
    }

    const fromToStr = (name, email) => {
            const addname = name ? name + " " : "";
            return addname+"<"+email+">"
        }
    
    const handleClick = (eid) => {
        window.open(`/emailRead/${eid}?mailType=${searchURLParams.get("mailType") || "RECIEVER"}`, "_blank", "width=1300,height=800");
    }

    const handleWrite = (eid) => {
        window.open(`/emailWrite`, "_blank", "width=1300,height=800");
    }

    useEffect(()=>{

    const handleMessage = (event) => {
    const { reload } = event.data;
    if(!reload)
        return;
    reload && refetch();  
    }

    window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    },[])

    const mailTypeMap = {
           "수신함": "RECIEVER",
            "발신함": "SENDER",
    }

return(
    <>
    <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}

            <h1 className="text-3xl font-bold mb-5 text-center text-[#00893B]">메일 목록</h1>
            <div className= "flex py-6 justify-between">
           <SelectComponent onChange={(e) => handleSelectChange('mailType', e)} value={searchURLParams.get("mailType") || "RECIEVER"}  options={mailTypeMap} />
            <Button onClick={handleWrite}>메일 쓰기</Button>
            </div>
            <div className="min-w-fit shadow-md rounded-lg overflow-x-hidden">
                <table className="min-w-full bg-white">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">순번</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">발신자</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">제목</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">확인여부</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">도착시간</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && mailList.length == 0? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    메일 정보를 불러올 수 없습니다.
                                </td>
                            </tr>
                        ) : (
                            mailList.map((item, index) => {

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer`} onClick={()=>{handleClick(item.eid)}}>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{mailPage.pageNumber * mailPage.pageSize  + index +1}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{fromToStr(item.fromName, item.fromEmail)}</td>
                                        <td className="py-4 px-3 max-w-70 min-w-70 truncate whitespace-nowrap text-center">{item.subject}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{readToStr(item.read)}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.sentTime}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            </div>
            {renderPagination()}
    </>
)
}

export default EmailComponent;