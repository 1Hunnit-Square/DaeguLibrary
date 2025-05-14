import { useState, useEffect } from "react";
import { searchBookApi } from "../../api/bookApi";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { usePagination } from "../../hooks/usePagination";

const SearchBookApi = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentSearchTerm, setCurrentSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const title = window.name;

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    }

    const searchClick = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setSearchResults(null);
        setCurrentPage(1);
        setCurrentSearchTerm(searchTerm);
        try {
            const response = await searchBookApi(searchTerm);
            setSearchResults(response);
        } catch (error) {
            console.error("검색 중 오류가 발생했습니다:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const pageable = searchResults ? {
        content: searchResults.items,
        totalPages: Math.min(searchResults.total_pages, 20),
        pageable: {
            pageNumber: currentPage - 1
        }
    } : null;

    const handlePageChange = (page) => {
        pageClick(page);
    };

    const { renderPagination } = usePagination(pageable, handlePageChange, isLoading);

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

    const pageClick = async (page) => {
        if (page === currentPage) return;
        setIsLoading(true);
        setCurrentPage(page);

        try {
            const response = await searchBookApi(currentSearchTerm, page);
            setSearchResults(response);
        } catch (error) {
            console.error("페이지 로딩 중 오류가 발생했습니다:", error);
        } finally {
            setIsLoading(false);
        }
    }
    console.log("도서 검색 결과", searchResults);


    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#00893B] text-[#00893B]">{title}</h2>

            <div className="flex items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="도서명, 저자, ISBN 등으로 검색하세요"
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoading) {
                            e.preventDefault();
                            searchClick();
                        }
                    }}
                />
                <Button
                    onClick={!isLoading ? searchClick : undefined}
                    disabled={isLoading}
                    children="검색"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loading />
                </div>
            ) : (
                <>
                    {searchResults && (
                        <div>
                            <div className="mb-4">
                                <p>"{currentSearchTerm}"에 대한 검색 결과, 총 {searchResults.total_items}권의 도서를 찾았습니다.</p>
                                {searchResults.total_pages > 20 && <p className="text-xs mt-1 mx-1 text-gray-600">검색 결과는 최대 20페이지로 제한됩니다.</p>}
                            </div>

                            <div className="space-y-6">
                                {searchResults.items.map((book, index) => (
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

                            {searchResults.items.length === 0 && (
                                <div className="flex justify-center items-center py-10">
                                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                                </div>
                            )}

                            {renderPagination()}
                        </div>
                    )}

                    {!searchResults && (
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