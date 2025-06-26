import { getReserveBookList, cancelReserveBook, completeBorrowing } from "../../api/adminApi";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { usePagination } from "../../hooks/usePage";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import CheckNonLabel from "../common/CheckNonLabel";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import { useBookMutation } from "../../hooks/useBookMutation";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import { useItemSelection } from "../../hooks/useItemSelection";
import { useCheckboxFilter } from "../../hooks/useCheckboxFilter";

const ReservationBookListComponent = () => {
    const sortByOption = useMemo(() => ({"대출일순": "reserveId"}), []);
    const orderByOption = useMemo(() => ({"오름차순": "asc", "내림차순": "desc"}), []);
    const sizeOption = useMemo(() => ({"10개씩": "10", "50개씩": "50", "100개씩": "100"}), []);
    const options = ["회원ID", "도서번호"]
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const { dateRange, handleDateChange } = useDateRangeHandler();
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedState, setSelectedState] = useState(searchURLParams.get("state") === "RESERVED");
    const { selectedValue: selectedCheck, handleValueChange: handleCheckChange } = useCheckboxFilter(searchURLParams, setSearchURLParams, "check", "전체");
            useEffect(() => {
            resetSelection(new Set());
        }, [searchURLParams]);
    const queryClient = useQueryClient();

    const { data: reserveData = { content: [], pageable: { pageNumber: 0 } }, isLoading } = useQuery({
        queryKey: ['reserveList', searchURLParams.toString()],
        queryFn: () => {
                            const params = {
                                page: parseInt(searchURLParams.get("page") || "1"),
                                size: parseInt(searchURLParams.get("size") || "10"),
                                startDate: dateRange.startDate,
                                endDate: dateRange.endDate,
                                option: searchURLParams.get("option") || "회원ID",
                                check: searchURLParams.get("check") || "전체",
                                sortBy: searchURLParams.get("sortBy") || "reserveId",
                                orderBy: searchURLParams.get("orderBy") || "desc",

                            };
                            if (searchURLParams.get("state")) {
                                params.state = searchURLParams.get("state");
                            }

                            if (searchURLParams.get("query")) {
                                params.query = searchURLParams.get("query");
                                params.option = searchURLParams.get("option");
                            }
                            setSelectedState(searchURLParams.get("state") === "RESERVED");
                            return getReserveBookList(params);
                        },
    });
    const reserveList = useMemo(() => reserveData.content, [reserveData.content]);
    console.log(reserveList)

    const handleMutationSuccess = useCallback(() => {
        queryClient.invalidateQueries(['reserveList', searchURLParams]);
        resetSelection(new Set());
        setSelectedAction("");
    }, [queryClient, searchURLParams]);

    const cancelMutation = useBookMutation(async (book) => await cancelReserveBook(book), { successMessage: "예약이 취소되었습니다.", onReset: () => {handleMutationSuccess()}} );
    const borrowMutation = useBookMutation(async (book) => await completeBorrowing(book), { successMessage: "대출이 완료되었습니다.", onReset: () => {handleMutationSuccess()}} );



    useEffect(() => {
        resetSelection(new Map());

    }, [searchURLParams]);


    const buttonClick = () => {
        if (selectedItems.size === 0 || !selectedAction) {
            alert("변경할 예약을 선택하세요.");
            return;
        }
        const selectedItemsArray = Array.from(selectedItems);
        switch (selectedAction) {
            case "CANCELED":
                cancelMutation.mutate(selectedItemsArray);
                break;
            case "BORROWED":
                if (confirm("정말로 대출을 완료하시겠습니까?")) {
                    borrowMutation.mutate(selectedItemsArray);
                }
                break;
        }
    };

    const { selectedItems, isAllSelected, handleSelectItem, handleSelectAll, resetSelection } = useItemSelection(reserveList, 'reserveId');

    const { handleSearch } = useSearchHandler( {tab: 'reservation', dateRange, selectedCheck, selectedState , onPageReset: () => {
            resetSelection(new Set());}});

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

    const { renderPagination } = usePagination(reserveData, searchURLParams, setSearchURLParams, isLoading);

    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">예약 목록</h1>
            <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 gap-10 rounded-xl bg-gray-100 shadow p-4 min-h-30">
                                <SearchSelectComponent options={options} defaultCategory={searchURLParams.get("option")} selectClassName="mr-2 md:mr-5"
                                    dropdownClassName="w-24 md:w-32"
                                    className="w-full md:w-[40%]"
                                    inputClassName="w-full bg-white"
                                    buttonClassName="right-2 top-5"
                                    input={searchURLParams.get("query")}
                                    handleSearch={handleSearch} />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium whitespace-nowrap">대출일</span>
                                        <input type="date" value={dateRange.startDate} name="startDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                                        <span className="mx-4">-</span>
                                        <input type="date" value={dateRange.endDate} name="endDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                                    </div>
                                    <div className="flex gap-5 mt-5">
                                        <label className="flex items-center gap-1 text-sm font-medium">
                                            <input
                                            type="radio"
                                            name="statusFilter"
                                            className="w-4 h-4 accent-green-700"
                                            value="전체"
                                            checked={selectedCheck === "전체"}
                                            onChange={() => handleCheckChange("전체")}
                                            />
                                            전체
                                        </label>

                                        <label className="flex items-center gap-1 text-sm font-medium">
                                            <input
                                            type="radio"
                                            name="statusFilter"
                                            className="w-4 h-4 accent-green-700"
                                            value="일반"
                                            checked={selectedCheck === "일반"}
                                            onChange={() => handleCheckChange("일반")}
                                            />
                                            일반
                                        </label>

                                        <label className="flex items-center gap-1 text-sm font-medium">
                                            <input
                                            type="radio"
                                            name="statusFilter"
                                            className="w-4 h-4 accent-green-700"
                                            value="무인"
                                            checked={selectedCheck === "무인"}
                                            onChange={() => handleCheckChange("무인")}
                                            />
                                            무인
                                        </label>
                                        <div className="pl-9">
                                        <CheckNonLabel label="예약중"
                                         checked={selectedState}
                                         onChange={() => handleStateChange()} />
                                         </div>
                                    </div>
                                </div>
                        </div>
                        <div className="flex justify-end item-center mb-5 gap-3">
                            <SelectComponent onChange={(value) => handleSelectChange('sortBy', value)}  value={searchURLParams.get("sortBy") || "reserveId"}  options={sortByOption} />
                            <SelectComponent onChange={(value) => handleSelectChange('orderBy', value)}  value={searchURLParams.get("orderBy") || "desc"}  options={orderByOption}/>
                            <SelectComponent onChange={(value) => handleSelectChange('size', value)}  value={searchURLParams.get("size") || "10"}    options={sizeOption} />
                        </div>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="w-full bg-white table-fixed">
                    <thead className="bg-[#00893B] text-white">

                        <tr>
                            <th className="py-3 px-4 text-center">
                                <CheckNonLabel inputClassName="h-4 w-4" checked={isAllSelected} onChange={handleSelectAll} />
                            </th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">회원ID</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">도서명</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">저자</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">도서번호</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">ISBN</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">신청구분</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">신청일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">우선순위</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">상태</th>
                             <th className="py-3 px-6 text-center text-sm font-semibold uppercase">연체여부</th>
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
                                    <tr key={item.reserveId} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200`}>
                                        <td className="py-4 px-4 text-xs">
                                            <CheckNonLabel inputClassName="h-4 w-4" checked={selectedItems.has(item.reserveId)} onChange={(e) => handleSelectItem(e, item.reserveId)}  />
                                        </td>
                                        <td className="py-4 px-6 text-center text-xs">{item.mid}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.author}>{item.author}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.libraryBookId}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.unmanned ? "무인" : "일반"}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap truncate" title={item.reserveDate} >{item.reserveDate}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.reservationRank !== null ? item.reservationRank + "순위" : "-"}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap flex justify-center">
                                            <span className={`px-2 py-1 text-xs text-center font-semibold rounded-full ${
                                                item.state === "RESERVED" ?  "bg-yellow-200 text-yellow-800" :
                                                item.state === "BORROWED" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                                            }`}>
                                                {item.state === "RESERVED" ?  "예약중" : item.state === "BORROWED" ? "대출완료" : "예약취소"}
                                            </span>
                                        </td>
                                        <td className={`py-4 px-6 text-xs text-center ${item.overdue === true && item.state === "RESERVED" ? "text-red-600 font-semibold" : ""}`}>{item.overdue && item.state === "RESERVED" ? "연체중" : "-"}</td>

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