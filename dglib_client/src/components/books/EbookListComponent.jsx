import { useQuery } from '@tanstack/react-query';
import { getEbookList } from '../../api/bookApi';
import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import { usePagination } from "../../hooks/usePage";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { API_SERVER_HOST } from '../../api/config';
import { API_ENDPOINTS } from '../../api/config';
import { memberIdSelector } from '../../atoms/loginState';
import { useMoveTo } from '../../hooks/useMoveTo';
import { useRecoilValue } from 'recoil';
import SearchSelectComponent from '../common/SearchSelectComponent';

const EbookListComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const mid = useRecoilValue(memberIdSelector);
    const topRef = useRef(null);
    const { moveToLogin } = useMoveTo();
    const { data: ebookList = { content: [] }, isLoading, isError } = useQuery({
        queryKey: ['ebookList', searchURLParams.toString()],
        queryFn: () => {
            const params = { page: parseInt(searchURLParams.get("page") || "1", 10) };
            if (searchURLParams.get("query")) {
                params.query = searchURLParams.get("query");
                params.option = searchURLParams.get("option") || "전체";
            }
            return getEbookList(params);
        }
    });

    const books = useMemo(() => ebookList.content, [ebookList.content]);

    const readClick = (id) => {
        if (!mid) {
            moveToLogin("로그인이 필요합니다.");
            return;
        }
        const windowName = "EBOOK Viewer"
        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        window.open(`/viewer?id=${id}`, windowName, `width=${screenWidth},height=${screenHeight},left=0,top=0`);
    };

    const handleSearch = useCallback((searchQuery, selectedOption) => {
            const newParams = new URLSearchParams();


            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.delete("isChecked");
            newParams.set("page", "1");


            setSearchURLParams(newParams);
        }, [setSearchURLParams]);


    const { renderPagination } = usePagination(ebookList, searchURLParams, setSearchURLParams, isLoading, undefined, topRef);
    const searchOption = useMemo(() => ["전체", "제목", "저자", "출판사"], []);
    

    return (
        <div ref={topRef}>
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white mt-10 rounded-lg shadow-md">
                <SearchSelectComponent
                    options={searchOption}
                    handleSearch={handleSearch}
                    input={searchURLParams.get("query") || ""}
                    defaultCategory={searchURLParams.get("option") || "전체"}
                    selectClassName="mr-2 md:mr-5"
                    dropdownClassName="w-24 md:w-32"
                    className="w-full"
                    inputClassName="w-full"
                    buttonClassName="right-2"
                />
            </div>

            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {ebookList.totalElements !== undefined ? (
                    <div className="mb-4 px-2">
                        <p className="text-sm md:text-base">총 {ebookList.totalElements}권의 전자책을 찾았습니다.</p>
                    </div>
                ) : (
                    <div className="mb-4 px-2">
                        <p className="text-sm md:text-base">검색결과에 대하여 {ebookList?.totalElements ?? 0}권의 전자책을 찾았습니다.</p>
                    </div>
                )}

                <div className="space-y-4 md:space-y-6">
                    {isLoading ? (
                        <Loading text="전자책 목록을 불러오는 중입니다..." />
                    ) : isError ? (
                        <div className="flex justify-center items-center py-10">
                            <p className="text-red-500 font-medium text-sm md:text-base">
                                서버에서 전자책 데이터를 불러오는데 실패했습니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            {Array.isArray(books) && books.length > 0 ? (
                                <>
                                    {books.map((book) => (
                                        <div
                                            key={book.ebookId}
                                            className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-4 md:gap-6 p-4 md:p-6 mx-2 md:mx-0"
                                        >
                                            <div className="flex justify-center md:w-40 lg:w-48 flex-shrink-0">
                                                <img
                                                    src={`${API_SERVER_HOST}${API_ENDPOINTS.view}/${book.ebookCover}?type=thumbnail`}
                                                    alt={book.ebookTitle || '표지 없음'}
                                                    className="w-32 h-44 md:w-auto md:h-64 object-contain"
                                                    onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
                                                    <span className="break-words">
                                                        {book.ebookTitle}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 md:space-y-2 text-gray-600">
                                                    <p className="text-xs md:text-sm"><span className="font-medium">저자:</span> {book.ebookAuthor || '-'}</p>
                                                    <p className="text-xs md:text-sm"><span className="font-medium">출판사:</span> {book.ebookPublisher || '-'}</p>
                                                    <p className="text-xs md:text-sm"><span className="font-medium">출판일:</span> {book.ebookPubDate || '-'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-3 md:ml-4">
                                                <Button
                                                    className="w-full md:w-auto px-4 py-2 text-sm md:text-base"
                                                    children="읽기"
                                                    onClick={() => readClick(book.ebookId)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                searchURLParams.has("query") ? (
                                    <div className="flex justify-center items-center py-10">
                                        <p className="text-gray-500 text-sm md:text-base px-4 text-center">검색 결과가 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center py-10">
                                        <p className="text-gray-500 text-sm md:text-base px-4 text-center">등록된 전자책이 없습니다.</p>
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

export default EbookListComponent;