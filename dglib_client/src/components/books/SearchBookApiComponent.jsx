import { useState, useEffect } from "react";
import { searchBookApi } from "../../api/bookPythonApi";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { usePagination } from "../../hooks/usePage";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from "react-router-dom";


const SearchBookApi = () => {
    const [BookList, setBookList] = useState(null);
    const [query, setQurry] = useState("");
    const [currentQuery, setCurrentQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const title = window.name;
    const queryClient = useQueryClient();
    const handleSearch = (e) => {
        setQurry(e.target.value);
    }
    const searchMutation = useMutation({
            mutationFn: async ({query, page = 1}) => {
                const response = await searchBookApi(query, page);
                return response;
            },
            onSuccess: (data) => {
                setBookList(data);
                console.log(data);
                queryClient.setQueryData(['bookSearch', currentQuery, currentPage], data);
            },
            onError: (error) => {
                console.error("검색 중 오류가 발생했습니다:", error);
                alert("검색 중 오류가 발생했습니다. 다시 시도해 주세요.");
            }
        });


    useEffect(() => {
    const queryParam = searchURLParams.get('query');
    const pageParam = parseInt(searchURLParams.get('page') || '1', 10);
    if (queryParam) {
        setQurry(queryParam);
        setCurrentQuery(queryParam);
        setCurrentPage(pageParam);
        if (!searchMutation.isPending) {
            searchMutation.mutate({ query: queryParam, page: pageParam });
        }
    }
}, [searchURLParams]);

    const searchClick = () => {
        if (!query.trim()) {
            alert("검색어를 입력하세요.");
            return;
        }
        const newParams = new URLSearchParams();
        setCurrentPage(1);
        newParams.set('query', query);
        newParams.set('page', 1);
        setSearchURLParams(newParams);
        setCurrentQuery(query);

        searchMutation.mutate({ query });

    }





    const handleBookSelect = (book) => {
        if (window.opener) {
            window.opener.postMessage({
                type: 'BOOK_SELECTED',
                book: {
                    bookTitle: book.title,
                    author: book.author,
                    cover: book.cover,
                    publisher: book.publisher,
                    pubDate: book.pubDate,
                    description: book.description,
                    isbn: book.isbn13 || book.isbn10 || book.isbn
                }
            }, '*');
            window.close();
        }
    };


    const { renderPagination } = usePagination(BookList, searchURLParams, setSearchURLParams, searchMutation.isPending);

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#00893B] text-[#00893B]">{title}</h2>

            <div className="flex items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="도서명, 저자, ISBN 등으로 검색하세요"
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    value={query}
                    onChange={handleSearch}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !searchMutation.isPending) {
                            e.preventDefault();
                            searchClick();
                        }
                    }}
                />
                <Button
                    onClick={!searchMutation.isPending ? searchClick : undefined}
                    disabled={searchMutation.isPending}
                    children="검색"
                />
            </div>

            {searchMutation.isPending ? (
                <div className="flex justify-center items-center py-10">
                    <Loading text="도서 검색중입니다..." />
                </div>
            ) : (
                <>
                    {BookList && (
                        <div>
                            <div className="mb-4">
                            <p>"{query}"에 대한 검색 결과, 총 {BookList.totalElements}권의 도서를 찾았습니다.</p>
                                {BookList.totalPages > 20 && <p className="text-xs mt-1 mx-1 text-gray-600">검색 결과는 최대 20페이지로 제한됩니다.</p>}
                            </div>

                            <div className="space-y-6">
                                {BookList.content.map((book, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleBookSelect(book)}
                                        className="flex flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-6 p-6 cursor-pointer"
                                    >
                                        <div className="w-full md:w-48 flex justify-center">
                                            <img
                                                src={book.cover || '/placeholder-image.png'}
                                                alt={book.title || '표지 없음'}
                                                className="h-64 object-contain"
                                                onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="block text-xl font-semibold mb-4">
                                                {book.title}
                                            </div>
                                            <div className="space-y-2 text-gray-600">
                                                <p className="text-sm"><span className="font-medium">저자:</span> {book.author || '-'}</p>
                                                <p className="text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                                <p className="text-sm"><span className="font-medium">출판일:</span> {book.pubDate || '-'}</p>
                                                <p className="text-sm"><span className="font-medium">ISBN:</span> {book.isbn13 || book.isbn10 || book.isbn || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {BookList.content.length === 0 && (
                                <div className="flex justify-center items-center py-10">
                                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                                </div>
                            )}

                            {renderPagination()}
                        </div>
                    )}

                    {!BookList && (
                        <div className="flex justify-center items-center py-10">
                            <p className="text-gray-500">검색어를 입력하세요.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default SearchBookApi;