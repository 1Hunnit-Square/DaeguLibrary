import SelectComponent from "../common/SelectComponent";
import { useMemo } from "react";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBookrecoList } from "../../api/bookApi";
import Loading from "../../routers/Loading";
import { usePagination } from "../../hooks/usePage";
import { Link } from "react-router-dom";

const RecommendBookComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const option = useMemo(() => ({"문학": "literature", "철학": "philosophy", "종교": "religion", "역사": "history", "언어": "language", "예술": "art", "사회과학": "social-sciences", "자연과학": "natural-sciences", "기술과학": "technology"}), []);

    const { data: recoBookData = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ['recoBookList', searchURLParams.toString()],
        queryFn: () => getBookrecoList(searchURLParams.get("genre") || "literature", searchURLParams.get("page") || "1"),
    });
    const recoBooks = useMemo(() => recoBookData.content, [recoBookData.content]);
    const { renderPagination } = usePagination(recoBookData, searchURLParams, setSearchURLParams, isLoading);
    console.log(recoBookData)

    return (
        <div>
            <div className="flex border border-[#00893B] mt-8 p-8 max-w-[90%] mx-auto item-center gap-10">
                <p className="my-auto">장르</p>
                <SelectComponent onChange={(value) => handleSelectChange('genre', value)} value={searchURLParams.get("genre") || "literature"} options={option} />
            </div>
            <div className="container mx-auto px-4 py-8 w-full">
               {recoBookData.totalElements !== undefined ? (
                            <div className="mb-4">총 {recoBookData.totalElements}권의 도서를 찾았습니다. </div>
                        ) : (
                            <div>

                                    검색결과에 대하여 {recoBookData?.totalElements ?? 0}권의 도서를 찾았습니다.

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

                            {Array.isArray(recoBooks) && recoBooks.length > 0 ? (
                                <>
                                {recoBooks.map((book, index) => {
                                    if (!book) return null;
                                    return (
                                        <div key={index}
                                            className="flex flex-row bg-white rounded-lg -mt-1 shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-6 p-6"
                                        >

                                            <div className="w-full md:w-48 flex justify-center">

                                                <img
                                                    src={book.bookImageURL || '/placeholder-image.png'}
                                                    alt={book.bookname || '표지 없음'}
                                                    className="h-64 object-contain"
                                                    onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xl font-semibold mb-4">
                                                    <Link to={`/books/detail/${book.isbn13}?from=reco`} className="inline">
                                                        <span className="hover:underline hover:text-green-700 hover:cursor-pointer">{book.bookname}</span>
                                                    </Link>
                                                </div>
                                                <div className="space-y-2 text-gray-600">
                                                    <p className="text-sm"><span className="font-medium">저자:</span> {book.authors || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">출판일:</span> {book.publication_year || '-'}</p>
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
export default RecommendBookComponent;