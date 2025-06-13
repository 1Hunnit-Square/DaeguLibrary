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
import { useMutation } from "@tanstack/react-query";

const SmsSearchComponent = () => {
    const role = useRecoilValue(memberRoleSelector);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const [ searchKey , setSearchKey ] = useState({query: "", type: "전체"});
    const [ searchResults, setSearchResults ] = useState([]);
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
        mutationFn: async (memberNumber) => {
            return await getContactList(memberNumber);
        },
        onSuccess: (res) => {
            console.log(res);
            setSearchResults(res);
        },
        onError: (error) => {
            console.log("회원 검색 오류:", error);
            alert("회원 검색에 실패했습니다. " + error.response?.data?.message);
        }
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
            return value == "true" ? "수신동의" : "수신거부"
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
            return `${date} (D+${days})`;
        }
        
        return(
        <div className="flex flex-col p-10">
        <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#00893B] text-[#00893B]">번호 검색</h2>
        <div className="flex">
            <span onClick={() => handleUrlParam("normal")} className={`${tabStyle} ${searchURLParams.get("tab") == "normal"? tabClickStyle:""}`}>기본 검색</span>
            <span onClick={() => handleUrlParam("program")} className={`${tabStyle} ${searchURLParams.get("tab") == "program"? tabClickStyle:""}`}>프로그램 검색</span>
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
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap"><CheckNonLabel checkboxClassName="mx-auto" inputClassName="w-4 h-4" /></th>
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
                            searchResults && [...searchResults, ...searchResults].map((item, index) => {

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer`} onClick={()=>handleClick(item)}>
                                        <td className="py-4 px-3 whitespace-nowrap text-center"><CheckNonLabel checkboxClassName="mx-auto" inputClassName="w-4 h-4" /></td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.mid}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.mno}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.name}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.phone}</td>
                                         <td className="py-4 px-3 whitespace-nowrap text-center">{smsCheckTo(item.checkSms)}</td>
                                          <td className="py-4 px-3 whitespace-nowrap text-center">{overDateTo(item.overdueDate)}</td>
                                           <td className="py-4 px-3 whitespace-nowrap text-center">{item.overdueCount}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    
                </table>
                </Scrollbars>
            </div>   
                                     </>}
        </div>
        </div>
        );
    }

export default SmsSearchComponent;