import Button from "../common/Button";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import SelectCopmonent from "../common/SelectComponent";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getFsLibraryBookList } from "../../api/bookApi";
import Loading from "../../routers/Loading";
import CheckNonLabel from "../common/CheckNonLabel";
import { reserveBook, unMannedReserve, addInterestedBook } from '../../api/memberApi';
import { usePagination } from "../../hooks/usePage";
import { useItemSelection } from "../../hooks/useItemSelection";
import { useBookMutation } from "../../hooks/useBookMutation";
import { useBookActions } from '../../hooks/useBookActions';


const FilterSearchBookComponent = () => {
    const [filters, setFilters] = useState({
        title: "",
        isbn: "",
        author: "",
        yearStart: "",
        yearEnd: "",
        publisher: "",
        sortBy: "bookTitle",
        orderBy: "desc",
        keyword: "",
        page: 1,
        size: 10
    });
    const sortOption =  useMemo(() => ({"제목": "bookTitle", "저자": "author", "출판사": "publisher", "발행연도": "pubDate"}), []);
    const orderByOption = useMemo(() => ({"오름차순": "asc", "내림차순": "desc"}), []);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { data = { content: [], totalElements: 0 }, isLoading, isError, error } = useQuery({
        queryKey: ["fslibrarybooklist", searchURLParams.toString()],
        queryFn: () => {
            return getFsLibraryBookList(searchURLParams);
        },
    });
    const books = useMemo(() => data.content, [data.content]);

    const { selectedItems: selectedBooks, isAllSelected, handleSelectItem: handleSelectBooks, handleSelectAll, resetSelection } = useItemSelection(books, 'libraryBookId');
    const resetSelectedBooks = () => resetSelection(new Set());

    const reserveMutation = useBookMutation(async (book) => await reserveBook(book), { successMessage: "도서를 예약했습니다.", onReset: resetSelectedBooks, queryKeyToInvalidate: 'fslibrarybooklist'} );

    const unMannedReserveMutation = useBookMutation(async (book) => await unMannedReserve(book), { successMessage: "도서를 무인예약했습니다.", onReset: resetSelectedBooks, queryKeyToInvalidate: 'fslibrarybooklist'} );

    const interestedMutation = useBookMutation( async (book) => await addInterestedBook(book), { successMessage: "도서를 관심도서로 등록했습니다.", onReset: resetSelectedBooks, queryKeyToInvalidate: 'fslibrarybooklist'});

    const { handleReserveClick, handleUnMannedReserveClick, handleInterestedClick, clickSelectFavorite } = useBookActions(
        { reserve: reserveMutation, unmanned: unMannedReserveMutation, interested: interestedMutation}, selectedBooks);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterValueChange = useCallback((value, field) => {
    setFilters(prev => ({
        ...prev,
        [field]: value
    }));
    }, []);


    useEffect(() => {
        const newFilters = {};
        Object.keys(filters).forEach(key => {
            const paramValue = searchURLParams.get(key);
            if (paramValue !== null) {
            newFilters[key] = paramValue;
            }
        });
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
        }, [searchURLParams]);

    const handleSearch = useCallback(() => {

        const newParams = new URLSearchParams(filters);
        newParams.set("tab", "settings");
        newParams.set("page", "1");
        newParams.set("sortBy", filters.sortBy);
        newParams.set("orderBy", filters.orderBy);
        setSearchURLParams(newParams);
    }, [filters, setSearchURLParams]);

    const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
    }, [handleSearch]);

    const { renderPagination } = usePagination(data, searchURLParams, setSearchURLParams, isLoading, resetSelectedBooks);

    return (
        <div>
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">도서명</p>
                    <input type="text" name="title" value={filters.title} onChange={handleChange} onKeyDown={handleKeyDown} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">ISBN</p>
                    <input type="text" name="isbn" value={filters.isbn} onChange={handleChange} onKeyDown={handleKeyDown}  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">저자</p>
                    <input type="text" name="author" value={filters.author} onChange={handleChange} onKeyDown={handleKeyDown} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">발행연도</p>
                    <input type="number" name="yearStart" value={filters.yearStart} onChange={handleChange} onKeyDown={handleKeyDown} className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                    <span className="mx-2">-</span>
                    <input type="number" name="yearEnd" value={filters.yearEnd} onChange={handleChange} onKeyDown={handleKeyDown} className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">출판사</p>
                    <input type="text" name="publisher" value={filters.publisher} onChange={handleChange} onKeyDown={handleKeyDown} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">정렬기준</p>
                    <SelectCopmonent name="sortBy" value={filters.sortBy} options={sortOption}  selectClassName="w-32 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]" dropdownClassName="w-32" onChange={(value) => handleFilterValueChange(value, 'sortBy')} />
                    <SelectCopmonent name="orderBy" value={filters.orderBy} options={orderByOption}  selectClassName="w-32 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]" dropdownClassName="w-32" onChange={(value) => handleFilterValueChange(value, 'orderBy')}  />
                </div>
                <div className="flex items-center col-span-2">
                    <p className="w-24 font-medium text-gray-700">키워드</p>
                    <input type="text" name="keyword" value={filters.keyword} onChange={handleChange} onKeyDown={handleKeyDown} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="col-span-2 flex justify-center mt-4">
                    <Button onClick={handleSearch} children="검색"/>
                </div>
            </div>
        </div>
            <div className="container mx-auto px-4 py-8 w-full">
            {data.totalElements !== undefined ? (
                                <div className="mb-4">총 {data.totalElements}권의 도서를 찾았습니다. </div>
                            ) : (
                                <div>

                                        검색결과에 대하여 {data?.totalElements ?? 0}권의 도서를 찾았습니다.

                                </div>
                            )}
            {isLoading ? (
                            <Loading text="도서 검색중입니다.." />
                            ) : reserveMutation.isPending || unMannedReserveMutation.isPending || interestedMutation.isPending ? (
                                <Loading text="처리중입니다.."/>
                            )
                            : isError ? (
                                <div className="flex justify-center items-center py-10">
                                    <p className="text-red-500 font-medium">
                                        서버에서 책 데이터를 불러오는데 실패했습니다.
                                    </p>
                                </div>
                            ) : (
                        <>
                        <div className="space-y-6">

                            {Array.isArray(books) && books.length > 0 ? (
                                <>
                                <div className="flex mx-3 gap-3">
                                <CheckNonLabel
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    inputClassName="hover:cursor-pointer w-4 h-4"
                                />
                                <Button
                                    onClick={clickSelectFavorite}
                                    className=""
                                    children="관심도서 담기"
                                />
                                </div>
                                {books.map((book, index) => {
                                    if (!book) return null;
                                    return (
                                        <div key={index}
                                            className="flex flex-row bg-white rounded-lg -mt-1 shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-6 p-6"
                                        >

                                            <div className="w-full md:w-48 flex justify-center">
                                                <CheckNonLabel checked={selectedBooks.has(book.libraryBookId)} onChange={(e) => handleSelectBooks(e, book)} inputClassName={"hover:cursor-pointer relative bottom-30 right-1 w-4 h-4"} />
                                                <img
                                                    src={book.cover || '/placeholder-image.png'}
                                                    alt={book.bookTitle || '표지 없음'}
                                                    className="h-64 object-contain"
                                                    onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Link to={`/books/detail/${book.libraryBookId}`} className="block text-xl font-semibold mb-4 hover:underline hover:cursor-pointer">
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
                                                <Button
                                                    disabled={isLoading || !book || !(book.borrowed || book.unmanned) || book.alreadyBorrowedByMember || book.alreadyReservedByMember || book.alreadyUnmannedByMember || book.reserveCount >= 2 }
                                                    className={`px-6 py-2 rounded text-white transition
                                                    ${!book
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                                                    } disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400`}
                                                    children={"대출예약"}
                                                    onClick={() => handleReserveClick(book)}
                                                />

                                                <Button
                                                    className={`px-6 py-2 rounded text-white transition
                                                    ${!book
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-fuchsia-800 hover:bg-fuchsia-900 cursor-pointer'
                                                    } disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400`}
                                                    onClick={() => handleUnMannedReserveClick(book)}
                                                    children="무인예약"
                                                    disabled={isLoading || !book || book.borrowed || book.unmanned || book.reserveCount > 0 }

                                                />
                                                <Button
                                                    className={`px-6 py-2 rounded text-white transition
                                                    ${!book
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'cursor-pointer'
                                                    } disabled:hover:bg-gray-400 disabled:cursor-not-allowed`}
                                                    children="관심도서"
                                                    disabled={isLoading || !book }
                                                    onClick={() => handleInterestedClick(book)}
                                                />
                                            </div>
                                        </div>
                                    );

                                })}
                                </>

                            ) : (
                                searchURLParams.has("keyword") ||
                                searchURLParams.has("title") ||
                                searchURLParams.has("isbn") ||
                                searchURLParams.has("author") ||
                                searchURLParams.has("yearStart") ||
                                searchURLParams.has("yearEnd") ||
                                searchURLParams.has("publisher") ? (
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

export default memo(FilterSearchBookComponent);