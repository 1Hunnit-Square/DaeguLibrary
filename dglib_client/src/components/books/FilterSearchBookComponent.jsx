import Button from "../common/Button";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import SelectCopmonent from "../common/SelectComponent";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFsLibraryBookList } from "../../api/bookApi";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../routers/Loading";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import CheckBox from "../common/CheckBox";


const FilterSearchBookComponent = () => {
    const [filters, setFilters] = useState({
        title: "",
        isbn: "",
        author: "",
        yearStart: "",
        yearEnd: "",
        publisher: "",
        sortBy: "제목",
        orderBy: "오름차순",
        keyword: "",
        page: 1,
        size: 10
    });
    const [books, setBooks] = useState([]);
    const [pageable, setPageable] = useState({});
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const searchableParams = ['title', 'isbn', 'author', 'yearStart', 'yearEnd', 'publisher', 'keyword', 'page', 'size'];
    const queryClient = useQueryClient();
    const mid = useRecoilValue(memberIdSelector);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSortByChange = useCallback((value) => {
        setFilters(prev => ({
            ...prev,
            sortBy: value
        }));
    }, []);

    const handleOrderByChange = useCallback((value) => {
        setFilters(prev => ({
            ...prev,
            orderBy: value
        }));
    }, []);


    useEffect(() => {
        const newFilters = {};
        searchableParams.forEach(key => {
            newFilters[key] = searchURLParams.get(key) || '';
        });
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    }, [searchURLParams]);



    const handleSearch = useCallback(() => {
        const newParams = new URLSearchParams(filters);
        newParams.set("tab", "settings");

        setSearchURLParams(newParams);
    }, [filters, setSearchURLParams]);

    const { data, isLoading, isErrer } = useQuery({
        queryKey: ["librarybooklist", searchURLParams.toString(), mid],
        queryFn: () => {
            return getFsLibraryBookList(searchURLParams, mid);
        },
        refetchOnWindowFocus: false,
        enabled: searchableParams.some(param => searchURLParams.has(param))
    });

    const [hasSetInitialParams, setHasSetInitialParams] = useState(false);

    useEffect(() => {
        if (data && !hasSetInitialParams) {
            setBooks(data.content);
            console.log(data.content);
            setPageable(data);
            const currentTab = searchURLParams.get("tab");
            if (!searchURLParams.has("page") && data.pageable && currentTab !== "info") {
                setHasSetInitialParams(true);
                const newParams = new URLSearchParams(searchURLParams);
                newParams.set("page", (data.pageable.pageNumber + 1).toString());
                if (currentTab !== "settings") {
                newParams.set("tab", "info");
            }
                setSearchURLParams(newParams, { replace: true });
            }
        }
    }, [data, hasSetInitialParams]);

        const pageClick = useCallback((page) => {
        const currentPageFromUrl = parseInt(searchURLParams.get("page") || "1", 10);
        if (page === currentPageFromUrl || isLoading) return;
        const newParams = new URLSearchParams(searchURLParams);
        newParams.set("page", page.toString());
        setSearchURLParams(newParams);
        setSelectedBooks(new Set());
    }, [isLoading, searchURLParams, setSearchURLParams]);

    const onSelfClick = useCallback((e) => {
        alert("무인예약되었습니다.")
    }, []);
    const onFavoriteClick = useCallback((e) => {
        alert("관심도서에 추가되었습니다.")
    }, []);

    const handleSelectBooks = useCallback((e, item) => {
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
    }, []);

    const handleSelectAll = useCallback((e) => {
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
    }, [books]);

    const clickSelectFavorite = useCallback(() => {
        if (selectedBooks.size === 0) {
            alert("관심도서를 선택해주세요.");
            return;
        }

        const selectedTitles = Array.from(selectedBooks).map(bookId => {
        const book = books.find(book => book.libraryBookId === bookId);
        return book.bookTitle;
        });
        alert("관심도서에 추가되었습니다." + selectedTitles.join(", "));

    }, [selectedBooks, books]);

    const { renderPagination } = usePagination(pageable, pageClick, isLoading);



    const sortOption = useMemo(() => ["제목", "저자", "출판사", "발행연도"], []);
    const orderByOption = useMemo(() => ["오름차순", "내림차순"], []);

    return (
        <div>
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">도서명</p>
                    <input type="text" name="title" value={filters.title} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">ISBN</p>
                    <input type="text" name="isbn" value={filters.isbn} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">저자</p>
                    <input type="text" name="author" value={filters.author} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">발행연도</p>
                    <input type="number" name="yearStart" value={filters.yearStart} onChange={handleChange} className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                    <span className="mx-2">-</span>
                    <input type="number" name="yearEnd" value={filters.yearEnd} onChange={handleChange} className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">출판사</p>
                    <input type="text" name="publisher" value={filters.publisher} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">정렬기준</p>
                    <SelectCopmonent options={sortOption} defaultCategory="제목" selectClassName="w-32 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]" dropdownClassName="w-32" onChange={handleSortByChange} />
                    <SelectCopmonent options={orderByOption} defaultCategory="오름차순" selectClassName="w-32 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]" dropdownClassName="w-32" onChange={handleOrderByChange}  />
                </div>
                <div className="flex items-center col-span-2">
                    <p className="w-24 font-medium text-gray-700">키워드</p>
                    <input type="text" name="keyword" value={filters.keyword} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="col-span-2 flex justify-center mt-4">
                    <Button onClick={handleSearch} children="검색"/>
                </div>
            </div>
        </div>
            {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loading />
                    </div>
                ) : (
                    <>

                        {pageable.totalElements !== undefined ? (
                            <div className="mb-4">총 {pageable.totalElements}권의 도서를 찾았습니다. </div>
                        ) : (
                            <div>

                                    검색결과에 대하여 ${pageable.totalElements}권의 도서를 찾았습니다.

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

    );
}

export default FilterSearchBookComponent;