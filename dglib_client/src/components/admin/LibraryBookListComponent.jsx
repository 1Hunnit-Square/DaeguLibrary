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

    const [dateRange, setDateRange] = useState({startDate: queryParams.startDate, endDate: queryParams.endDate});

    const { data: bookData = { content: [], totalElements: 0 }, isLoading } = useQuery({
        queryKey: ['bookList', searchURLParams.toString()],
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

    const bookList = useMemo(() => bookData.content, [bookData.content]);
    console.log(bookList);





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
            newParams.set("startDate", dateRange.startDate);
            newParams.set("endDate", dateRange.endDate);

            setSearchURLParams(newParams);
        }, [setSearchURLParams, dateRange]);



    const handleDateChange = useCallback((e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);
    const handleSortByChange = useCallback((value) => {
        const newParams = new URLSearchParams(searchURLParams);
        const sortFieldMap = {
            "입고일순": "rentStartDate",
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


    const { renderPagination } = usePagination(bookData, pageClick, isLoading);

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
                            <input type="date" value={dateRange.startDate} name="startDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                            <span className="mx-4">-</span>
                            <input type="date" value={dateRange.endDate} name="endDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                        </div>
                    </div>
            </div>
            <div className="flex justify-end item-center mb-5">
                <SelectComponent onChange={handleSortByChange} value={queryParams.sortBy === "rentStartDate" ? "입고일순" : "입고일순"}  options={["입고일순"]} />
                <SelectComponent onChange={handleOrderByChange} value={queryParams.orderBy === "asc" ? "오름차순" : "내림차순"}  options={["내림차순", "오름차순"]}/>
                <SelectComponent onChange={handleSizeChange} value={`${queryParams.size}개씩`}  options={["10개씩", "50개씩", "100개씩"]} />
            </div>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">등록번호</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">도서명</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">저자</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">출판사</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">ISBN</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">출판일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">위치</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">청구기호</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">입고일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">상태</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">예약수</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && bookList.length === 0  ? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    도서가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            bookList.map((item, index) => {
                                const today = new Date();
                                const dueDate = new Date(item.dueDate);
                                today.setHours(0, 0, 0, 0);
                                dueDate.setHours(0, 0, 0, 0);

                                const isOverdue = item.state === "BORROWED" && dueDate < today;

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 ${isOverdue ? 'bg-red-50' : ''}`}>
                                        <td className="py-4 px-6">{item.libraryBookId}</td>
                                        <td className="py-4 px-6 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.author}>{item.author}</td>
                                        <td className="py-4 px-6 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{item.publisher}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.pubDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.location}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.callSign}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.regLibraryBookDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full">
                                                {item.rented || item.unmanned ?  "대출중" : "-"}
                                            </span>
                                        </td>
                                       <td className="py-4 px-6 whitespace-nowrap">{item.reserveCount}</td>
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