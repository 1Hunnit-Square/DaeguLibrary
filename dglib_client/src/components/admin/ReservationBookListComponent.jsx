import { getReserveBookList, cancelReserveBook, reReserveBook, completeBorrowing } from "../../api/adminApi";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import CheckBoxNonLabel from "../common/CheckNonLabel";

const ReservationBookListComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const queryParams = useMemo(() => ({
        query: searchURLParams.get("query") || "",
        option: searchURLParams.get("option") || "회원ID",
        page: searchURLParams.get("page") || "1",
        size: searchURLParams.get("size") || "10",
        check: searchURLParams.get("check") || "전체",
        startDate: searchURLParams.get("startDate"),
        endDate: searchURLParams.get("endDate"),
        sortBy: searchURLParams.get("sortBy") || "reserveDate",
        orderBy: searchURLParams.get("orderBy") || "desc",
        state: searchURLParams.get("state") || "",

    }), [searchURLParams]);


    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedState, setSelectedState] = useState(searchURLParams.get("state") === "RESERVED");

    const [dateRange, setDateRange] = useState({startDate: queryParams.startDate, endDate: queryParams.endDate});
    const [selectedFilter, setSelectedFilter] = useState("전체");
    const queryClient = useQueryClient();




    const { data: reserveData = { content: [], pageable: { pageNumber: 0 } }, isLoading } = useQuery({
        queryKey: ['reserveList', searchURLParams.toString()],
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
                            if (queryParams.state) {
                                params.state = queryParams.state;
                            }

                            if (queryParams.query) {
                                params.query = queryParams.query;
                                params.option = queryParams.option;
                            }
                            setSelectedFilter(queryParams.check);
                            setSelectedState(queryParams.state === "RESERVED");
                            return getReserveBookList(params);
                        },
    });
    const reserveList = useMemo(() => reserveData.content, [reserveData.content]);


   const handleMutationSuccess = useCallback(() => {
    queryClient.invalidateQueries(['reserveList', searchURLParams]);
    setSelectedItems(new Map());
    setSelectedAction("");
    setIsAllSelected(false);
    }, [queryClient, searchURLParams]);

    const cancelMutation = useMutation({
        mutationFn: (items) => cancelReserveBook(items),
        onSuccess: () => {
            alert("예약이 취소되었습니다.");
            handleMutationSuccess();
        },
        onError: (error) => {
            console.log("예약 취소 오류:", error);
            alert(error.response.data.message);
        }
    });

    const reserveMutation = useMutation({
        mutationFn: (items) => reReserveBook(items),
        onSuccess: () => {
            alert("예약이 완료되었습니다.");
            handleMutationSuccess();
        },
        onError: (error) => {
            console.log("예약 완료 오류:", error);
            alert(error.response.data.message);
        }
    });

    const borrowMutation = useMutation({
        mutationFn: (items) => completeBorrowing(items),
        onSuccess: () => {
            alert("대출이 완료되었습니다.");
            handleMutationSuccess();
        },
        onError: (error) => {
            console.log("대출 완료 오류:", error);
            alert(error.response.data.message);
        }
    });




    useEffect(() => {
        const selectableItemsCount = reserveList.filter(
        item => item.state !== 'CANCELED' && item.state !== 'BORROWED'
        ).length;
        if (selectableItemsCount > 0 && selectedItems.size === selectableItemsCount) {
            setIsAllSelected(true);
        } else {
            setIsAllSelected(false);
        }

    }, [reserveList, selectedItems])

    useEffect(() => {
        setSelectedItems(new Map());
        setIsAllSelected(false);
    }, [searchURLParams]);

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setIsAllSelected(isChecked);
        if (isChecked) {
            const newSelectedItems = new Map();
            reserveList.forEach(item => {
            if (item && typeof item.reserveId !== 'undefined' &&
                item.state !== 'CANCELED' && item.state !== 'BORROWED') {
                newSelectedItems.set(item.reserveId, {
                    reserveId: item.reserveId,
                    state: item.state,
                    reservationRank: item.reservationRank,
                    libraryBookId: item.libraryBookId,
                    mid: item.mid,

                });
            }
        });
        setSelectedItems(newSelectedItems);
        } else {
        setSelectedItems(new Map());
        }
    }
    const handleSelectItem = (e, item) => {
        const isChecked = e.target.checked;
        setSelectedItems(prev => {
            const newSelectedItems = new Map(prev);
            if (isChecked) {
                newSelectedItems.set(item.reserveId, {
                    reserveId: item.reserveId,
                    state: item.state,
                    reservationRank: item.reservationRank,
                    libraryBookId: item.libraryBookId,
                    mid: item.mid,
                });
            } else {
                newSelectedItems.delete(item.reserveId);
            }
            return newSelectedItems;
        })

    }
    const buttonClick = () => {
        if (selectedItems.size === 0 || !selectedAction) {
            alert("변경할 예약을 선택하세요.");
            return;
        }

        const selectedItemsArray = Array.from(selectedItems.values());

        switch (selectedAction) {
            case "CANCELED":
                cancelMutation.mutate(selectedItemsArray);
                break;
            case "RESERVED":
                reserveMutation.mutate(selectedItemsArray);
                break;
            case "BORROWED":
                if (confirm("정말로 대출을 완료하시겠습니까?")) {
                    borrowMutation.mutate(selectedItemsArray);
                }
                break;
        }
    };

     const pageClick = useCallback((page) => {
                if (isLoading) return;
                const newParams = new URLSearchParams(searchURLParams);
                newParams.set("page", page.toString());
                setSearchURLParams(newParams);
            }, [ searchURLParams, isLoading, setSearchURLParams]);

    const { renderPagination } = usePagination(reserveData, pageClick, isLoading);

    const handleSearch = useCallback((searchQuery, selectedOption) => {
            const newParams = new URLSearchParams();
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("tab", "reservation");
            newParams.set("page", "1");
            newParams.set("check", selectedFilter);
            newParams.set("startDate", dateRange.startDate);
            newParams.set("endDate", dateRange.endDate);
            if (selectedState) {
                newParams.set("state", "RESERVED");
            } else {
                newParams.delete("state");
            }
            setSelectedItems(new Set());
            setSearchURLParams(newParams);
        }, [setSearchURLParams, dateRange, selectedFilter, selectedState]);


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
            "신청일순": "reserveDate",
        };
        newParams.set("sortBy", sortFieldMap[value] || "reserveDate");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const handleStateChange = useCallback(() => {
        const newParams = new URLSearchParams(searchURLParams);
        if (selectedState) {
        newParams.delete("state");
        setSelectedState(false);
        } else {
        newParams.set("state", "RESERVED");
        setSelectedState(true);
    }
        newParams.set("page", "1");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams, selectedState]);


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
console.log(reserveList);

    const options = ["회원ID", "도서번호"]
    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">예약 목록</h1>
            {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}
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
                                        <input type="date" value={dateRange.startDate} name="startDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                                        <span className="mx-4">-</span>
                                        <input type="date" value={dateRange.endDate} name="endDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                                    </div>
                                    <div className="flex gap-5 mt-5 ">
                                         <CheckBoxNonLabel label="전체"
                                         checked={selectedFilter === "전체"}
                                         onChange={() => handleCheckChange("전체")} />
                                         <CheckBoxNonLabel label="일반"
                                         checked={selectedFilter === "일반"}
                                         onChange={() => handleCheckChange("일반")} />
                                         <CheckBoxNonLabel label="무인"
                                         checked={selectedFilter === "무인"}
                                         onChange={() => handleCheckChange("무인")} />
                                         <div className="mx-26">
                                             <CheckBoxNonLabel label="예약중"
                                         checked={selectedState}
                                         onChange={() => handleStateChange()} />
                                         </div>
                                    </div>


                                </div>
                        </div>
                        <div className="flex justify-end item-center mb-5">
                            <SelectComponent onChange={handleSortByChange} value={queryParams.sortBy === "reserveDate" ? "신청일순" : "신청일순"}  options={["신청일순"]} />
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
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">신청구분</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">신청일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">우선순위</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">상태</th>
                             <th className="py-3 px-6 text-left text-sm font-semibold uppercase">연체여부</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && reserveList.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    예약한 도서가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            reserveList.map((item) => {
                                return (
                                    <tr key={item.reserveId} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 ${item.overdue && item.state === "RESERVED" ? 'bg-red-50' : ''}`}>
                                        <td className="py-4 px-4">
                                            <CheckBoxNonLabel inputClassName="h-4 w-4" checked={selectedItems.has(item.reserveId)} onChange={(e) => handleSelectItem(e, item)} disabled={item.state === 'CANCELED' || item.state === 'BORROWED' ? true : false} />
                                        </td>
                                        <td className="py-4 px-6">{item.mid}</td>
                                        <td className="py-4 px-6 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.author}>{item.author}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.libraryBookId}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.unmanned ? "무인" : "일반"}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.reserveDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.reservationRank !== null ? item.reservationRank + "순위" : "-"}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.state === "RESERVED" ?  "bg-yellow-200 text-yellow-800" :
                                                item.state === "BORROWED" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                                            }`}>
                                                {item.state === "RESERVED" ?  "예약중" : item.state === "BORROWED" ? "대출완료" : "예약취소"}
                                            </span>
                                        </td>
                                        <td className={`py-4 px-6 ${item.overdue === true && item.state === "RESERVED" ? "text-red-600 font-semibold" : ""}`}>{item.overdue && item.state === "RESERVED" ? "연체중" : "-"}</td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-end items-center space-x-3">
                <select
                    className="border border-gray-300 rounded-md p-2 text-sm focus:ring-[#00893B] focus:border-[#00893B]"
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                >
                    <option value="" hidden></option>
                    <option value="CANCELED">예약취소</option>
                    <option value="RESERVED">예약중</option>
                    <option value="BORROWED">대출완료</option>
                </select>
                <button
                    onClick={buttonClick}
                    className="px-4 py-2 bg-[#00893B] text-white text-sm font-medium rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#00893B] focus:ring-offset-2 transition ease-in-out duration-150 disabled:bg-[#82c8a0] disabled:cursor-not-allowed"
                    disabled={selectedItems.size === 0 || !selectedAction || isLoading}
                >
                    변경
                </button>
            </div>

                {renderPagination()}
        </div>
    );
}

export default ReservationBookListComponent;