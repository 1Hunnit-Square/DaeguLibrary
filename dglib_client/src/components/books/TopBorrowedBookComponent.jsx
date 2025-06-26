import CheckBoxNonLabel from "../common/CheckNonLabel";
import { useSearchParams } from "react-router-dom";
import { useCheckboxFilter } from "../../hooks/useCheckboxFilter";
import { useQuery } from "@tanstack/react-query";
import { getTopBorrowedBookList } from "../../api/bookApi";
import { useMemo, useEffect, useRef } from "react";
import { usePagination } from "../../hooks/usePage";
import Loading from "../../routers/Loading";
import { Link } from "react-router-dom";

const TopBorrowedBookComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const topRef = useRef(null);
    const { selectedValue: selectedCheck, handleValueChange: handleCheckChange } = useCheckboxFilter(searchURLParams, setSearchURLParams, "check", "전체");
    const { data: topBookData = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ['topBorrowedBookList', searchURLParams.toString()],
        queryFn: () => {
            const params = {
                page: parseInt(searchURLParams.get("page") || "1"),
                size: parseInt(searchURLParams.get("size") || "10"),
                check: searchURLParams.get("check") || "오늘",
            };

            return getTopBorrowedBookList(params);
        },
    });
    const topBooks = useMemo(() => topBookData.content, [topBookData.content]);
    console.log(topBookData)

    const { renderPagination } = usePagination(topBookData, searchURLParams, setSearchURLParams, isLoading, undefined, topRef);


    return (
        <div>
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg mt-10 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <p className="w-full sm:w-16 font-medium text-gray-700 text-sm sm:text-base">기간</p>
                    <div className="flex flex-wrap gap-3 sm:gap-5">
                        <CheckBoxNonLabel label="오늘"
                            checked={selectedCheck === "오늘"}
                            onChange={() => handleCheckChange("오늘")} />
                        <CheckBoxNonLabel label="일주일"
                            checked={selectedCheck === "일주일"}
                            onChange={() => handleCheckChange("일주일")} />
                        <CheckBoxNonLabel label="한달"
                            checked={selectedCheck === "한달"}
                            onChange={() => handleCheckChange("한달")} />
                    </div>
                </div>
            </div>

            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {topBookData.totalElements !== undefined ? (
                    <div className="mb-4 px-2">
                        <p className="text-sm md:text-base">총 {topBookData.totalElements}권의 도서를 찾았습니다.</p>
                    </div>
                ) : (
                    <div className="mb-4 px-2">
                        <p className="text-sm md:text-base">검색결과에 대하여 {topBookData?.totalElements ?? 0}권의 도서를 찾았습니다.</p>
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
                            {Array.isArray(topBooks) && topBooks.length > 0 ? (
                                <>
                                    {topBooks.map((book, index) => {
                                        if (!book) return null;
                                        return (
                                            <div key={index}
                                                className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-4 md:gap-6 p-4 md:p-6 mx-2 md:mx-0"
                                            >
                                                <div className="flex justify-center md:w-40 lg:w-48 flex-shrink-0">
                                                    <img
                                                        src={book.cover || '/placeholder-image.png'}
                                                        alt={book.bookTitle || '표지 없음'}
                                                        className="w-32 h-44 md:w-auto md:h-64 object-contain"
                                                        onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
                                                        <Link to={`/books/detail/${book.isbn}?from=borrowbest`} className="inline">
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
                                searchURLParams.has("check") ? (
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

export default TopBorrowedBookComponent;