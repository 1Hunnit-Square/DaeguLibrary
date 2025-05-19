import { getLibraryBookList } from "../../api/adminApi";
import { useState, useEffect, useMemo, useCallback } from "react";
import { usePagination } from "../../hooks/usePagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "../common/Button";
import CheckBox from "../common/CheckBox";
import { useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";



const LibraryBookListComponent = () => {



    const [searchURLParams, setSearchURLParams] = useSearchParams();

    const queryParams = useMemo(() => ({
        query: searchURLParams.get("query") || "",
        option: searchURLParams.get("option") || "도서명",
        page: searchURLParams.get("page") || "1",
        size: searchURLParams.get("size") || "10",
        check: searchURLParams.get("check") || "전체",
        startDate: searchURLParams.get("startDate"),
        endDate: searchURLParams.get("endDate"),
        sortBy: searchURLParams.get("sortBy") || "regLibraryBookDate",
        orderBy: searchURLParams.get("orderBy") || "desc",

    }), [searchURLParams]);

    const [localStartDate, setLocalStartDate] = useState(queryParams.startDate);
    const [localEndDate, setLocalEndDate] = useState(queryParams.endDate);


    const queryClient = useQueryClient();




    const { data: rentalData = { content: [], totalElements: 0 }, isLoading } = useQuery({
        queryKey: ['rentalList', searchURLParams.toString()],
        queryFn: () => {
                    const params = {
                        page: parseInt(queryParams.page, 10),
                        size: parseInt(queryParams.size, 10),
                        check: queryParams.check,
                        startDate: queryParams.startDate,
                        endDate: queryParams.endDate,
                        sortBy: queryParams.sortBy,
                        orderBy: queryParams.orderBy,
                    };

                    if (queryParams.query) {
                        params.query = queryParams.query;
                        params.option = queryParams.option;
                    }

                    return getLibraryBookList(params);
                },
    });

    const rentalList = useMemo(() => rentalData.content, [rentalData.content]);






    const pageClick = useCallback((page) => {
            if (isLoading) return;
            const newParams = new URLSearchParams(searchURLParams);
            newParams.set("page", page.toString());
            setSearchURLParams(newParams);
        }, [ searchURLParams, isLoading, setSearchURLParams]);

    const handleSearch = useCallback((searchQuery, selectedOption) => {
            const newParams = new URLSearchParams();
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("tab", "booklist");
            newParams.set("page", "1");
            newParams.set("startDate", localStartDate);
            newParams.set("endDate", localEndDate);

            setSearchURLParams(newParams);
        }, [setSearchURLParams, localStartDate, localEndDate]);



    const handleStartDateChange = useCallback((e) => {
        setLocalStartDate(e.target.value);
    }, []);

    const handleEndDateChange = useCallback((e) => {
        setLocalEndDate(e.target.value);
    }, []);
    const handleSortByChange = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);
        const sortFieldMap = {
            "대출일순": "rentStartDate",
        };
        newParams.set("sortBy", sortFieldMap[value] || "rentStartDate");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);


    const handleOrderByChange = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);
        const orderDirectionMap = {
            "오름차순": "asc",
            "내림차순": "desc"
        };
        newParams.set("orderBy", orderDirectionMap[value] || "desc");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);


    const handleSizeChange = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);
        const sizeMap = {
            "10개씩": "10",
            "50개씩": "50",
            "100개씩": "100"
        };
        newParams.set("size", sizeMap[value] || "10");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);


    const { renderPagination } = usePagination(rentalData, pageClick, isLoading);

    const options = ["도서명", "저자", "ISBN", "도서번호"]

    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">도서 목록</h1>
            <div className="flex items-center justify-center mb-10 gap-30 bg-gray-300 h-30">
                    <SearchSelectComponent options={options} defaultCategory={queryParams.option} selectClassName="mr-2 md:mr-5"
                        dropdownClassName="w-24 md:w-32"
                        className="w-full md:w-[50%]"
                        inputClassName="w-full bg-white"
                        buttonClassName="right-2 top-5"
                        input={queryParams.query}
                        handleSearch={handleSearch} />
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            <span className="w-50">입고일</span>
                            <input type="date" value={localStartDate} onChange={handleStartDateChange} className="w-full border bg-white rounded-md p-2" />
                            <span className="mx-4">-</span>
                            <input type="date" value={localEndDate} onChange={handleEndDateChange} className="w-full border bg-white rounded-md p-2" />
                        </div>
                    </div>
            </div>
            <div className="flex justify-end item-center mb-5">
                <SelectComponent onChange={handleSortByChange} value={queryParams.sortBy === "rentStartDate" ? "대출일순" : "대출일순"}  options={["대출일순"]} />
                <SelectComponent onChange={handleOrderByChange} value={queryParams.orderBy === "asc" ? "오름차순" : "내림차순"}  options={["내림차순", "오름차순"]}/>
                <SelectComponent onChange={handleSizeChange} value={`${queryParams.size}개씩`}  options={["10개씩", "50개씩", "100개씩"]} />
            </div>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">회원ID</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">도서명</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">저자</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">도서번호</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">ISBN</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">대출일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">반납예정일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">반납일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">상태</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">연체 여부</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading  ? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    도서가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            rentalList.map((item, index) => {
                                const today = new Date();
                                const dueDate = new Date(item.dueDate);
                                today.setHours(0, 0, 0, 0);
                                dueDate.setHours(0, 0, 0, 0);

                                const isOverdue = item.state === "BORROWED" && dueDate < today;

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 ${isOverdue ? 'bg-red-50' : ''}`}>
                                        <td className="py-4 px-6">{item.mid}</td>
                                        <td className="py-4 px-6 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.author}>{item.author}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.libraryBookId}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.rentStartDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.dueDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.returnDate || '-'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.state === "BORROWED" ? (isOverdue ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800") :
                                                item.state === "RETURNED" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                                            }`}>
                                                {item.state === "BORROWED" ?  "대출중" : "반납완료"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {isOverdue ? (
                                                <span className="text-red-600 font-semibold">연체중</span>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
        </div>
    );
}

export default LibraryBookListComponent;