import { getRentalList, returnBook, updateOverdueMember } from "../../api/adminApi";
import { useEffect, useMemo } from "react";
import { usePagination } from "../../hooks/usePage";
import { useQuery } from "@tanstack/react-query";
import Button from "../common/Button";
import { useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import CheckNonLabel from "../common/CheckNonLabel";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import { useItemSelection } from "../../hooks/useItemSelection";
import { useCheckboxFilter } from "../../hooks/useCheckboxFilter";
import { useBookMutation } from "../../hooks/useBookMutation";



const BorrowBookListComponent = () => {
    const sortByOption = useMemo(() => ({"대출일순": "rentId"}), []);
    const orderByOption = useMemo(() => ({"오름차순": "asc", "내림차순": "desc"}), []);
    const sizeOption = useMemo(() => ({"10개씩": "10", "50개씩": "50", "100개씩": "100"}), []);
    const options = ["회원ID", "도서번호"]
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { dateRange, handleDateChange } = useDateRangeHandler();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const { selectedValue: selectedCheck, handleValueChange: handleCheckChange } = useCheckboxFilter(searchURLParams, setSearchURLParams, "check", "전체");
        useEffect(() => {
        resetSelection(new Set());
    }, [searchURLParams]);


    const { data: rentalData = { dto : {content: [], totalElements: 0}, update : true }, isLoading } = useQuery({
        queryKey: ['rentalList', searchURLParams.toString()],
        queryFn: () => {
                    const params = {
                        page: parseInt(searchURLParams.get("page") || "1"),
                        size: parseInt(searchURLParams.get("size") || "10"),
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate,
                        check: searchURLParams.get("check") || "전체",
                        sortBy: searchURLParams.get("sortBy") || "rentId",
                        orderBy: searchURLParams.get("orderBy") || "desc",
                    };

                    if (searchURLParams.get("query")) {
                        params.query = searchURLParams.get("query");
                        params.option = searchURLParams.get("option");
                    }
                    return getRentalList(params);
                },
    });

    const rentalList = useMemo(() => rentalData.dto.content, [rentalData.dto.content]);
    console.log(rentalData)

    const returnMutation = useBookMutation(async (book) => await returnBook(book), { successMessage: "도서가 반납되었습니다.", onReset: () => {resetSelection(new Set());}});
    const updateMutation = useBookMutation(async () => await updateOverdueMember(), { successMessage: "목록이 갱신되었습니다.", onReset: () => {resetSelection(new Set());}});
    const buttonClick = async () => {
        if (selectedItems.size === 0) {
            alert("반납할 도서를 선택하세요.");
            return;
        }
        returnMutation.mutate(Array.from(selectedItems));
    }



    const { selectedItems, isAllSelected, handleSelectItem, handleSelectAll, resetSelection } = useItemSelection(rentalList, 'rentId');


    const { handleSearch } = useSearchHandler( {tab: 'borrowlist', dateRange, selectedCheck , onPageReset: () => {
        resetSelection(new Set());}});


    const { renderPagination } = usePagination(rentalData.dto, searchURLParams, setSearchURLParams, isLoading);

    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}

            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">대출 목록</h1>
            <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 gap-10 rounded-xl bg-gray-100 shadow p-4 min-h-30">
                    <SearchSelectComponent options={options} defaultCategory={searchURLParams.get("option")} selectClassName="mr-2 md:mr-5"
                        dropdownClassName="w-24 md:w-32"
                        className="w-full md:w-[40%]"
                        inputClassName="w-full bg-white"
                        buttonClassName="right-2 top-5"
                        value={searchURLParams.get("query")}
                        input={searchURLParams.get("query") || ""}
                        handleSearch={handleSearch} />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium whitespace-nowrap">대출일</span>
                            <input type="date" value={dateRange.startDate} onChange={handleDateChange} name="startDate" className="w-full border bg-white rounded-md p-2" />
                            <span className="mx-4">-</span>
                            <input type="date" value={dateRange.endDate} onChange={handleDateChange} name="endDate" className="w-full border bg-white rounded-md p-2" />
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
                                value="대출중"
                                checked={selectedCheck === "대출중"}
                                onChange={() => handleCheckChange("대출중")}
                                />
                                대출중
                            </label>

                            <label className="flex items-center gap-1 text-sm font-medium">
                                <input
                                type="radio"
                                name="statusFilter"
                                className="w-4 h-4 accent-green-700"
                                value="연체"
                                checked={selectedCheck === "연체"}
                                onChange={() => handleCheckChange("연체")}
                                />
                                연체
                            </label>
                        </div>
                        
                       

                    </div>
            </div>
            <div className="flex items-center mb-5">
                 {!rentalData.update && (
                        <div className="flex-1 flex gap-3 items-center">
                            <div className="text-red-600 font-medium">오늘의 연체 회원 정보가 아직 업데이트 되지 않았습니다.</div>
                            <Button
                                onClick={() => updateMutation.mutate()}
                                className="bg-red-500 hover:bg-red-600"
                                children="업데이트"
                            />
                        </div>
                    )}
                    <div className="flex-1 flex justify-end gap-3">
                        <SelectComponent onChange={(value) => handleSelectChange('sortBy', value)}  value={searchURLParams.get("sortBy") || "rentId"}  options={sortByOption} />
                        <SelectComponent onChange={(value) => handleSelectChange('orderBy', value)}  value={searchURLParams.get("orderBy") || "desc"}  options={orderByOption}/>
                        <SelectComponent onChange={(value) => handleSelectChange('size', value)}  value={searchURLParams.get("size") || "10"}    options={sizeOption} />
                    </div>
            </div>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="w-full bg-white table-fixed">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-4">
                                <CheckNonLabel inputClassName="h-4 w-4" checked={isAllSelected} onChange={handleSelectAll} />
                            </th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">회원ID</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">도서명</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">저자</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">도서번호</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">ISBN</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">대출일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">반납예정일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">반납일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">상태</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">연체 여부</th>
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
                                            <CheckNonLabel inputClassName="h-4 w-4" checked={selectedItems.has(item.rentId)} onChange={(e) => handleSelectItem(e, item.rentId)} />
                                        </td>
                                        <td className="py-4 px-6 text-center text-xs">{item.mid}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.author}>{item.author}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.libraryBookId}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.rentStartDate}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.dueDate}</td>
                                        <td className="py-4 px-6 text-center text-center text-xs whitespace-nowrap">{item.returnDate || '-'}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap ">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.state === "BORROWED" ? (isOverdue ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800") :
                                                item.state === "RETURNED" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                                            }`}>
                                                {item.state === "BORROWED" ?  "대출중" : "반납완료"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">
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