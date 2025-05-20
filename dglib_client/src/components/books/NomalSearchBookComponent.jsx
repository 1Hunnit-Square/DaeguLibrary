import { useState, useCallback, useMemo, memo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from "recoil";
import SearchSelectComponent from "../common/SearchSelectComponent";
import CheckBox from "../common/CheckBox";
import { getNsLibraryBookList } from "../../api/bookApi";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { memberIdSelector } from "../../atoms/loginState";
import CheckBoxNonLabel from "../common/CheckNonLabel";

const NomalSearchBookComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const queryClient = useQueryClient();
    const mid = useRecoilValue(memberIdSelector);
    const queryParams = useMemo(() => ({
        query: searchURLParams.get("query") || "",
        option: searchURLParams.get("option") || "전체",
        page: searchURLParams.get("page") || "1",
        isChecked: searchURLParams.has("isChecked"),
        previousQuery: searchURLParams.get("previousQuery") || "",
        previousOption: searchURLParams.get("previousOption") || ""
    }), [searchURLParams]);
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const isChecked = queryParams.isChecked;
    const isSearched = !!queryParams.query;
    const navigate = useNavigate();

    const searchOption = useMemo(() => ["전체", "제목", "저자", "출판사"], []);


    const { data = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ['librarybooklist', searchURLParams.toString(), mid],
        queryFn: () => {
            const params = {
                page: parseInt(queryParams.page, 10)
            };

            if (queryParams.query) {
                params.query = queryParams.query;
                params.option = queryParams.option;
            }

            if (isChecked) {
                const previousQuery = queryParams.previousQuery;
                const previousOption = queryParams.previousOption;

                if (previousQuery) {
                    params.previousQueries = previousQuery.split(",");
                    params.previousOptions = previousOption.split(",");
                } else {
                    params.previousQueries = [];
                    params.previousOptions = [];
                }
            }
            return getNsLibraryBookList(params, mid);
        },
        refetchOnWindowFocus: false,
    });

    const books = useMemo(() => data.content, [data.content]);
    console.log(books);

    const isAllSelected = useMemo(() => {
        return books.length > 0 && selectedBooks.size === books.length;
    }, [books, selectedBooks]);

    const handleSearch = useCallback((searchQuery, selectedOption) => {
        const newParams = new URLSearchParams();

        if (!isChecked) {
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("isSearched", "true");
            newParams.delete("isChecked");
        } else {
            const currentQuery = queryParams.query;
            const currentOption = queryParams.option;

            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("isSearched", "true");
            newParams.set("isChecked", "true");

            let previousQueries = queryParams.previousQuery ? queryParams.previousQuery.split(",") : [];
            let previousOptions = queryParams.previousOption ? queryParams.previousOption.split(",") : [];

            if (currentQuery) {
                previousQueries.push(currentQuery);
                previousOptions.push(currentOption);
            }

            newParams.set("previousQuery", previousQueries.join(","));
            newParams.set("previousOption", previousOptions.join(","));
        }

        newParams.set("tab", "info");
        newParams.set("page", "1");

        setSelectedBooks(new Set());
        setSearchURLParams(newParams);
    }, [isChecked, queryParams, setSearchURLParams]);

    const pageClick = useCallback((page) => {
        const currentPageFromUrl = parseInt(queryParams.page, 10);

        if (page === currentPageFromUrl || isLoading) return;

        const newParams = new URLSearchParams(searchURLParams);
        newParams.set("page", page.toString());
        setSearchURLParams(newParams);
        setSelectedBooks(new Set());
    }, [queryParams.page, searchURLParams, isLoading, setSearchURLParams]);

    const onChangeRe = useCallback((e) => {
        const newValue = e.target.checked;
        const newParams = new URLSearchParams(searchURLParams);

        if (newValue) {
            newParams.set("isChecked", "true");
        } else {
            newParams.delete("isChecked");
        }

        setSearchURLParams(newParams, { replace: true });
        queryClient.setQueryData(['librarybooklist', newParams.toString(), mid], data);
    }, [searchURLParams, setSearchURLParams, queryClient, mid, data]);

    const onSelfClick = useCallback(() => {
        alert("무인예약되었습니다.");
    }, []);

    const onFavoriteClick = useCallback(() => {
        alert("관심도서에 추가되었습니다.");
    }, []);

    const handleSelectBooks = useCallback((e, itemId) => {
        const isSelected = e.target.checked;

        setSelectedBooks(prev => {
            const newSelectedBooks = new Set(prev);

            if (isSelected) {
                newSelectedBooks.add(itemId);
            } else {
                newSelectedBooks.delete(itemId);
            }

            return newSelectedBooks;
        });
    }, []);

    const handleSelectAll = useCallback((e) => {
        const isSelected = e.target.checked;

        if (isSelected) {
            const newSelectedBooks = new Set();
            books.forEach(book => {
                if (book?.libraryBookId) {
                    newSelectedBooks.add(book.libraryBookId);
                }
            });
            setSelectedBooks(newSelectedBooks);
        } else {
            setSelectedBooks(new Set());
        }
    }, [books]);

    const clickSelectFavorite = useCallback(() => {
        if (selectedBooks.size === 0) {
            alert("관심도서를 선택해주세요.");
            return;
        }

        const selectedTitles = Array.from(selectedBooks).map(bookId => {
            const book = books.find(book => book.libraryBookId === bookId);
            return book?.bookTitle || '';
        });

        alert("관심도서에 추가되었습니다: " + selectedTitles.join(", "));
    }, [selectedBooks, books]);

    const { renderPagination } = usePagination(data, pageClick, isLoading);

    const renderSearchResultCount = useMemo(() => {
        if (!isSearched && data.totalElements !== undefined) {
            return (
                <div className="mb-4">
                    <p className="">총 {data.totalElements}권의 도서를 찾았습니다.</p>
                </div>
            );
        }

        if (data.totalElements !== undefined) {
            return (
                <div>
                    {queryParams.previousQuery ?
                        `"${queryParams.previousQuery}, ${queryParams.query}"에 대하여 ${data.totalElements}권의 도서를 찾았습니다.` :
                        `"${queryParams.query}"에 대하여 ${data.totalElements}권의 도서를 찾았습니다.`
                    }
                </div>
            );
        }

        return null;
    }, [isSearched, data.totalElements, queryParams.previousQuery, queryParams.query]);

    return (
        <div>
            <SearchSelectComponent
                options={searchOption}
                handleSearch={handleSearch}
                input={queryParams.query}
                defaultCategory={queryParams.option}
                selectClassName="mr-2 md:mr-5"
                dropdownClassName="w-24 md:w-32"
                className="w-full md:w-[50%] mx-auto"
                inputClassName="w-full"
                buttonClassName="right-2"
            />
            {isSearched && books.length > 1 &&
                <CheckBoxNonLabel
                    checked={isChecked}
                    onChange={onChangeRe}
                    label="결과 내 재검색"
                    checkboxClassName="mt-5 ml-2 relative left-110"
                />
            }

            <div className="container mx-auto px-4 py-8 w-ful">
                {renderSearchResultCount}
                <div className="space-y-6">
                   {isLoading ? (
                        <Loading text="도서 검색중입니다"/>
                    ) : isError ? (
                        <div className="flex justify-center items-center py-10">
                            <p className="text-red-500 font-medium">
                                서버에서 책 데이터를 불러오는데 실패했습니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex mx-3 gap-3">
                                <CheckBoxNonLabel
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    inputClassName="hover:cursor-pointer w-4 h-4"
                                />
                                <Button
                                    onClick={clickSelectFavorite}
                                    className=""
                                >
                                    관심도서 담기
                                </Button>
                            </div>
                            {books.map((book, index) => {
                                if (!book) return null;

                                const key = book?.libraryBookId ?? `book-index-${index}`;
                                const libraryBookId = book.libraryBookId;
                                const canReserve = book.rented === true && book.reserveCount < 2 && book.alreadyReservedByMember === false && book.alreadyBorrowedByMember === false;

                                return (
                                    <div
                                        key={key}
                                        className="flex flex-row bg-white rounded-lg -mt-1 shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-6 p-6"
                                    >
                                        <div className="w-full md:w-48 flex justify-center">
                                            <CheckBoxNonLabel
                                                checked={selectedBooks.has(book.libraryBookId)}
                                                onChange={(e) => handleSelectBooks(e, book.libraryBookId)}
                                                inputClassName="hover:cursor-pointer relative bottom-30 right-1 w-4 h-4"
                                            />
                                            <img
                                                src={book.cover || '/placeholder-image.png'}
                                                alt={book.bookTitle || '표지 없음'}
                                                className="h-64 object-contain"
                                                onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Link
                                                to={`/books/detail/${libraryBookId}`}
                                                className="block text-xl font-semibold mb-4 hover:underline hover:cursor-pointer"
                                            >
                                                {book.bookTitle}
                                            </Link>
                                            <div className="space-y-2 text-gray-600">
                                                <p className="text-sm"><span className="font-medium">저자:</span> {book.author || '-'}</p>
                                                <p className="text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                                <p className="text-sm"><span className="font-medium">출판일:</span> {book.pubDate || '-'}</p>
                                                <p className="text-sm"><span className="font-medium">자료위치:</span> {book.location || '-'}</p>
                                                <p className="text-sm"><span className="font-medium">청구기호:</span> {book.callSign || '-'}</p>
                                                <p className="text-sm">
                                                    <span className="font-medium">도서상태:</span>
                                                    {book.rented === undefined ? '-' : (book.rented ? "대출중" : "대출가능")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-3">
                                            <Button
                                                disabled={!canReserve || isLoading}
                                                className={`${canReserve ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' : 'bg-gray-400 hover:bg-gray-400 hover:cursor-default'}`}
                                            >
                                                대출예약
                                            </Button>
                                            <Button
                                                className="bg-fuchsia-800 hover:bg-fuchsia-900"
                                                onClick={onSelfClick}
                                            >
                                                무인예약
                                            </Button>
                                            <Button
                                                className=""
                                                onClick={onFavoriteClick}
                                            >
                                                관심도서
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
                {renderPagination()}
            </div>
        </div>
    );
}

export default memo(NomalSearchBookComponent);