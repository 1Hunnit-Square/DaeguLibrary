import { useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { memberRoleSelector } from "../../atoms/loginState";
import { useSearchParams } from "react-router-dom";
import { getContactList } from "../../api/memberApi";
import { Scrollbars } from 'react-custom-scrollbars-2';
import Loading from "../../routers/Loading";
import CheckNonLabel from "../common/CheckNonLabel";
import Button from "../common/Button";
import RadioBox from "../common/RadioBox";
import { useMutation, useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { getApplicantsByProgram, getProgramNotEnd } from "../../api/programApi";
import Modal from "../common/Modal";

const SmsSearchComponent = () => {
    const role = useRecoilValue(memberRoleSelector);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const [ searchKey , setSearchKey ] = useState({query: "", type: "전체"});
    const [ searchResults, setSearchResults ] = useState([]);
    const [ addList, setAddList ] = useState([]);
    const [ isOpen, setIsOpen] = useState(false);
    const tabStyle = "rounded-t-lg w-40 text-center border border-gray-300 py-2 px-2 bg-gray-200 text-gray-400 hover:bg-white hover:text-black";
    const tabClickStyle = "!border-b-white !bg-white !text-black !border-black";

    useEffect(()=>{
        if(role != "ADMIN"){
            alert("권한이 없습니다.");
            window.close();
            return;
        }

        if(!searchURLParams.get("tab"))
            setSearchURLParams({"tab":"normal"});

    },[])




    const searchMutation = useMutation({
        mutationFn: (memberNumber) => getContactList(memberNumber)
        ,
        onSuccess: (res) => {
            console.log(res);
            setAddList([]);
            setSearchResults(res);
        },
        onError: (error) => {
            console.log("회원 검색 오류:", error);
            alert("회원 검색에 실패했습니다. " + error.response?.data?.message);
        }
    });


    const programMutation = useMutation({
        mutationFn: (progNo) => getApplicantsByProgram(progNo)
        ,
        onSuccess: (res) => {
            console.log(res);
            setAddList([]);
            setSearchResults(res);
        },
        onError: (error) => {
            console.log("회원 검색 오류:", error);
            alert("회원 조회에 실패했습니다. " + error.response?.data?.message);
        }
    });

     const { data, isLoading, error } = useQuery({
    queryKey: ['programSearchList', searchURLParams.toString()],
    queryFn: () => getProgramNotEnd(),
    enabled: searchURLParams.get("tab") == "program"
    });
        

        const handleUrlParam = (tab) => {
            const urlParam = new URLSearchParams();
            urlParam.set("tab", tab);
            setSearchURLParams(urlParam);
        }
        

            const handleSearch = (e) => {
                setSearchKey(prev => ({
                    ...prev,
                    ["query"] : e.target.value
                }));
            }

            const handleRadio = (value) => {
                console.log(value);
                   setSearchKey(prev => ({
                    ...prev,
                    ["type"] : value
                }));
            }

            const ClickSearch = () =>{
                const paramData = {
                    query : searchKey.query,
                    option : "이름",
                    };
                paramData.checkSms = (searchKey.type == "수신동의")
                paramData.checkOverdue = (searchKey.type == "도서연체")


                searchMutation.mutate(paramData);
            }
        const smsCheckTo = (value) => {
            return value == "true" ? <span className="text-blue-500">수신동의</span> : <span className="text-red-500">수신거부</span>
        }

        const overDateTo = (date) => {
            if(!date){
                return "-";
            }
            const now = new Date();
            const start = new Date(date);
            now.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
		    const days = (now.getTime() - start.getTime()) / (1000*60*60*24);
            return <>{date}<span className="text-red-500"> (D+{days})</span></>;
        }

        const handleAddList = (e, number)=> {
            if(e.target.checked){
            setAddList(prev => [...prev, number]);
            } else {
            setAddList(prev => {
                const updated = prev.filter(v => v != number);
                return updated;
            })
            }

        }


        const handleAllClick = (e)=> {
            if(searchResults?.length){
                if(allCheck){
                setAddList([]);
                } else{
                setAddList(searchResults.map(v => v.phone));
                }
            }

        }

        const allCheck = useMemo(() => {
            if(searchResults?.length){
                const phoneList = _.uniq(searchResults.map(v => v.phone));
            return (_.isEqual(phoneList, addList));
            }
        },[addList]);

        const handlePost = () => {
            const newList = addList.map(num => num.replace(/-/g,""));
            if (window.opener) {
            window.opener.postMessage({
                type: 'CONTACT_SELECTED',
                newList,

            }, '*');
            window.close();
        }
        }
        
        const capacityToStr = (current, capacity) => {
           return(<>
            <span className={`font-bold ${capacity > 0 && current / capacity >= 0.8? "text-red-600" : "text-blue-700"}`}>
                {current}</span>{" / "}{capacity}
             </>);
        }

        const handleProgramList = (progNo) => {
            setIsOpen(true);
            programMutation.mutate(progNo);

        }

        const resetMutation = () => {
            searchMutation.reset();
            programMutation.reset();
            setSearchResults([]);
        }


        return(
        <div className="flex flex-col p-10">
        <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#00893B] text-[#00893B]">번호 검색</h2>
        <div className="flex">
            <span onClick={() => {handleUrlParam("normal"); resetMutation();}} className={`${tabStyle} ${searchURLParams.get("tab") == "normal"? tabClickStyle:""}`}>회원 검색</span>
            <span onClick={() => {handleUrlParam("program"); resetMutation();}} className={`${tabStyle} ${searchURLParams.get("tab") == "program"? tabClickStyle:""}`}>프로그램 조회</span>
        </div>
        <div className="flex flex-col my-10 gap-5">
           {(searchURLParams.get("tab") == "normal") &&
           <>
           <div className="flex gap-10 bg-gray-100 px-10 py-5 items-center">
                         
            <div className="flex flex-col gap-3 rounded">
                <span className = "font-bold">검색 유형을 선택하세요</span>
                <RadioBox list={["전체","수신동의","도서연체"]} onChange={handleRadio} value={searchKey.type}/>
                </div>
                    <div className="flex gap-3">
                            <input
                             type="text"
                             placeholder="이름을 입력하세요"
                             className="p-2 w-70 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                             value={searchKey.query}
                             onChange={handleSearch}
                             onKeyDown={(e) => {if (e.key === 'Enter' && !searchMutation.isPending) {e.preventDefault(); ClickSearch();}}}
                         />
                         <Button
                             onClick={ClickSearch}
                             disabled={searchMutation.isPending}
                             children="검색"
                         />
                         </div>
            </div>
             <div className={`min-w-200 shadow-md rounded-t-lg overflow-x-hidden ${!searchMutation.isIdle ? "rounded-b-lg" : ""}`}>
                <Scrollbars autoHeight autoHeightMax={400} >
                <table className="w-full bg-white">
                    <thead className="bg-[#00893B] text-white sticky top-0 z-50">
                        <tr>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap"><CheckNonLabel onChange={handleAllClick} checked={allCheck} checkboxClassName="mx-auto" inputClassName="w-4 h-4" /></th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">회원ID</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">회원번호</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">이름</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">전화번호</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">sms 수신여부</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">연체 시작일</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">연체 권수</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {searchMutation.isPending && <Loading />}
                        {!searchMutation.isIdle && searchResults?.length === 0? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                   회원 정보를 불러올 수 없습니다.
                                </td>
                            </tr>
                        ) : (
                            searchResults && searchResults.map((item, index) => {

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200`}>
                                        <td className="py-4 px-3 whitespace-nowrap text-center"><CheckNonLabel onChange={(e) => handleAddList(e, item.phone)} checked={addList.includes(item.phone)} checkboxClassName="mx-auto" inputClassName="w-4 h-4" /></td>
                                        <td className="py-4 px-3 max-w-20 min-w-20 whitespace-nowrap text-center">{item.mid}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.mno}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.name}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.phone}</td>
                                         <td className="py-4 px-3 whitespace-nowrap text-center">{smsCheckTo(item.checkSms)}</td>
                                          <td className="py-4 px-3 max-w-30 min-w-30 whitespace-nowrap text-center">{overDateTo(item.overdueDate)}</td>
                                           <td className="py-4 px-3 whitespace-nowrap text-center">{item.overdueCount}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    
                </table>
                </Scrollbars>
            </div> 
            <div className="flex justify-end items-cente">
            <Button onClick={handlePost} className={"disabled:bg-[#82c8a0] disabled:cursor-not-allowed"} disabled={addList?.length == 0} >번호 추가</Button>
            </div>
                                     </>}
        {isLoading && <Loading text={"목록 조회중..."} />}
        {(searchURLParams.get("tab") == "program") &&
         <div className={`min-w-200 shadow-md rounded-t-lg overflow-x-hidden ${!data ? "rounded-b-lg" : ""}`}>
                <Scrollbars autoHeight autoHeightMax={500} >
                <table className="w-full bg-white">
                    <thead className="bg-[#00893B] text-white sticky top-0 z-50">
                        <tr>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">순번</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">강사명</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">프로그램명</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">신청현황</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">강의상태</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">등록일</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        { !(data?.length > 0)? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                   프로그램 정보를 불러올 수 없습니다.
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200`} onClick={()=>handleProgramList(item.progNo)}>
                                        <td className="py-4 px-3 max-w-20 min-w-20 whitespace-nowrap text-center">{index+1}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.teachName}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.progName}</td>
                                         <td className="py-4 px-3 whitespace-nowrap text-center">{capacityToStr(item.current, item.capacity)}</td>
                                         <td className="py-4 px-3 whitespace-nowrap text-center">{item.status}</td>
                                          <td className="py-4 px-3 max-w-30 min-w-30 whitespace-nowrap text-center">{item.createdAt}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                </Scrollbars>
                <Modal isOpen={isOpen} onClose={()=>{ setIsOpen(false); resetMutation();}} title="회원 조회" className={"!max-w-2xl"}>
                    <div className="flex flex-col gap-5">
                    <h1 className="text-2xl font-bold text-center text-[#00893B]">신청자 목록</h1>
                       <div className={`min-w-100 shadow-md rounded-t-lg overflow-x-hidden ${!programMutation.isIdle ? "rounded-b-lg" : ""}`}>
        <Scrollbars autoHeight autoHeightMax={400} >
       <table className="w-full bg-white">
                    <thead className="bg-lime-600 text-white sticky top-0 z-50">
                        <tr>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap"><CheckNonLabel onChange={handleAllClick} checked={allCheck} checkboxClassName="mx-auto" inputClassName="w-4 h-4" /></th>
                            <th className="py-3 max-w-20 min-w-20 px-3 text-center text-sm uppercase whitespace-nowrap">회원ID</th>
                            <th className="py-3 max-w-20 min-w-20 px-3 text-center text-sm uppercase whitespace-nowrap">이름</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">전화번호</th>
                             <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">신청일</th>

                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {programMutation.isPending && <Loading />}
                        {!programMutation.isIdle && searchResults?.length === 0? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                   회원 정보를 불러올 수 없습니다.
                                </td>
                            </tr>
                        ) : (
                            searchResults && searchResults.map((item, index) => {

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200`}>
                                        <td className="py-4 px-3 whitespace-nowrap text-center"><CheckNonLabel onChange={(e) => handleAddList(e, item.phone)} checked={addList.includes(item.phone)} checkboxClassName="mx-auto" inputClassName="w-4 h-4" /></td>
                                        <td className="py-4 px-3 max-w-20 min-w-20 whitespace-nowrap text-center">{item.mid}</td>
                                        <td className="py-4 px-3 max-w-20 min-w-20 whitespace-nowrap text-center">{item.name}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.phone}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.applyAt}</td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    
                </table>
               </Scrollbars>
               </div>
               <div className="flex justify-end items-center">
            <Button onClick={handlePost} className={"disabled:bg-[#82c8a0] disabled:cursor-not-allowed"} disabled={addList?.length == 0} >번호 추가</Button>
            </div>
            </div>
                </Modal>
            </div> 
        }
        </div>
        </div>
        );
    }

export default SmsSearchComponent;