import { getWishBookList, rejectWishBook } from "../../api/adminApi";
import { useMemo, useState, useEffect } from "react";
import { usePagination } from "../../hooks/usePage";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import WishBookDetailComponent from "./WishBookDetailComponent";
import CheckNonLabel from "../common/CheckNonLabel";
import { useCheckboxFilter } from "../../hooks/useCheckboxFilter";
import { useBookMutation } from "../../hooks/useBookMutation";

const WishBookListComponent = () => {
    const options = ["회원ID", "도서명", "ISBN"]
    const sortByOption = useMemo(() => ({"신청일순": "wishNo"}), []);
    const orderByOption = useMemo(() => ({"오름차순": "asc", "내림차순": "desc"}), []);
    const sizeOption = useMemo(() => ({"10개씩": "10", "50개씩": "50", "100개씩": "100"}), []);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { dateRange, handleDateChange } = useDateRangeHandler();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const { selectedValue: selectedCheck, handleValueChange: handleCheckChange } = useCheckboxFilter(searchURLParams, setSearchURLParams, "check", "전체");
    const [ detail, setDetail ] = useState(null);

    useEffect(() => {
        if (isModalOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
        return () => {
          document.body.style.overflow = '';
        };
      }, [isModalOpen]);

    

    const { data: bookData = { content: [], totalElements: 0 }, isLoading } = useQuery({
        queryKey: ['wishBooList', searchURLParams.toString()],
        queryFn: () => {
                    const params = {
                        page: parseInt(searchURLParams.get("page") || "1"),
                        size: parseInt(searchURLParams.get("size") || "10"),
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate,
                        sortBy: searchURLParams.get("sortBy") || "wishNo",
                        orderBy: searchURLParams.get("orderBy") || "desc",
                        check: searchURLParams.get("check") || "전체",
                    };

                    if (searchURLParams.has("query")) {
                        params.query = searchURLParams.get("query")
                        params.option = searchURLParams.get("option")
                    }

                    return getWishBookList(params);
                },
    });
    const bookList = useMemo(() => bookData.content, [bookData.content]);

    const onReset = () => {setDetail(prev => ({...prev, state: "REJECTED", processedAt: new Date().toLocaleDateString('en-CA'),}))}

    const rejectlMutation = useBookMutation(async (wishNo) => await rejectWishBook(wishNo), { successMessage: "희망도서 신청이 반려되었습니다.", queryKeyToInvalidate: "wishBooList", failRefrash: false, onReset: onReset }  );



    const { handleSearch } = useSearchHandler({tab: 'wishbook', dateRange});

    const handleModalOpen = (item) => {
        setDetail(item);
        setIsModalOpen(true);
    };

    const handleReject = (wishNo) => {
        if (window.confirm("희망도서 신청을 반려하시겠습니까?")) {
            rejectlMutation.mutate(wishNo);
        }
    };

    const { renderPagination } = usePagination(bookData, searchURLParams, setSearchURLParams, isLoading);


    return (
        <div className="container mx-auto px-4 py-8 w-full">
             {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">희망도서 신청목록</h1>
            <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 rounded-xl bg-gray-100 shadow p-4 min-h-30 gap-10">
                    <SearchSelectComponent options={options} defaultCategory={searchURLParams.get("option")} selectClassName="mr-2 md:mr-5"
                        dropdownClassName="w-24 md:w-32"
                        className="w-full md:w-[40%]"
                        inputClassName="w-full bg-white"
                        buttonClassName="right-2 top-5"
                        input={searchURLParams.get("query") || ""}
                        handleSearch={handleSearch} />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium whitespace-nowrap">신청일</span>
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
                                value="처리중"
                                checked={selectedCheck === "처리중"}
                                onChange={() => handleCheckChange("처리중")}
                                />
                                처리중
                            </label>
                        </div>
                    </div>
            </div>
            <div className="flex justify-end item-center mb-5 gap-3">
                <SelectComponent onChange={(value) => handleSelectChange('sortBy', value)}  value={searchURLParams.get("sortBy") || "wishNo"}  options={sortByOption} />
                <SelectComponent onChange={(value) => handleSelectChange('orderBy', value)}  value={searchURLParams.get("orderBy") || "desc"}  options={orderByOption}/>
                <SelectComponent onChange={(value) => handleSelectChange('size', value)}  value={searchURLParams.get("size") || "10"}    options={sizeOption} />
            </div>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="w-full bg-white table-fixed">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">순번</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">회원ID</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">도서명</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">저자</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">출판사</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">ISBN</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">비고</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">신청일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">처리일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">상태</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && bookList.length === 0  ? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            bookList.map((item, wishNo) => {
                                return (
                                    <tr key={wishNo} onClick={() => handleModalOpen(item)} className={`border-b border-gray-200 hover:bg-gray-100 hover:cursor-pointer transition-colors duration-200`}>
                                        <td className="py-4 px-6 text-center text-xs">{item.wishNo}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.mid}>{item.mid}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{item.author}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.publisher}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[80px] whitespace-nowrap">{item.note || "-"}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[10px] whitespace-nowrap">{item.appliedAt}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.processedAt || "-"}</td>
                                        <td className="py-4 px-6 text-center text-xs flex justify-center whitespace-nowrap font-semibold">
                                        <span className={`px-2 py-1 rounded-full ${
                                                item.state === "CANCELED" ?  "bg-gray-200 text-gray-800" :
                                                item.state === "REJECTED" ? "bg-red-200 text-red-800" :
                                                item.state === "ACCEPTED" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                                            }`}>
                                                 {item.state === "CANCELED" ?  "취소" : item.state === "REJECTED" ? "반려" : item.state === "ACCEPTED" ? "완료" : "처리중" }
                                            </span>
                                                
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <WishBookDetailComponent setIsModalOpen={setIsModalOpen} wishBook={detail} handleReject={handleReject} />}
            {renderPagination()}
        </div>
    );
}

export default WishBookListComponent;