import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import { delMailList, getMailList } from "../../api/mailApi";
import Loading from "../../routers/Loading";
import { usePagination } from "../../hooks/usePage";
import EmailReadComponent from "./EmailReadComponent";
import { getMailDetail } from "../../api/mailApi";
import SelectComponent from "../common/SelectComponent";
import Button from "../common/Button";
import RadioBox from "../common/RadioBox";
import { useItemSelection } from "../../hooks/useItemSelection";
import CheckNonLabel from "../common/CheckNonLabel";

const EmailComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const [ loading, setLoading ] = useState(false);

    const { data: mailData = { content: [], totalElements: 0 }, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['mailList', searchURLParams.toString()],
        queryFn: () => {
                            const params = {
                                page: parseInt(searchURLParams.get("page") || "1"),
                                size: parseInt(searchURLParams.get("size") || "10"),
                                mailType: searchURLParams.get("mailType") || "RECIEVER",
                                notRead: searchURLParams.get("read") == "all" ? "false" : "true",
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
    const { selectedItems, isAllSelected, handleSelectItem, handleSelectAll, resetSelection } = useItemSelection(mailList, 'eid');
    const { renderPagination } = usePagination(mailData, searchURLParams, setSearchURLParams, isLoading);

    const readToStr = (read) => {
        if(searchURLParams.get("mailType") == "SENDER"){
            return read ? "수신확인" : "미확인";
        } else
        return read ? "읽음" : "읽지않음";
    }

    const fromToStr = (name, email) => {
            const addname = name ? name + " " : "";
            return addname+"<"+email+">"
        }
    const ToListStr = (names, emails) => {
        return emails.map((email, index) => 
            fromToStr(names[index], email)
        ).join(", ");
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
    else{
    setLoading(true);
    refetch().finally(()=>setLoading(false));
    }   
    }

    window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    },[])

    useEffect(()=>{
    if(searchURLParams.get("mailType") == "SENDER"){
    const newParams = new URLSearchParams(searchURLParams);
    newParams.delete('read'); 
    setSearchURLParams(newParams); 
    }

    },[searchURLParams.toString()])

    const mailTypeMap = {
           "수신함": "RECIEVER",
            "발신함": "SENDER",
    }

    const handleNotRead = (e) =>{
        const newParams = new URLSearchParams(searchURLParams); 
        newParams.set('read', e); 
        setSearchURLParams(newParams); 
    }

    const handleDeleteList = () => {
        const checkConfirm = confirm("선택한 메일을 삭제하시겠습니까?");
        if(!checkConfirm){
            return;
        }

        setLoading(true);

        if(selectedItems?.size > 0){
        const paramData = new FormData();
        paramData.append("mailType", searchURLParams.get("mailType") || "RECIEVER");

        selectedItems.forEach(eid => {
            paramData.append("eidList", eid);
            console.log(eid);
        });

        delMailList(paramData).then(res => {
            alert("메일을 삭제하였습니다.");
            resetSelection();
            return refetch();

        }).catch(error=> {
            console.error(error);
            alert("메일 삭제에 오류가 발생하였습니다.");
        }).finally(()=> setLoading(false));
        }
    }

return(
    <>
    <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {(isLoading || loading) && (
                <Loading text="목록 갱신중.."/>
            )}

            <h1 className="text-3xl font-bold mb-5 text-center text-[#00893B]">메일 목록</h1>
            <div className= "flex py-6 justify-between">
            <div className = "flex items-center gap-3">
           <SelectComponent onChange={(e) => handleSelectChange('mailType', e)} value={searchURLParams.get("mailType") || "RECIEVER"}  options={mailTypeMap} />
            {searchURLParams.get("mailType") != "SENDER" && <RadioBox list={{"읽지않음":"not", "전체메일":"all"}} className={"w-4 h-4 text-lg"}
            onChange={(e) => handleNotRead(e)} value={ searchURLParams.get("read") || "not"} />}
            </div>
            <div className="flex gap-3 items-center">
            <Button className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed" onClick={handleDeleteList} disabled={selectedItems?.size == 0}>선택 삭제</Button>
            <Button onClick={handleWrite}>메일 쓰기</Button>
            </div>
            </div>
            <div className="min-w-fit shadow-md rounded-lg overflow-x-hidden">
                <table className="min-w-full bg-white">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-5 max-w-15 min-w-15 whitespace-nowrap">
                            <CheckNonLabel inputClassName="h-4 w-4" checked={isAllSelected} onChange={handleSelectAll} />
                            </th>
                            <th className="py-3 px-3 max-w-50 min-w-50 text-center text-sm uppercase whitespace-nowrap">{searchURLParams.get("mailType") == "SENDER" ? "받은 사람" : "보낸 사람"}</th>
                            <th className="py-3 px-3 max-w-90 min-w-90 text-center text-sm uppercase whitespace-nowrap">제목</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">{searchURLParams.get("mailType") == "SENDER" ? "수신여부" : "읽음여부"}</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">{searchURLParams.get("mailType") == "SENDER" ? "발송시간" : "도착시간"}</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && mailList.length == 0? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    메일이 존재하지 않습니다.
                                </td>
                            </tr>
                        ) : (
                            mailList.map((item, index) => {

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer`} onClick={()=>{handleClick(item.eid)}}>
                                          <td className="py-4 px-5 max-w-15 min-w-15 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <CheckNonLabel inputClassName="h-4 w-4" checked={selectedItems.has(item.eid)} onChange={(e) => handleSelectItem(e, item.eid)} />
                                          </td>
                                        <td className="py-4 px-3 max-w-50 min-w-50 truncate whitespace-nowrap">
                                            {(searchURLParams.get("mailType") == "SENDER") ? ToListStr(item.toName, item.toEmail): fromToStr(item.fromName, item.fromEmail)}</td>
                                        <td className="py-4 px-3 max-w-90 min-w-90 truncate whitespace-nowrap">{item.subject}</td>
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