import CheckBoxNonLabel from "../common/CheckNonLabel";
import { useSearchParams } from "react-router-dom";
import { useCheckboxFilter } from "../../hooks/useCheckboxFilter";
import { useQuery } from "@tanstack/react-query";
import { getTopBorrowedBookList } from "../../api/bookApi";
import { useMemo } from "react";
import { usePagination } from "../../hooks/usePage";
import Loading from "../../routers/Loading";
import { Link } from "react-router-dom";

const TopBorrowedBookComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
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

    const { renderPagination } = usePagination(topBookData, searchURLParams, setSearchURLParams, isLoading);


    return (
         <div>
            <div className="flex border border-[#00893B] mt-8 p-8 max-w-[90%] mx-auto item-center gap-10">
                <p className="my-auto">기간</p>
                <div className="flex gap-5">
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
             <div className="container mx-auto px-4 py-8 w-375">
               {topBookData.totalElements !== undefined ? (
                            <div className="mb-4">총 {topBookData.totalElements}권의 도서를 찾았습니다. </div>
                        ) : (
                            <div>

                                    검색결과에 대하여 {topBookData?.totalElements ?? 0}권의 도서를 찾았습니다.

                            </div>
                        )}
              {isLoading ? (
                            <Loading text="도서 검색중입니다.." />
                            )
                            : isError ? (
                                <div className="flex justify-center items-center py-10">
                                    <p className="text-red-500 font-medium">
                                        서버에서 책 데이터를 불러오는데 실패했습니다.
                                    </p>
                                </div>
                            ) : (
                        <>
                        <div className="space-y-6">

                            {Array.isArray(topBooks) && topBooks.length > 0 ? (
                                <>
                                {topBooks.map((book, index) => {
                                    if (!book) return null;
                                    return (
                                        <div key={index}
                                            className="flex flex-row bg-white rounded-lg -mt-1 shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-6 p-6"
                                        >

                                            <div className="w-full md:w-48 flex justify-center">

                                                <img
                                                    src={book.cover || '/placeholder-image.png'}
                                                    alt={book.bookTitle || '표지 없음'}
                                                    className="h-64 object-contain"
                                                    onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Link to={`/books/detail/${book.libraryBookId}`} className="block text-xl font-semibold mb-4 hover:underline hover:cursor-pointer">
                                                    {book.bookTitle}
                                                </Link>
                                                <div className="space-y-2 text-gray-600">
                                                    <p className="text-sm"><span className="font-medium">저자:</span> {book.author || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">출판일:</span> {book.pubDate || '-'}</p>
                                                </div>
                                            </div>

                                        </div>
                                    );

                                })}
                                </>

                            ) : (
                                searchURLParams.has("startDate") ? (
                                    <div className="flex justify-center items-center py-10">
                                        <p className="text-gray-500">검색 결과가 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center py-10">
                                        <p className="text-gray-500">표시할 도서가 없습니다.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </>
                )}
                {renderPagination()}
            </div>
        </div>
    )
}

export default TopBorrowedBookComponent;