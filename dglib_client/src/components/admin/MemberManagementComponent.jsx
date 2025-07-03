import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import { usePagination } from "../../hooks/usePage";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getMemberList } from "../../api/memberApi";
import { useQuery } from "@tanstack/react-query";
import Modal from "../common/Modal";
import MemberModifyComponent from "./MemberModifyComponent";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import Button from "../common/Button";
import CheckBox from "../common/CheckBox";
import { EllipseSeries } from "@amcharts/amcharts5/.internal/charts/stock/drawing/EllipseSeries";

const MemberManagementComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const [isOpen, setIsOpen]= useState(false);
    const [ modData, setModData ] = useState({});


    const { data: memberData = { content: [], totalElements: 0 }, isLoading, error, refetch } = useQuery({
        queryKey: ['memberList', searchURLParams.toString()],
        queryFn: () => {
                            const params = {
                                page: parseInt(searchURLParams.get("page") || "1"),
                                size: parseInt(searchURLParams.get("size") || "10"),
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
    const memberPage = useMemo(() => memberData.pageable, [memberData.pageable]);
    

    const { renderPagination } = usePagination(memberData, searchURLParams, setSearchURLParams, isLoading);

    const roleMap = {
            "전체권한": "ALL",
            "정회원": "USER",
            "사서" : "MANAGER",
            "관리자" : "ADMIN",
        };
    const stateMap = {
            "전체계정": "ALL",
            "일반계정": "NORMAL",
            "제재계정" : "OVERDUE",
            "정지계정" : "PUNISH",
            "탈퇴계정" : "LEAVE"
        };
    const sizeMap = {
            "10개씩": "10",
            "50개씩": "50",
            "100개씩": "100"
        };

    const sortMap = {
            "회원번호": "mno",
            "이름순":"name"
        };
     const orderMap = {
            "오름차순": "asc",
            "내림차순": "desc"
        };

        const { handleSearch } = useSearchHandler({ additionalParams : {"state" : searchURLParams.get("state"), "role" : searchURLParams.get("role")}});


    const filterValue = (value) => {
        const roundStyle ="font-semibold px-2 py-1 text-sm rounded-full";
       const data = {
        "USER" : <span className={`text-amber-600 font-semibold`}>정회원</span>,
        "MANAGER" : <span className={`text-lime-700 font-semibold`}>사서</span>,
        "ADMIN" : <span className={`text-indigo-900 font-semibold`}>관리자</span>,
        "NORMAL" : <span className={`text-blue-800 bg-blue-100 ${roundStyle}`}>일반</span>,
        "OVERDUE" : <span className={`text-purple-500 bg-purple-100 ${roundStyle}`}>제재</span>,
        "PUNISH" : <span className={`text-orange-800 bg-orange-100 ${roundStyle}`}>정지</span>,
        "LEAVE" : <span className={`text-red-500 bg-red-100 ${roundStyle}`}>탈퇴</span>
       }

       return data[value];
    }

    const handleClick = (e) => {
        setModData(e);
        setIsOpen(true);

    }

    const handleClose = () => {
        setIsOpen(false);
        setModData({});
    }

    const calcPenaltyDays = (date) => {
		if(date == null) {
			return 0;
		}
        const now = new Date();
        const penalty = new Date(date);
        now.setHours(0, 0, 0, 0);
        penalty.setHours(0, 0, 0, 0);
		const days = (penalty.getTime() - now.getTime()) / (1000*60*60*24) +1;
		if(days <= 0) {
			return <span className = "text-blue-500">(종료)</span>;
		}
		return <span className = "text-red-500">(D-{days})</span>
	}
	
    const handleEveryBody = (e) => {
        const newState = e.target.checked ? "EVERY" : "ALL";
        const newParams = new URLSearchParams(searchURLParams); 
        newParams.set('state', newState); 
        setSearchURLParams(newParams); 
    }

    const useEveryBody = useMemo(() =>{
        if (!searchURLParams.get("state") || searchURLParams.get("state") == "ALL" || searchURLParams.get("state") == "EVERY"){
            return true;
        } else {
            false;
        }
    }, [searchURLParams.get("state")])

    const valueEvery = useMemo(() => {
        return (searchURLParams.get("state") == "EVERY") ? true : false
    }, [searchURLParams.get("state")])
    

    return (  <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}

            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">회원 목록</h1>
            <div className="flex items-center justify-center mb-10 gap-15 rounded-xl bg-gray-100 shadow h-30">
                    <SearchSelectComponent options={["회원ID", "이름","회원번호"]} defaultCategory={searchURLParams.get("option") || "회원ID"}
                        dropdownClassName="w-24 md:w-32"
                        className="w-full md:w-[40%]"
                        inputClassName="w-full bg-white"
                        buttonClassName="right-2 top-5"
                        input={searchURLParams.get("query") || ""}
                        handleSearch={handleSearch} />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 z-110">
                            <SelectComponent onChange={(e) => handleSelectChange('role', e)} value={searchURLParams.get("role") || "ALL"}  options={roleMap} />
                            <SelectComponent onChange={(e) => handleSelectChange('state', e)} value={searchURLParams.get("state") == "EVERY" ? "ALL" : ( searchURLParams.get("state") || "ALL")}  options={stateMap} />
                            <CheckBox label ={<span className={useEveryBody ? "" : "text-gray-400"}>탈퇴 계정 포함</span>} checked={valueEvery} onChange={handleEveryBody} disabled={!useEveryBody}/> 
                        </div>


                    </div>
            </div>
            <div className="flex justify-end item-center mb-5">
                {/* <Button onClick={()=>window.open(`/qrscan`, "_blank", "width=1000,height=750")} className="bg-blue-500 hover:bg-blue-600 ml-1">회원증 검사</Button> */}
              
                <SelectComponent onChange={(e) => handleSelectChange('sortBy', e)} value={searchURLParams.get("sortBy") || "mno"}  options={sortMap} />
                <SelectComponent onChange={(e) => handleSelectChange('orderBy', e)} value={searchURLParams.get("orderBy") || "desc"}  options={orderMap}/>
                <SelectComponent onChange={(e) => handleSelectChange('size', e)} value={searchURLParams.get("size") || "10"}  options={sizeMap} />
              
            </div>
            <div className="min-w-fit shadow-md rounded-lg overflow-x-hidden">
                <table className="min-w-full bg-white">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">순번</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">회원ID</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">회원번호</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">이름</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">성별</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">전화번호</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">생년월일</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">권한</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">상태</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">패널티</th>
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
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{memberPage.pageNumber * memberPage.pageSize  + index +1}</td>
                                        <td className="py-4 px-3 max-w-30 min-w-30 whitespace-nowrap text-center">{item.mid}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.mno}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.name}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.gender}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.phone}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.birthDate}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{filterValue(item.role)}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{filterValue(item.state)}</td>
                                        <td className="py-4 px-3 max-w-35 min-w-35 whitespace-nowrap text-center">
                                            {item.penaltyDate ? <>{item.penaltyDate} {calcPenaltyDays(item.penaltyDate)}</> :<>-</> }
                                            </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
             <Modal isOpen={isOpen} title={"회원 설정"} onClose={handleClose}> <MemberModifyComponent data={modData} refetch={refetch} /> </Modal>
        </div>);
}

export default MemberManagementComponent;