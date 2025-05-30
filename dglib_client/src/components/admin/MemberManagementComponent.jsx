import SearchSelectComponent from "../common/SearchSelectComponent";
import CheckBoxNonLabel from "../common/CheckNonLabel";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { usePagination } from "../../hooks/usePage";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getMemberList } from "../../api/memberApi";
import { useQuery } from "@tanstack/react-query";
import Modal from "../common/Modal";
import MemberModifyComponent from "./MemberModifyComponent";

const MemberManagementComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const [isOpen, setIsOpen]= useState(false);
    const [ modData, setModData ] = useState({});

      const queryParams = useMemo(() => ({
        query: searchURLParams.get("query") || "",
        option: searchURLParams.get("option") || "회원ID",
        page: searchURLParams.get("page") || "1",
        size: searchURLParams.get("size") || "10",
        role: searchURLParams.get("role") || "ALL",
        state: searchURLParams.get("state") || "ALL",
        sortBy: searchURLParams.get("sortBy") || "mno",
        orderBy: searchURLParams.get("orderBy") || "desc",

    }), [searchURLParams]);

    const { data: memberData = { content: [], totalElements: 0 }, isLoading, error, refetch } = useQuery({
        queryKey: ['memberList', searchURLParams.toString()],
        queryFn: () => {
                            const params = {
                                page: parseInt(queryParams.page, 10),
                                size: parseInt(queryParams.size, 10),
                                state: queryParams.state,
                                role: queryParams.role,
                                sortBy: queryParams.sortBy,
                                orderBy: queryParams.orderBy,
                            };

                            if (queryParams.query) {
                                params.query = queryParams.query;
                                params.option = queryParams.option;
                            }
                            console.log(params);
                            return getMemberList(params);
                        }
    });

    const memberList = useMemo(() => memberData.content, [memberData.content]);


    const { renderPagination } = usePagination(memberData, searchURLParams, setSearchURLParams, isLoading);

    const options = ["회원ID", "이름","회원번호"];
    const roleMap = {
            "전체권한": "ALL",
            "정회원": "USER",
            "사서" : "MANAGER",
            "관리자" : "ADMIN",
        };
    const stateMap = {
            "전체계정": "ALL",
            "일반계정": "NORMAL",
            "연체계정" : "OVERDUE",
            "제재계정" : "PUNISH",
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

       const handleSearch = useCallback((searchQuery, selectedOption) => {
            const newParams = new URLSearchParams();
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("page", "1");

            setSearchURLParams(newParams);
        }, [setSearchURLParams]);

    const handleSortByChange = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);
        newParams.set("sortBy", value || "mno");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

   const handleOrderByChange = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);

        newParams.set("orderBy", value || "desc");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);


    const handleSizeChange = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);
        newParams.set("size", value || "10");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

const handleByRole = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);

        newParams.set("role", value || "ALL");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);



    const handleByState = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);

        newParams.set("state", value || "ALL");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const filterValue = (value) => {
        const roundStyle ="font-semibold px-2 py-1 text-sm rounded-full";
       const data = {
        "USER" : <span className={`text-black bg-amber-100 ${roundStyle}`}>정회원</span>,
        "MANAGER" : <span className={`text-blue-500 bg-amber-100 ${roundStyle}`}>사서</span>,
        "ADMIN" : <span className={`text-green-500 bg-amber-100 ${roundStyle}`}>관리자</span>,
        "NORMAL" : <span className={`text-black bg-blue-100 ${roundStyle}`}>일반</span>,
        "OVERDUE" : <span className={`text-purple-500 bg-blue-100 ${roundStyle}`}>연체</span>,
        "PUNISH" : <span className={`text-orange-800 bg-blue-100 ${roundStyle}`}>제재</span>,
        "LEAVE" : <span className={`text-red-500 bg-blue-100 ${roundStyle}`}>탈퇴</span>
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


    return (  <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}

            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">회원 목록</h1>
            <div className="flex items-center justify-center mb-10 gap-30 bg-gray-300 h-30">
                    <SearchSelectComponent options={options} defaultCategory={queryParams.option} selectClassName="mr-2 md:mr-5"
                        dropdownClassName="w-24 md:w-32"
                        className="w-full md:w-[50%]"
                        inputClassName="w-full bg-white"
                        buttonClassName="right-2 top-5"
                        input={queryParams.query}
                        handleSearch={handleSearch} />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 z-40">
                            <SelectComponent onChange={handleByRole} value={queryParams.role}  options={roleMap} />
                            <SelectComponent onChange={handleByState} value={queryParams.state}  options={stateMap} />
                        </div>


                    </div>
            </div>
            <div className="flex justify-end item-center mb-5">
                <SelectComponent onChange={handleSortByChange} value={queryParams.sortBy}  options={sortMap} />
                <SelectComponent onChange={handleOrderByChange} value={queryParams.orderBy}  options={orderMap}/>
                <SelectComponent onChange={handleSizeChange} value={queryParams.size}  options={sizeMap} />
            </div>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">순번</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">회원ID</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">회원번호</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">이름</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">성별</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">전화번호</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">생년월일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">권한</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">상태</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">패널티</th>
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
                                        <td className="py-4 px-6">{item.index}</td>
                                        <td className="py-4 px-6">{item.mid}</td>
                                        <td className="py-4 px-6 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.mno}>{item.mno}</td>
                                        <td className="py-4 px-6 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.name}>{item.name}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.gender}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.phone}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.birthDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{filterValue(item.role)}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{filterValue(item.state)}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {item.penaltyDays > 0 && <span className="text-red-500">{item.penaltyDays}일 남음</span>}
                                            {item.penaltyDays <=0 && "-"}
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