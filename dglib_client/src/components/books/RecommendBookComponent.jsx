import SelectComponent from "../common/SelectComponent";
import { useMemo, useEffect, useRef } from "react";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBookrecoList } from "../../api/bookPythonApi";
import Loading from "../../routers/Loading";
import { usePagination } from "../../hooks/usePage";
import { Link } from "react-router-dom";

const RecommendBookComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const option = useMemo(() => ({"문학": "literature", "철학": "philosophy", "종교": "religion", "역사": "history", "언어": "language", "예술": "art", "사회과학": "social-sciences", "자연과학": "natural-sciences", "기술과학": "technology"}), []);
    const topRef = useRef(null);
    const { data: recoBookData = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ['recoBookList', searchURLParams.toString()],
        queryFn: () => getBookrecoList(searchURLParams.get("genre") || "literature", searchURLParams.get("page") || "1"),
    });
    const recoBooks = useMemo(() => recoBookData.content, [recoBookData.content]);
    const { renderPagination } = usePagination(recoBookData, searchURLParams, setSearchURLParams, isLoading, undefined, topRef);
    console.log(recoBookData)

    

    return (
        <div ref={topRef}>
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white border border-gray-200 rounded-lg mt-10 shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <p className="w-full sm:w-16 font-medium text-gray-700 text-sm sm:text-base">장르</p>
                    <SelectComponent 
                        onChange={(value) => handleSelectChange('genre', value)} 
                        value={searchURLParams.get("genre") || "literature"} 
                        options={option}
                        selectClassName="flex-1 sm:w-48 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    />
                </div>
            </div>

            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                

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
                            {Array.isArray(recoBooks) && recoBooks.length > 0 ? (
                                <>
                                    {recoBooks.map((book, index) => {
                                        if (!book) return null;
                                        return (
                                            <div key={index}
                                                className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-4 md:gap-6 p-4 md:p-6 mx-2 md:mx-0"
                                            >
                                                <div className="flex justify-center md:w-40 lg:w-48 flex-shrink-0">
                                                    <img
                                                        src={book.bookImageURL || '/placeholder-image.png'}
                                                        alt={book.bookname || '표지 없음'}
                                                        className="w-32 h-44 md:w-auto md:h-64 object-contain"
                                                        onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
                                                        <Link to={`/books/detail/${book.isbn13}?from=reco`} className="inline">
                                                            <span className="hover:underline hover:text-green-700 hover:cursor-pointer break-words">
                                                                {book.bookname}
                                                            </span>
                                                        </Link>
                                                    </div>
                                                    <div className="space-y-1 md:space-y-2 text-gray-600">
                                                        <p className="text-xs md:text-sm"><span className="font-medium">저자:</span> {book.authors || '-'}</p>
                                                        <p className="text-xs md:text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                                        <p className="text-xs md:text-sm"><span className="font-medium">출판일:</span> {book.publication_year || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                searchURLParams.has("genre") ? (
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
export default RecommendBookComponent;