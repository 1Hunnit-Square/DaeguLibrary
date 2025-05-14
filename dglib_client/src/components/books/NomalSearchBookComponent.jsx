import SearchSelectComponent from "../common/SearchSelectComponent";
import CheckBox from "../common/CheckBox";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNsLibraryBookList } from "../../api/bookApi";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";



const NomalSearchBookComponent = () => {
    const [books, setBooks] = useState([]);
    const [pageable, setPageable] = useState({});
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const [isSearched, setIsSearched] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const queryClient = useQueryClient();
    const mid = useRecoilValue(memberIdSelector);

    const [searchParams, setSearchParams] = useState({
        query: "",
        option: "전체"
    });

    useEffect(() => {
        if (books && books.length > 0 && selectedBooks.size === books.length) {
            setIsAllSelected(true);
        } else {
            setIsAllSelected(false);
        }

    }, [books, selectedBooks])

    useEffect(() => {
        const query = searchURLParams.get("query");
        const option = searchURLParams.get("option");
        const isChecked = searchURLParams.get("isChecked");
        if (!query && searchURLParams.has("page")) {
            setBooks([]);
            setPageable({});
            setIsSearched(false);
            setIsChecked(false);
            setSearchParams({
                query: "",
                option: "전체"
            });
            return;
        }
        if (query) {
            setSearchParams({
                query: query,
                option: option || "전체"
            });
            setIsSearched(true);
        }
        if (isChecked) {
            setIsChecked(true);
        } else {
            setIsChecked(false);
        }
    }, [searchURLParams]);



    const { data, isLoading, isError } = useQuery({
        queryKey: ['librarybooklist', searchURLParams.toString(), mid],
        queryFn: () => {
            const params = {};
            const page = searchURLParams.get("page") || "1";
            params.page = parseInt(page, 10);
            if (searchURLParams.has("query")) {
                params.query = searchURLParams.get("query");
                params.option = searchURLParams.get("option");
            }
            if (isChecked) {
                const previousQuery = searchURLParams.get("previousQuery");
                const previousOption = searchURLParams.get("previousOption");
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

    useEffect(() => {
        if (data) {
            setBooks(data.content);
            setPageable(data);
            console.log(data);
            if (!searchURLParams.has("page") && data.pageable) {
                const newParams = new URLSearchParams(searchURLParams);
                newParams.set("tab", "info");
                newParams.set("page", (data.pageable.pageNumber + 1).toString());
                setSearchURLParams(newParams, { replace: true });
            }
        }
    }, [data, searchURLParams, setSearchURLParams]);

    const handleSearch = (searchQuery, selectedOption) => {
        setSearchParams({
            query: searchQuery,
            option: selectedOption
        });
        setIsSearched(true);
        const newParams = new URLSearchParams();

        if (!isChecked) {
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("isSearched", "true");
            newParams.delete("isChecked");
        } else {
            const currentQuery = searchURLParams.get("query");
            const currentOption = searchURLParams.get("option");
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("isSearched", "true");
            newParams.set("isChecked", "true");

            let previousQueries = searchURLParams.get("previousQuery") || "";
            let previousOptions = searchURLParams.get("previousOption") || "";
            previousQueries = previousQueries ? previousQueries.split(",") : [];
            previousOptions = previousOptions ? previousOptions.split(",") : [];
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
        setIsAllSelected(false);

        setSearchURLParams(newParams);
    };

    const pageClick = (page) => {
        const currentPageFromUrl = parseInt(searchURLParams.get("page") || "1", 10);
        if (page === currentPageFromUrl || isLoading) return;
        const newParams = new URLSearchParams(searchURLParams);
        newParams.set("page", page.toString());
        setSearchURLParams(newParams);
        setSelectedBooks(new Set());
    };

    const onChangeRe = (e) => {
        const newValue = e.target.checked;
        setIsChecked(newValue);


        const newParams = new URLSearchParams(searchURLParams);
        if (newValue) {
            newParams.set("isChecked", "true");
        } else {
            newParams.delete("isChecked");
        }

        setSearchURLParams(newParams, { replace: true });
        queryClient.setQueryData(['librarybooklist', newParams.toString(), mid], pageable);
    }
    const onSelfClick = (e) => {
        alert("무인예약되었습니다.")
    }
    const onFavoriteClick = (e) => {
        alert("관심도서에 추가되었습니다.")
    }

    const handleSelectBooks = (e, item) => {
        const isSelected = e.target.checked;
        setSelectedBooks(prev => {
            const newSelectedBooks = new Set(prev);
            if (isSelected) {

                newSelectedBooks.add(item.libraryBookId);
            } else {
                newSelectedBooks.delete(item.libraryBookId);
            }
            return newSelectedBooks;
        });
    }

    const handleSelectAll = (e) => {
        const isSelected = e.target.checked;
        setIsAllSelected(isSelected);
        if (isSelected) {
            const newSelectedBooks = new Set();
            books.forEach(book => {
            newSelectedBooks.add(book.libraryBookId);
        });
        setSelectedBooks(newSelectedBooks);
        } else {
        setSelectedBooks(new Set());
        }
    }

    const clickSelectFavorite = () => {
        if (selectedBooks.size === 0) {
            alert("관심도서를 선택해주세요.");
            return;
        }

        const selectedTitles = Array.from(selectedBooks).map(bookId => {
        const book = books.find(book => book.libraryBookId === bookId);
        return book.bookTitle;
        });
        alert("관심도서에 추가되었습니다." + selectedTitles.join(", "));

    }




    const { renderPagination } = usePagination(pageable, pageClick, isLoading);
    const searchOption = ["전체", "제목", "저자", "출판사"];
    const query = searchURLParams.get("query");
    const previousQuery = searchURLParams.get("previousQuery");



    return (
        <div>
            <SearchSelectComponent
                options={searchOption}
                handleSearch={handleSearch}
                input={searchParams.query}
                defaultCategory={searchParams.option}
                selectClassName="mr-5"
                dropdownClassName="w-32"
                className="w-[50%] mx-110"
                inputClassName="w-100"
                buttonClassName="right-[calc(37%-10px)]"
            />
            {isSearched && data?.content?.length > 1 &&
                <CheckBox
                    checked={isChecked}
                    onChange={onChangeRe}
                    label="결과 내 재검색"
                    checkboxClassName="mt-5 ml-2 relative left-110"
                />
            }

            <div className="container mx-auto px-4 py-8 w-ful">

                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loading />
                    </div>
                ) : (
                    <>

                        {!isSearched && pageable.totalElements !== undefined ? (
                            <div className="mb-4">
                                <p className="">총 {pageable.totalElements}권의 도서를 찾았습니다. </p>
                            </div>
                        ) : (
                            <div>
                                {previousQuery ?
                                    `"${previousQuery}, ${query}"에 대하여 ${pageable.totalElements}권의 도서를 찾았습니다.` :
                                    `"${query}"에 대하여 ${pageable.totalElements}권의 도서를 찾았습니다.`
                                }
                            </div>
                        )}
                        <div className="space-y-6">

                            {Array.isArray(books) && books.length > 0 ? (
                                <>
                                <div className="flex mx-3 gap-3">
                                <CheckBox checked={isAllSelected} onChange={(e) => handleSelectAll(e)} inputClassName={"hover:cursor-pointer"} />
                                <Button children={"관심도서 담기"} onClick={clickSelectFavorite} className={""} />
                                </div>
                                {books.map((book, index) => {
                                    const key = book?.libraryBookId ?? `book-index-${index}`;
                                    const libraryBookId = book.libraryBookId;
                                    const canReserve = book.rented === true && book.reserveCount < 2 && book.alreadyReservedByMember === false;
                                    if (!book) return null;
                                    return (
                                        <div key={key}
                                            className="flex flex-row bg-white rounded-lg -mt-1 shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-6 p-6"
                                        >

                                            <div className="w-full md:w-48 flex justify-center">
                                                <CheckBox checked={selectedBooks.has(book.libraryBookId)} onChange={(e) => handleSelectBooks(e, book)} inputClassName={"hover:cursor-pointer relative bottom-30 right-1"} />
                                                <img
                                                    src={book.cover || '/placeholder-image.png'}
                                                    alt={book.bookTitle || '표지 없음'}
                                                    className="h-64 object-contain"
                                                    onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Link to={`/books/detail/${libraryBookId}`} className="block text-xl font-semibold mb-4 hover:underline hover:cursor-pointer">
                                                    {book.bookTitle}
                                                </Link>
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
                                            <div className="flex flex-col justify-center items-center gap-3">
                                                <Button disabled={!canReserve || isLoading} className={`${canReserve ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' : 'bg-gray-400 hover:bg-gray-400 hover:cursor-default'}`}  children="대출예약"/>
                                                <Button className="bg-fuchsia-800 hover:bg-fuchsia-900" onClick={onSelfClick} children="무인예약"/>
                                                <Button className= "" onClick={onFavoriteClick} children="관심도서"/>
                                            </div>
                                        </div>
                                    );

                                })}
                                </>

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
                    </>
                )}
                {renderPagination()}
            </div>
        </div>

        );
}

export default NomalSearchBookComponent;