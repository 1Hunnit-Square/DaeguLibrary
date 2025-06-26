import { useCallback, useMemo, memo, useEffect, useRef, forwardRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { reserveBook, unMannedReserve, addInterestedBook } from '../../api/memberApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SearchSelectComponent from "../common/SearchSelectComponent";
import { getNsLibraryBookList } from "../../api/bookApi";
import { usePagination } from "../../hooks/usePage";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import CheckNonLabel from "../common/CheckNonLabel";
import { useBookMutation } from '../../hooks/useBookMutation';
import { useBookActions } from '../../hooks/useBookActions';
import { useItemSelection } from '../../hooks/useItemSelection';

const NomalSearchBookComponent = forwardRef ( (_, ref ) => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const queryClient = useQueryClient();
    const isChecked = searchURLParams.has("isChecked");
    const isSearched = !!searchURLParams.get("query");


    const { data = { books: { content: [], totalElements: 0 }, keywords: [] }, isLoading, isError, error } = useQuery({
        queryKey: ['nslibrarybooklist', searchURLParams.toString()],
        queryFn: () => {
            const params = {
                page: parseInt(searchURLParams.get("page") || "1", 10)
            };
            if (searchURLParams.get("query")) {
                params.query = searchURLParams.get("query");
                params.option = searchURLParams.get("option") || "전체";
            }
            if (isChecked) {
                const previousQuery = searchURLParams.get("previousQuery") || "";
                const previousOption = searchURLParams.get("previousOption") || "";

                if (previousQuery) {
                    params.previousQueries = previousQuery.split(",");
                    params.previousOptions = previousOption.split(",");
                } else {
                    params.previousQueries = [];
                    params.previousOptions = [];
                }
            }
            return getNsLibraryBookList(params);
        },
        refetchOnWindowFocus: false,
    });

    const books = useMemo(() => data.books.content, [data.books.content]);
    console.log(data);

    const { selectedItems: selectedBooks, isAllSelected, handleSelectItem: handleSelectBooks, handleSelectAll, resetSelection } = useItemSelection(books, 'libraryBookId');
    const resetSelectedBooks = () => resetSelection(new Set());

    const reserveMutation = useBookMutation(async (book) => await reserveBook(book), { successMessage: "도서를 예약했습니다.", onReset: resetSelectedBooks, queryKeyToInvalidate: 'nslibrarybooklist'} );

    const unMannedReserveMutation = useBookMutation(async (book) => await unMannedReserve(book), { successMessage: "도서를 무인예약했습니다.", onReset: resetSelectedBooks, queryKeyToInvalidate: 'nslibrarybooklist'} );

    const interestedMutation = useBookMutation( async (book) => await addInterestedBook(book), { successMessage: "도서를 관심도서로 등록했습니다.", onReset: resetSelectedBooks, queryKeyToInvalidate: 'nslibrarybooklist'});

    const { handleReserveClick, handleUnMannedReserveClick, handleInterestedClick, clickSelectFavorite } = useBookActions(
        { reserve: reserveMutation, unmanned: unMannedReserveMutation, interested: interestedMutation}, selectedBooks);

    const handleSearch = useCallback((searchQuery, selectedOption) => {
        const newParams = new URLSearchParams();

        if (!isChecked) {
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("isSearched", "true");
            newParams.delete("isChecked");
        } else {
            const currentQuery = searchURLParams.get("query") || "";
            const currentOption = searchURLParams.get("option") || "전체";

            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("isSearched", "true");
            newParams.set("isChecked", "true");

            const previousQueries = searchURLParams.get("previousQuery") ? searchURLParams.get("previousQuery").split(",") : [];
            const previousOptions = searchURLParams.get("previousOption") ? searchURLParams.get("previousOption").split(",") : [];

            const updatedQueries = currentQuery ? [...previousQueries, currentQuery] : previousQueries;
            const updatedOptions = currentQuery ? [...previousOptions, currentOption] : previousOptions;

            newParams.set("previousQuery", updatedQueries.join(","));
            newParams.set("previousOption", updatedOptions.join(","));
        }
        if(isChecked && books && books.length === 0) {
            newParams.delete("isChecked");
            newParams.delete("previousQuery");
            newParams.delete("previousOption");
        }

        newParams.set("tab", "info");
        newParams.set("page", "1");

        resetSelection(new Set());
        setSearchURLParams(newParams);
    }, [isChecked, setSearchURLParams, resetSelection]);


    const onChangeRe = useCallback((e) => {
        const newValue = e.target.checked;
        const newParams = new URLSearchParams(searchURLParams);
        if (newValue) {
            newParams.set("isChecked", "true");
        } else {
            newParams.delete("isChecked");
        }
        queryClient.setQueryData(['nslibrarybooklist', newParams.toString()], data);
        setSearchURLParams(newParams, { replace: true });

    }, [searchURLParams, setSearchURLParams, queryClient, data]);


    const searchOption = useMemo(() => ["전체", "제목", "저자", "출판사"], []);

    const { renderPagination } = usePagination(data.books, searchURLParams, setSearchURLParams, isLoading, resetSelectedBooks, ref);



    if (reserveMutation.isPending || unMannedReserveMutation.isPending || interestedMutation.isPending) {
        return (
            <Loading />
        );
    }

    return (
        <div>
           
           <SearchSelectComponent
                options={searchOption}
                handleSearch={handleSearch}
                input={searchURLParams.get("query") || ""}
                defaultCategory={searchURLParams.get("option") || "전체"}
                selectClassName="mr-2 md:mr-5"
                dropdownClassName="w-24 md:w-32"
                className="w-full px-4 md:w-[70%] lg:w-[50%] mx-auto"
                inputClassName="w-full"
                buttonClassName="right-2"
            />
            
            <div className="w-full px-4 md:w-[70%] lg:w-[50%] mx-auto mt-3">
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-2">
                        <span className="text-sm pl-3 my-auto font-bold text-gray-700 whitespace-nowrap sm:mr-2">인기검색어</span>
                        <div className="flex flex-wrap gap-2">
                            {data.keywords && data.keywords.length > 0 ? (
                                data.keywords.map((keyword, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(keyword, "전체")}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-green-600 hover:text-white hover:border-green-600 cursor-pointer transition-colors"
                                    >
                                        {keyword}
                                    </button>
                                ))
                            ) : (
                                <span className="text-gray-500 text-sm">인기검색어가 없습니다.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

           
            {isSearched && books.length > 1 &&
                <CheckNonLabel
                    checked={isChecked}
                    onChange={onChangeRe}
                    label="결과 내 재검색"
                    checkboxClassName="mt-5 ml-4"
                />
            }

           
            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
               
                {!isSearched && data.books.totalElements !== undefined ? (
                    <div className="mb-4 px-2">
                        <p className="text-sm md:text-base">총 {data.books.totalElements}권의 도서를 찾았습니다.</p>
                    </div>
                ) : data.books.totalElements !== undefined ? (
                    <div className="mb-4 px-2">
                        <p className="text-sm md:text-base">
                            {searchURLParams.get("previousQuery") ?
                                `"${searchURLParams.get("previousQuery")}, ${searchURLParams.get("query")}"에 대하여 ${data.books.totalElements}권의 도서를 찾았습니다.` :
                                `"${searchURLParams.get("query") || ""}"에 대하여 ${data.books.totalElements}권의 도서를 찾았습니다.`
                            }
                        </p>
                    </div>
                ) : null}

                <div className="space-y-4 md:space-y-6">
                    {isLoading ? (
                        <Loading text="도서 검색중입니다"/>
                    ) : reserveMutation.isPending || unMannedReserveMutation.isPending || interestedMutation.isPending ? (
                        <Loading text="처리중입니다..."/>
                    ) : isError ? (
                        <div className="flex justify-center items-center py-10">
                            <p className="text-red-500 font-medium text-sm md:text-base">
                                서버에서 책 데이터를 불러오는데 실패했습니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            {books && books.length > 0 ? (
                                <>
                                    
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mx-2 md:mx-4">
                                        <CheckNonLabel
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            inputClassName="hover:cursor-pointer w-4 h-4"
                                        />
                                        <Button
                                            onClick={clickSelectFavorite}
                                            className="text-sm md:text-base px-3 py-2 md:px-4"
                                            children="관심도서 담기"
                                        />
                                    </div>

                                   
                                    {books.map((book, index) => {
                                        if (!book) return null;
                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-4 md:gap-6 p-4 md:p-6 mx-2 md:mx-0"
                                            >
                                                
                                                <div className="flex flex-row md:flex-col items-start md:w-40 lg:w-48 gap-3 md:gap-2">
                                                    <CheckNonLabel
                                                        checked={selectedBooks.has(book.libraryBookId)}
                                                        onChange={(e) => handleSelectBooks(e, book.libraryBookId)}
                                                        inputClassName="hover:cursor-pointer w-4 h-4 mt-1 md:mb-2 md:self-start"
                                                    />
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={book.cover || '/placeholder-image.png'}
                                                            alt={book.bookTitle || '표지 없음'}
                                                            className="w-20 h-28 md:w-32 md:h-44 lg:w-auto lg:h-64 object-contain"
                                                            onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                        />
                                                    </div>
                                                </div>

                                               
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
                                                        <Link to={`/books/detail/${book.isbn}`} className="inline">
                                                            <span className="hover:underline hover:text-green-700 hover:cursor-pointer break-words">
                                                                {book.bookTitle}
                                                            </span>
                                                        </Link>
                                                    </div>
                                                    <div className="space-y-1 md:space-y-2 text-gray-600">
                                                        <p className="text-xs md:text-sm"><span className="font-medium">저자:</span> {book.author || '-'}</p>
                                                        <p className="text-xs md:text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                                        <p className="text-xs md:text-sm"><span className="font-medium">출판일:</span> {book.pubDate || '-'}</p>
                                                        <p className="text-xs md:text-sm"><span className="font-medium">자료위치:</span> {book.location || '-'}</p>
                                                        <p className="text-xs md:text-sm"><span className="font-medium">청구기호:</span> {book.callSign || '-'}</p>
                                                        <p className="text-xs md:text-sm">
                                                            <span className="font-medium">도서상태:</span> 
                                                            {book.overdue ? `연체중(${book.reserveCount}명)` : 
                                                             book.borrowed ? `대출중(${book.reserveCount}명)` : 
                                                             book.unmanned ? `무인예약중(${book.reserveCount}명)` : 
                                                             book.reserved ? `예약대기중(${book.reserveCount}명)` : "대출가능"}
                                                        </p>
                                                    </div>
                                                </div>

                                               
                                                <div className="flex flex-row md:flex-col justify-center items-center gap-2 md:gap-3 mt-4 md:mt-0 md:w-24 lg:w-auto">
                                                    <Button
                                                        disabled={isLoading || !(book.borrowed || book.unmanned) || book.reserveCount >= 2}
                                                        className="px-2 py-1 md:px-3 md:py-2 lg:px-6 rounded text-white transition text-xs md:text-xs w-full md:w-20 lg:w-auto bg-blue-500 hover:bg-blue-600 cursor-pointer disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400"
                                                        children={"대출예약"}
                                                        onClick={() => handleReserveClick(book)}
                                                    />

                                                    <Button
                                                        className="px-2 py-1 md:px-3 md:py-2 lg:px-6 rounded text-white transition text-xs md:text-xs w-full md:w-20 lg:w-auto bg-fuchsia-800 hover:bg-fuchsia-900 cursor-pointer disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400"
                                                        onClick={() => handleUnMannedReserveClick(book)}
                                                        children="무인예약"
                                                        disabled={isLoading || book.borrowed || book.unmanned || book.reserveCount > 0}
                                                    />
                                                    
                                                    <Button
                                                        className="px-2 py-1 md:px-3 md:py-2 lg:px-6 rounded text-white transition text-xs md:text-xs w-full md:w-20 lg:w-auto bg-green-600 hover:bg-green-700 cursor-pointer disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
                                                        children="관심도서"
                                                        disabled={isLoading}
                                                        onClick={() => handleInterestedClick(book)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="flex justify-center items-center py-10">
                                    <p className="text-gray-500 text-sm md:text-base px-4 text-center">
                                        {searchURLParams.has("query") ? "검색 결과가 없습니다." : "표시할 도서가 없습니다."}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                <div className="mt-6 md:mt-8">
                    {renderPagination()}
                </div>
            </div>
        </div>
    );
})

export default memo(NomalSearchBookComponent);