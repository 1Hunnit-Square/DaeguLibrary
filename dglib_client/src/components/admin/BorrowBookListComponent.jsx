import { getRentalList, returnBook } from "../../api/adminApi";
import { useState, useEffect, useMemo, useCallback } from "react";
import { usePagination } from "../../hooks/usePagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "../common/Button";
import { useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import CheckBoxNonLabel from "../common/CheckNonLabel";



const BorrowBookListComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();

    const queryParams = useMemo(() => ({
        query: searchURLParams.get("query") || "",
        option: searchURLParams.get("option") || "회원ID",
        page: searchURLParams.get("page") || "1",
        size: searchURLParams.get("size") || "10",
        check: searchURLParams.get("check") || "전체",
        startDate: searchURLParams.get("startDate"),
        endDate: searchURLParams.get("endDate"),
        sortBy: searchURLParams.get("sortBy") || "rentStartDate",
        orderBy: searchURLParams.get("orderBy") || "desc",

    }), [searchURLParams]);

    const [dateRange, setDateRange] = useState({startDate: queryParams.startDate, endDate: queryParams.endDate});
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("전체");
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
                    setSelectedFilter(queryParams.check);
                    return getRentalList(params);
                },
    });

    const rentalList = useMemo(() => rentalData.content, [rentalData.content]);

    const returnMutation = useMutation({
        mutationFn: async (rentIds) => {
            return await returnBook(rentIds);
        },
        onSuccess: () => {
            alert("도서 반납이 완료되었습니다.");
            setSelectedItems(new Set());
            setIsAllSelected(false);
            queryClient.invalidateQueries(['rentalList', searchURLParams]);
        },
        onError: (error) => {
            console.log("도서 반납 오류:", error);
            alert("도서 반납에 실패했습니다. " + error.response?.data?.message);
        }
    });

    useEffect(() => {
        if (rentalList.length > 0 && selectedItems.size === rentalList.length) {
            setIsAllSelected(true);
        } else {
            setIsAllSelected(false);
        }

    }, [rentalList, selectedItems])

    useEffect(() => {
        setSelectedItems(new Set());
        setIsAllSelected(false);
    }, [searchURLParams]);


    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setIsAllSelected(isChecked);
        if (isChecked) {
            const newSelectedItems = new Set();
            rentalList.forEach(item => {
            newSelectedItems.add(item.rentId);
        });
        setSelectedItems(newSelectedItems);
        } else {
        setSelectedItems(new Set());
        }
    }
    const handleSelectItem = (e, item) => {
        const isChecked = e.target.checked;
        setSelectedItems(prev => {
            const newSelectedItems = new Set(prev);
            if (isChecked) {
                newSelectedItems.add(item.rentId);
            } else {
                newSelectedItems.delete(item.rentId);
            }
            return newSelectedItems;
        });
    }

    const buttonClick = async () => {
        if (selectedItems.size === 0) {
            alert("반납할 도서를 선택하세요.");
            return;
        }
        returnMutation.mutate(Array.from(selectedItems));
    }


    const handleSearch = useCallback((searchQuery, selectedOption) => {
            const newParams = new URLSearchParams();
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("tab", "borrowlist");
            newParams.set("page", "1");
            newParams.set("check", selectedFilter);
            newParams.set("startDate", dateRange.startDate);
            newParams.set("endDate", dateRange.endDate);
            setSelectedItems(new Set());
            setSearchURLParams(newParams);
        }, [setSearchURLParams, dateRange, selectedFilter]);

    const handleCheckChange = useCallback((checkValue) => {
        if (checkValue === selectedFilter) {
            return;
        }
    setSelectedFilter(checkValue);
    const newParams = new URLSearchParams(searchURLParams);
    newParams.set("check", checkValue);
    newParams.set("page", "1");
    setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams, selectedFilter]);

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

    const pageClick = useCallback((page) => {
            if (isLoading) return;
            const newParams = new URLSearchParams(searchURLParams);
            newParams.set("page", page.toString());
            setSearchURLParams(newParams);
        }, [ searchURLParams, isLoading, setSearchURLParams]);


    const { renderPagination } = usePagination(rentalData, pageClick, isLoading);

    const options = ["회원ID", "도서번호"]

    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">대출 목록</h1>
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
                            <span className="w-50">대출일</span>
                            <input type="date" value={dateRange.startDate} onChange={handleDateChange} name="startDate" className="w-full border bg-white rounded-md p-2" />
                            <span className="mx-4">-</span>
                            <input type="date" value={dateRange.endDate} onChange={handleDateChange} name="endDate" className="w-full border bg-white rounded-md p-2" />
                        </div>
                        <div className="flex gap-5 mt-5 ">
                             <CheckBoxNonLabel label="전체"
                             checked={selectedFilter === "전체"}
                             onChange={() => handleCheckChange("전체")} />
                             <CheckBoxNonLabel label="대출중"
                             checked={selectedFilter === "대출중"}
                             onChange={() => handleCheckChange("대출중")} />
                             <CheckBoxNonLabel label="연체"
                             checked={selectedFilter === "연체"}
                             onChange={() => handleCheckChange("연체")} />
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
                            <th className="py-3 px-4 text-left">
                                <CheckBoxNonLabel inputClassName="h-4 w-4" checked={isAllSelected} onChange={handleSelectAll} />
                            </th>
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
                        {!isLoading && rentalList.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    대여한 도서가 없습니다.
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
                                        <td className="py-4 px-4">
                                            <CheckBoxNonLabel inputClassName="h-4 w-4" checked={selectedItems.has(item.rentId)} onChange={(e) => handleSelectItem(e, item)} />
                                        </td>
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
            <div className="mt-6 flex justify-end items-center space-x-3">
                <Button onClick={buttonClick}
                        className={"disabled:bg-[#82c8a0] disabled:cursor-not-allowed"}
                        children={"도서반납"}
                        disabled={selectedItems.size === 0 || isLoading}
                        />
            </div>
            {renderPagination()}
        </div>
    );
}

export default BorrowBookListComponent;