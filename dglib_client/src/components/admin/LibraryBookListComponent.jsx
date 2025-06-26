import { getLibraryBookList } from "../../api/adminApi";
import { useMemo } from "react";
import { usePagination } from "../../hooks/usePage";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import { useSelectHandler } from "../../hooks/useSelectHandler";

const LibraryBookListComponent = () => {
    const options = ["도서명", "저자", "ISBN", "도서번호"]
    const sortByOption = useMemo(() => ({ "입고일순": "libraryBookId" }), []);
    const orderByOption = useMemo(() => ({ "오름차순": "asc", "내림차순": "desc" }), []);
    const sizeOption = useMemo(() => ({ "10개씩": "10", "50개씩": "50", "100개씩": "100" }), []);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { dateRange, handleDateChange } = useDateRangeHandler();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);

    const { data: bookData = { content: [], totalElements: 0 }, isLoading } = useQuery({
        queryKey: ['bookList', searchURLParams.toString(), dateRange],
        queryFn: () => {
            const params = {
                page: parseInt(searchURLParams.get("page") || "1"),
                size: parseInt(searchURLParams.get("size") || "10"),
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                sortBy: searchURLParams.get("sortBy") || "libraryBookId",
                orderBy: searchURLParams.get("orderBy") || "desc",
            };

            if (searchURLParams.has("query")) {
                params.query = searchURLParams.get("query")
                params.option = searchURLParams.get("option")
            }

            return getLibraryBookList(params);
        },
    });
    const bookList = useMemo(() => bookData.content, [bookData.content]);
    console.log(bookList);
    const { handleSearch } = useSearchHandler({ tab: 'booklist', dateRange });

    const { renderPagination } = usePagination(bookData, searchURLParams, setSearchURLParams, isLoading);


    return (
        <div className="container mx-auto px-4 py-8 w-full">
            {isLoading && (
                <Loading text="목록 갱신중.." />
            )}
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">도서 목록</h1>
            <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 gap-10 rounded-xl bg-gray-100 shadow p-4 min-h-30">
                <SearchSelectComponent options={options} defaultCategory={searchURLParams.get("option")} selectClassName="mr-2 md:mr-5"
                    dropdownClassName="w-24 md:w-32"
                    className="w-full md:w-[40%]"
                    inputClassName="w-full bg-white"
                    buttonClassName="right-2 top-5"
                    input={searchURLParams.get("query") || ""}
                    handleSearch={handleSearch} />
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">입고일</span>
                        <input type="date" value={dateRange.startDate} name="startDate" onChange={handleDateChange} className="w-[80%] border bg-white rounded-md p-2" />
                        <span className="mx-4">-</span>
                        <input type="date" value={dateRange.endDate} name="endDate" onChange={handleDateChange} className="w-[80%] border bg-white rounded-md p-2" />
                    </div>
                </div>
            </div>
            <div className="flex justify-end item-center mb-5 gap-3">
                <SelectComponent onChange={(value) => handleSelectChange('sortBy', value)} value={searchURLParams.get("sortBy") || "libraryBookId"} options={sortByOption} />
                <SelectComponent onChange={(value) => handleSelectChange('orderBy', value)} value={searchURLParams.get("orderBy") || "desc"} options={orderByOption} />
                <SelectComponent onChange={(value) => handleSelectChange('size', value)} value={searchURLParams.get("size") || "10"} options={sizeOption} />
            </div>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="w-full bg-white table-fixed">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">등록번호</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">도서명</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">저자</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">출판사</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">ISBN</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">출판일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">위치</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">청구기호</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">입고일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">상태</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">예약수</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">소장상태</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && bookList.length === 0 ? (
                            <tr>
                                <td colSpan="12" className="py-10 px-6 text-center text-gray-500 text-xl">
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
                                        <td className="py-4 px-6 text-center text-xs">{item.libraryBookId}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.author}>{item.author}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{item.publisher}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.pubDate}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[80px] whitespace-nowrap">{item.location}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[10px] whitespace-nowrap">{item.callSign}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.regLibraryBookDate}</td>
                                        <td className={`py-4 px-6 text-center flex justify-center text-xs whitespace-nowrap font-semibold `}>
                                            <span className={`block w-fit px-2 py-1 rounded-full ${
                                                item.rented ?  (isOverdue ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800") :
                                                item.unmanned ? "bg-blue-200 text-blue-800" :
                                                item.reserveCount > 0 ? "bg-purple-200 text-purple-800" : ""
                                            }`}>
                                                 {item.rented ? "대출중" : item.unmanned ? "무인예약" : item.reserveCount > 0 ? "예약대기" : ""}
                                            </span>
    
                                           
                                        </td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.reserveCount}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.deleted === false ? "소장중" : "부재"}</td>
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