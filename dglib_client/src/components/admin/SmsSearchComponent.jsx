import { useEffect, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { memberRoleSelector } from "../../atoms/loginState";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import SearchSelectComponent from "../common/SearchSelectComponent";
import { getMemberList } from "../../api/memberApi";
import { usePagination } from "../../hooks/usePage";

const SmsSearchComponent = () => {
    const role = useRecoilValue(memberRoleSelector);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const tabStyle = "w-40 text-center border border-gray-300 py-2 px-2 bg-gray-200 text-gray-400 hover:bg-white hover:text-black";
    const tabClickStyle = "!border-b-white !bg-white !text-black !border-black";

    const { handleSearch } = useSearchHandler({tab: searchURLParams.get("tab") || null});
    useEffect(()=>{
        if(role != "ADMIN"){
            alert("권한이 없습니다.");
            window.close();
            return;
        }

        if(!searchURLParams.get("tab"))
            setSearchURLParams({"tab":"normal"});

    },[])

     const { data: memberData = { content: [], totalElements: 0 }, isLoading, error, refetch } = useQuery({
            queryKey: ['smsSearchList', searchURLParams.toString()],
            queryFn: () => {
                                const params = {
                                page: parseInt(searchURLParams.get("page") || "1"),
                                size: parseInt("10"),
                                state: searchURLParams.get("state") || "ALL",
                                role: searchURLParams.get("role") || "ALL",
                                sortBy: searchURLParams.get("sortBy") || "mno",
                                orderBy: searchURLParams.get("orderBy") || "desc",
                                };
            
                                if (searchURLParams.has("query")) {
                                    params.query = searchURLParams.get("query") || "";
                                    params.option = searchURLParams.get("option") || "회원ID";
                                }
                                console.log(params);
                                return getMemberList(params);
                            }
        });

        const memberList = useMemo(() => memberData.content, [memberData.content]);
            
        
        const { renderPagination } = usePagination(memberData, searchURLParams, setSearchURLParams, isLoading);

        const handleUrlParam = (tab) => {
            const urlParam = new URLSearchParams();
            urlParam.set("tab", tab);
            setSearchURLParams(urlParam);
        }

        
        
        return(
        <div className="flex flex-col p-10">
        <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#00893B] text-[#00893B]">번호 검색</h2>
        <div className="flex">
            <span onClick={() => handleUrlParam("normal")} className={`${tabStyle} ${searchURLParams.get("tab") == "normal"? tabClickStyle:""}`}>기본 검색</span>
            <span onClick={() => handleUrlParam("program")} className={`${tabStyle} ${searchURLParams.get("tab") == "program"? tabClickStyle:""}`}>프로그램 검색</span>
        </div>
        <div className="flex flex-col my-10 gap-10">
           {(searchURLParams.get("tab") == "normal") &&
           <>
           <SearchSelectComponent options={["회원ID", "이름","회원번호"]} defaultCategory={searchURLParams.get("option") || "회원ID"} selectClassName="mr-2"
                                     dropdownClassName="w-32"
                                     className="w-[50%]"
                                     inputClassName="w-full bg-white"
                                     buttonClassName="right-2 top-5"
                                     input={searchURLParams.get("query") || ""}
                                     handleSearch={handleSearch} />

             <div className="min-w-fit shadow-md rounded-lg overflow-x-hidden">
                <table className="min-w-full bg-white">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">순번</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">회원ID</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">회원번호</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">이름</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">전화번호</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && memberList.length == 0? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    회원 정보를 불러올 수 없습니다.
                                </td>
                            </tr>
                        ) : (
                            memberList.map((item, index) => {

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer`} onClick={()=>handleClick(item)}>
                                        <td className="py-4 px-3 whitespace-nowrap text-center"></td>
                                        <td className="py-4 px-3 max-w-30 min-w-30 whitespace-nowrap text-center">{item.mid}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.mno}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.name}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.phone}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>


                                     { renderPagination() }
                                     </>}
        </div>
        </div>
        );
    }

export default SmsSearchComponent;