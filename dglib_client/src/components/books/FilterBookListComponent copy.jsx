import { getLibraryBookList } from "../../api/bookApi";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../routers/Loading";

const FilterBookListComponent = ({ searchParams, isSearched, isChecked, onSearchResults }) => {
    const [books, setBooks] = useState([]);
    const [pageable, setPageable] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const [searchHistory, setSearchHistory] = useState([]);
    const navigate = useNavigate();

    const isMounted = useRef(false);
    const lastProcessedSearchParamsRef = useRef(null);
    const latestRequestRef = useRef();
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            lastProcessedSearchParamsRef.current = searchParams;
            return;
        }
        if (isSearched && searchParams?.query &&
            JSON.stringify(searchParams) !== JSON.stringify(lastProcessedSearchParamsRef.current))
        {
            const newSearchEntry = { query: searchParams.query, option: searchParams.option };
            let updatedHistory = [];
            let targetPage = 1;
            const newUrlParams = new URLSearchParams();

            if (!isChecked) {
                updatedHistory = [newSearchEntry];
                newUrlParams.set("query", searchParams.query);
                newUrlParams.set("option", searchParams.option);
                newUrlParams.set("page", targetPage.toString());
                newUrlParams.delete("ischecked");
            } else {
                updatedHistory = [...searchHistory, newSearchEntry];
                searchHistory.forEach(historyItem => {
                    newUrlParams.append("prev_query", historyItem.query);
                    newUrlParams.append("prev_option", historyItem.option);
                });

                newUrlParams.set("query", searchParams.query);
                newUrlParams.set("option", searchParams.option);

                newUrlParams.set("page", targetPage.toString());
                newUrlParams.set("ischecked", "true");

            }
            setSearchHistory(updatedHistory);
            setSearchURLParams(newUrlParams);
            lastProcessedSearchParamsRef.current = searchParams;
        }
    }, [isSearched, isChecked, searchParams, searchHistory, searchURLParams, setSearchURLParams]);


    useEffect(() => {
        const currentPage = parseInt(searchURLParams.get("page") || "1", 10);
        const urlQuery = searchURLParams.get("query");
        const urlOption = searchURLParams.get("option");

        const currentRequestIdentifier = searchURLParams.toString();
        latestRequestRef.current = currentRequestIdentifier;

        const getBookList = async (requestIdentifier) => {
            const params = {};
            params.page = currentPage;

            if (urlQuery && urlOption) {
                params.query = urlQuery;
                params.option = urlOption;


                const prevQueriesFromUrl = searchURLParams.getAll("prev_query");
                const prevOptionsFromUrl = searchURLParams.getAll("prev_option");

                if (prevQueriesFromUrl.length > 0 && prevOptionsFromUrl.length > 0) {
                    params.previousQueries = prevQueriesFromUrl;
                    params.previousOptions = prevOptionsFromUrl;
                }

            }

            if (latestRequestRef.current === requestIdentifier) {
                setIsLoading(true);
            } else {
                return;
            }
            try {
                navigate(`/books/search?${params}`)
                const response = await getLibraryBookList(params);

                if (latestRequestRef.current === requestIdentifier) {
                    const content = Array.isArray(response?.content) ? response.content : [];
                    setBooks(content);
                    setPageable(response);
                    onSearchResults(content.length);


                }

            } catch (error) {
                     alert("도서 목록을 가져오는 중 오류가 발생했습니다." + error.response.data.message);
            } finally {
                setIsLoading(false);

            }
        };
        ;
        getBookList(currentRequestIdentifier);

        return () => {};

    }, [searchURLParams, onSearchResults]);

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