
import { useSearchParams, Link } from "react-router-dom";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from '@tanstack/react-query';
import Button from "../common/Button";
import { getNewLibraryBookList } from "../../api/bookApi";
import Loading from "../../routers/Loading";
import { usePagination } from "../../hooks/usePage";

const NewBookComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const topRef = useRef(null);
    const [dateRange, setDateRange] = useState({startDate: searchURLParams.get("startDate"), endDate: searchURLParams.get("endDate")});
    const { data = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ["libraryBookId", searchURLParams.toString()],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("startDate", dateRange.startDate);
            params.set("endDate", dateRange.endDate);
            return getNewLibraryBookList(searchURLParams);
        }
    })
    const newBooks = useMemo(() => data.content, [data.content]);
    console.log(newBooks)
    const handleDateChange = useCallback((e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSearch = useCallback(() => {
        const newParams = new URLSearchParams();
        newParams.set("startDate", dateRange.startDate);
        newParams.set("endDate", dateRange.endDate);
        newParams.set("page", "1");
        setSearchURLParams(newParams);
    }, [dateRange, setSearchURLParams]);

    const { renderPagination } = usePagination(data, searchURLParams, setSearchURLParams, isLoading, undefined, topRef);

    return (
        <div ref={topRef}>
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg mt-10 shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4">
                    <span className="w-full sm:w-20 font-medium text-gray-700 text-sm sm:text-base">입고일</span>
                    <input type="date" value={dateRange.startDate} name="startDate" onChange={handleDateChange} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]" />
                    <span className="mx-1 text-center sm:mx-4">-</span>
                    <input type="date" value={dateRange.endDate} name="endDate" onChange={handleDateChange} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]" />
                    
                    <Button children="검색" onClick={handleSearch} className= "ml-5" />
                   
                </div>
                
            </div>

            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {data.totalElements !== undefined ? (
                    <div className="mb-4 px-2">
                        <p className="text-sm md:text-base">총 {data.totalElements}권의 도서를 찾았습니다.</p>
                    </div>
                ) : (
                    <div className="mb-4 px-2">
                        <p className="text-sm md:text-base">검색결과에 대하여 {data?.totalElements ?? 0}권의 도서를 찾았습니다.</p>
                    </div>
                )}

                <div className="space-y-4 md:space-y-6">
                    {isLoading ? (
                        <Loading text="도서 검색중입니다"/>
                    ) : isError ? (
                        <div className="flex justify-center items-center py-10">
                            <p className="text-red-500 font-medium text-sm md:text-base">
                                서버에서 책 데이터를 불러오는데 실패했습니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            {Array.isArray(newBooks) && newBooks.length > 0 ? (
                                <>
                                    {newBooks.map((book, index) => {
                                        if (!book) return null;
                                        return (
                                            <div key={index}
                                                className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-4 md:gap-6 p-4 md:p-6 mx-2 md:mx-0"
                                            >
                                                <div className="flex justify-center md:w-40 lg:w-48 flex-shrink-0">
                                                    <img
                                                        src={book.cover}
                                                        alt={book.bookTitle || '표지 없음'}
                                                        className="w-32 h-44 md:w-auto md:h-64 object-contain"
                                                        onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
                                                        <Link to={`/books/detail/${book.isbn}?from=newbook`} className="inline">
                                                            <span className="hover:underline hover:text-green-700 hover:cursor-pointer break-words">
                                                                {book.bookTitle}
                                                            </span>
                                                        </Link>
                                                    </div>
                                                    <div className="space-y-1 md:space-y-2 text-gray-600">
                                                        <p className="text-xs md:text-sm"><span className="font-medium">저자:</span> {book.author || '-'}</p>
                                                        <p className="text-xs md:text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                                        <p className="text-xs md:text-sm"><span className="font-medium">출판일:</span> {book.pubDate || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                searchURLParams.has("startDate") ? (
                                    <div className="flex justify-center items-center py-10">
                                        <p className="text-gray-500 text-sm md:text-base px-4 text-center">검색 결과가 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center py-10">
                                        <p className="text-gray-500 text-sm md:text-base px-4 text-center">표시할 도서가 없습니다.</p>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                <div className="mt-6 md:mt-8">
                    {renderPagination()}
                </div>
            </div>
        </div>
    )
}

export default NewBookComponent;