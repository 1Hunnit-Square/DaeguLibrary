import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { searchBookApi } from "../api/bookApi";
const SearchBookResult = () => {
    const { keyword } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentSearchTerm, setCurrentSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    }
    const searchClick = async () => {
        setIsLoading(true);
        setSearchResults(null);
        setCurrentPage(1);
        setCurrentSearchTerm(searchTerm);
        console.log("검색어:", searchTerm);
        const response = await searchBookApi(searchTerm);
        console.log("검색 결과:", response);
        setSearchResults(response);
        setIsLoading(false);
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



    const pageClick = async (page) => {
            if (page === currentPage) return;
            setIsLoading(true);
            setCurrentPage(page);
            const response = await searchBookApi(currentSearchTerm, page);
            setSearchResults(response);
            setIsLoading(false);
        }
    const renderPagination = () => {
        if (!searchResults) return null;
        const maxPage = 20;
        const totalPages = Math.min(searchResults.total_pages, maxPage);
        const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
        const endPage = Math.min(startPage + 9, totalPages);
        const pages = [];

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`mx-1 px-3 py-1 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => !isLoading && pageClick(i)}
                    disabled={isLoading}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="flex justify-center mt-4">
                 {currentPage > 10 && (
                     <button
                        key="prev"
                        onClick={() => !isLoading && pageClick(startPage - 1)}
                        disabled={isLoading}
                        className={`mx-1 px-3 py-1 rounded bg-gray-200`}>
                        이전
                     </button>
                 )}
                 {pages}
                 {endPage < totalPages && (
                     <button
                        key="next"
                        onClick={() => !isLoading && pageClick(endPage + 1)}
                        disabled={isLoading}
                        className={`mx-1 px-3 py-1 rounded bg-gray-200`}>
                        다음
                    </button>
                 )}
            </div>
        );
    }
    return (
        <div className="search-book-result">
            <div className="mb-4">
                    <input type="text" placeholder="검색어를 입력하세요" className="border p-2 rounded" value={searchTerm}
                    onChange={handleSearch}  onKeyDown={(e) => {if (e.key === 'Enter' && !isLoading) {e.preventDefault(); searchClick();}}}  />
                    <button onClick={!isLoading ? searchClick : undefined}
                    className={`px-4 py-2 rounded ml-2 text-white transition
                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}`}>
                        검색
                    </button>
            </div>
           {searchResults && (
                <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                    <div>총 {searchResults.total_items}개의 검색 결과가 있습니다. 페이지 총 수는 20페이지로 제한됩니다.</div>
                    <div className="grid grid-cols-5 gap-4">
                    {searchResults.items.map((book, index) => (
                        <div
                            key={index}
                            className={`p-2 border rounded cursor-pointer hover:shadow-lg transition-shadow ${
                                isLoading ? 'pointer-events-none opacity-50' : ''
                            }`}
                            onClick={() => handleBookSelect(book)}
                        >
                            <img
                                className="w-full h-48 object-contain mb-2"
                                src={book.cover}
                                alt={book.bookTitle}
                            />
                            <p className="text-sm truncate">{book.bookTitle}</p>
                        </div>
                ))}
                </div>
                {renderPagination()}
             </div>
            )}
             {isLoading && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
}
export default SearchBookResult;