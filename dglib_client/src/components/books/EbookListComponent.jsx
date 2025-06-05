import { useQuery } from '@tanstack/react-query';
import { getEbookList } from '../../api/bookApi';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { usePagination } from "../../hooks/usePage";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { API_SERVER_HOST } from '../../api/config';
import { API_ENDPOINTS } from '../../api/config';

const EbookListComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { data: ebookList = { content: [] }, isLoading, isError } = useQuery({
        queryKey: ['ebookList', searchURLParams.toString()],
        queryFn: () => {
            const params = { page: parseInt(searchURLParams.get("page") || "1", 10) };
            return getEbookList(params);
        }
    });

    const books = useMemo(() => ebookList.content, [ebookList.content]);

    const readClick = (id) => {
        const windowName = "EBOOK Viewer"
        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        window.open(`/viewer?id=${id}`, windowName, `width=${screenWidth},height=${screenHeight},left=0,top=0`);
    };


    const { renderPagination } = usePagination(ebookList, searchURLParams, setSearchURLParams, isLoading);

    return (
        <div className="container mx-auto px-4 py-8 w-full">
            <h2 className="text-2xl font-bold text-center mb-6">전자책 목록</h2>

            {ebookList.totalElements !== undefined && (
                <div className="mb-4">
                    <p className="">총 {ebookList.totalElements}권의 전자책을 찾았습니다.</p>
                </div>
            )}

            <div className="space-y-6">
                {isLoading ? (
                    <Loading text="전자책 목록을 불러오는 중입니다..." />
                ) : isError ? (
                    <div className="flex justify-center items-center py-10">
                        <p className="text-red-500 font-medium">
                            서버에서 전자책 데이터를 불러오는데 실패했습니다.
                        </p>
                    </div>
                ) : (
                    <>
                        {books && books.length > 0 ? (
                            books.map((book) => (
                                <div
                                    key={book.ebookId}
                                    className="flex flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-6 p-6"
                                >
                                    <div className="w-full md:w-48 flex justify-center">
                                        <img
                                            src={`${API_SERVER_HOST}${API_ENDPOINTS.view}/${book.ebookCover}?type=thumbnail`}
                                            alt={book.ebookTitle || '표지 없음'}
                                            className="h-64 object-contain"
                                            onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xl font-semibold mb-4">
                                            <span className="hover:underline hover:text-green-700 hover:cursor-pointer">
                                                {book.ebookTitle}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-gray-600">
                                            <p className="text-sm">
                                                <span className="font-medium">저자:</span> {book.ebookAuthor || '-'}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-medium">출판사:</span> {book.ebookPublisher || '-'}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-medium">출판일:</span> {book.ebookPubDate || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-center gap-3">
                                        <Button
                                            className="px-6 py-2 rounded text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer transition"
                                            children="읽기"
                                            onClick={() => {
                                                readClick(book.ebookId);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-center items-center py-10">
                                <p className="text-gray-500">등록된 전자책이 없습니다.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            {renderPagination()}
        </div>
    );
}

export default EbookListComponent;