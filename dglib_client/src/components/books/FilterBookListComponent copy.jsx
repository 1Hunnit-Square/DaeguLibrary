import { getLibraryBookList } from "../../api/bookApi";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../routers/Loading";

const FilterBookListComponent = () => {
    const [books, setBooks] = useState([]);
    const [pageable, setPageable] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const [searchHistory, setSearchHistory] = useState([]);
    const navigate = useNavigate();

    const isMounted = useRef(false);
    const lastProcessedSearchParamsRef = useRef(null);
    const latestRequestRef = useRef();


    const pageClick = useCallback((page) => {
        const currentPageFromUrl = parseInt(searchURLParams.get("page") || "1", 10);
        if (page === currentPageFromUrl || isLoading) return;
        const newParams = new URLSearchParams(searchURLParams);
        newParams.set("page", page.toString());
        setSearchURLParams(newParams);
    }, [isLoading, searchURLParams, setSearchURLParams]);

    const { renderPagination } = usePagination(pageable, pageClick, isLoading);



    if (isLoading) {
      return (
          <div className="container mx-auto px-4 py-8 max-w-3xl">
              <div className="flex justify-center items-center py-10" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
          </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
          {pageable.totalElements !== undefined && (
              <div className="mb-4">총 도서 {pageable.totalElements}</div>
          )}
          {!isLoading && searchURLParams.has("query") && (
              <div className="mb-4 text-sm text-gray-600">
                  {(() => {
                      const urlQuery = searchURLParams.get("query");
                      const totalElements = pageable?.totalElements ?? 0;
                      const lastHistoryItem = searchHistory.length > 0 ? searchHistory[searchHistory.length - 1] : null;
                      const isReSearchContext = searchHistory.length > 1 &&
                                                lastHistoryItem?.query === urlQuery;

                      let message = "";

                      if (isReSearchContext) {
                          const historyQueries = searchHistory.map(item => item.query);
                          const joinedQueries = historyQueries.join(", ");
                          message = `"${joinedQueries}"에 대하여 ${totalElements}개가 검색되었습니다`;
                      } else if (urlQuery) {
                          message = `"${urlQuery}"에 대하여 ${totalElements}개가 검색되었습니다`;
                      }

                      return message;
                  })()}
              </div>
          )}

          <div className="space-y-6">
              {Array.isArray(books) && books.length > 0 ? (
                  books.map((book, index) => {
                      const key = book?.libraryBookId ?? `book-index-${index}`;
                       if (!book) return null;

                       return (
                           <Link key={key}
                               className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 gap-6 p-6"
                               to={`/librarybook/${book.libraryBookId}`}
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
                                   <h3 className="text-xl font-semibold mb-4">
                                       {book.bookTitle || '제목 없음'}
                                   </h3>
                                   <div className="space-y-2 text-gray-600">
                                       <p className="text-sm"><span className="font-medium">저자:</span> {book.author || '-'}</p>
                                       <p className="text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                       <p className="text-sm"><span className="font-medium">출판일:</span> {book.pubDate || '-'}</p>
                                       <p className="text-sm"><span className="font-medium">자료위치:</span> {book.location || '-'}</p>
                                       <p className="text-sm"><span className="font-medium">청구기호:</span> {book.callSign || '-'}</p>
                                       <p className="text-sm"><span className="font-medium">도서상태:</span>
                                           {book.rented === undefined ? '-' : (book.rented ? "대출중" : "대출가능")}
                                       </p>
                                   </div>
                               </div>
                           </Link>
                       );
                  })
              ) : (
                   searchURLParams.has("query") ? (
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
          {pageable.totalElements > 0 && pageable.totalPages > 1 && renderPagination()}
      </div>
    );
}

export default FilterBookListComponent;