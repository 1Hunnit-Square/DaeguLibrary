import { getLibraryBookList } from "../api/bookApi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const LibraryBookListComponent = () => {
    const [books, setBooks] = useState([]);
    const [pageable, setPageable] = useState({});

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getBookList = async () => {
            setIsLoading(true);
            const response = await getLibraryBookList();
            setBooks(response.content);
            setPageable(response);
            setIsLoading(false);
            console.log(response.content);
        }
        getBookList();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const renderPagination = () => {
        if (!books || !pageable.pageable) return null;
        const maxPage = 20;
        const totalPages = Math.min(pageable.totalPages, maxPage);
        const startPage = Math.floor((pageable.pageable.pageNumber) / 10) * 10 + 1;
        const endPage = Math.min(startPage + 9, totalPages);
        const pages = [];

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`mx-1 px-3 py-1 rounded ${pageable.pageable.pageNumber === i-1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => !isLoading && pageClick(i)}
                    disabled={isLoading}
                >
                    {i}
                </button>
            );
        }




        return (
            <div className="flex justify-center mt-4">
                 {pageable.pageable.pageNumber > 10 && (
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

    const pageClick = async (page) => {
        if (page - 1 === pageable.pageable.pageNumber) return;
        setIsLoading(true);
        const response = await getLibraryBookList(page);
        setBooks(response.content);
        setPageable(response);
        setIsLoading(false);
     }



    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center">도서 목록</h2>
            <div className="mb-4">총 도서 {pageable.totalElements}</div>
            {isLoading && books.length > 0 && ( //
                <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            <div className="space-y-6">
            {books.map((book, index) => {
                 const libraryBookId = book.libraryBookId;


                return (
                    <Link key={index}
                        className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 gap-6 p-6"
                        to={`/librarybook/${libraryBookId}`}
                    >
                        <div className="w-full md:w-48 flex justify-center">
                            <img
                                src={book.cover}
                                alt={book.bookTitle}
                                className="h-64 object-contain"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-4">
                                {book.bookTitle}
                            </h3>
                            <div className="space-y-2 text-gray-600">
                                <p className="text-sm">
                                    <span className="font-medium">저자:</span> {book.author}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">출판사:</span> {book.publisher}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">출판일:</span> {book.pubDate}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">자료위치:</span> {book.location}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">청구기호:</span> {book.callSign}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">도서상태:</span> {book.rented ? "대출중" : "대출가능"}
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
            </div>
            {renderPagination()}
        </div>
    );
}

export default LibraryBookListComponent;