
import { useSearchParams, Link } from "react-router-dom";
import { useMemo, useState, useCallback } from "react";
import { useQuery } from '@tanstack/react-query';
import Button from "../common/Button";
import { getNewLibraryBookList } from "../../api/bookApi";
import { reserveBook, unMannedReserve, addInterestedBook } from '../../api/memberApi';
import Loading from "../../routers/Loading";
import CheckBoxNonLabel from "../common/CheckNonLabel";
import { useBookActions } from "../../hooks/useBookActions";
import { useBookMutation } from "../../hooks/useBookMutation";
import { useItemSelection } from "../../hooks/useItemSelection";
import { usePagination } from "../../hooks/usePage";

const NewBookComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const [dateRange, setDateRange] = useState({startDate: searchURLParams.get("startDate"), endDate: searchURLParams.get("endDate")});
    const { data = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ["libraryBookId", searchURLParams.toString()],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("startDate", dateRange.startDate);
            params.set("endDate", dateRange.endDate);
            return getNewLibraryBookList(params);
        }
    })

    const newBooks = useMemo(() => data.content, [data.content]);
    const { selectedItems: selectedBooks, isAllSelected, handleSelectItem: handleSelectBooks, handleSelectAll, resetSelection } = useItemSelection(newBooks, 'libraryBookId');
    const resetSelectedBooks = () => resetSelection(new Set());

    const reserveMutation = useBookMutation(async (book) => await reserveBook(book), { successMessage: "도서를 예약했습니다.", onReset: resetSelectedBooks} );

    const unMannedReserveMutation = useBookMutation(async (book) => await unMannedReserve(book), { successMessage: "도서를 무인예약했습니다.", onReset: resetSelectedBooks} );

    const interestedMutation = useBookMutation( async (book) => await addInterestedBook(book), { successMessage: "도서를 관심도서로 등록했습니다.", onReset: resetSelectedBooks});

    const { handleReserveClick, handleUnMannedReserveClick, handleInterestedClick, clickSelectFavorite } = useBookActions(
            { reserve: reserveMutation, unmanned: unMannedReserveMutation, interested: interestedMutation}, selectedBooks);

    const handleDateChange = useCallback((e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSearch = useCallback(() => {
        const newParams = new URLSearchParams();
        newParams.set("startDate", dateRange.startDate);
        newParams.set("endDate", dateRange.endDate);
        newParams.set("page", "1");
        setSearchURLParams(newParams);
    }, [dateRange, setSearchURLParams]);

    const { renderPagination } = usePagination(data, searchURLParams, setSearchURLParams, isLoading, resetSelectedBooks);


    return (
        <div>
            <div className="flex items-center mt-15 max-w-2xl mx-auto">
                <span className="w-50">입고일</span>
                <input type="date" value={dateRange.startDate} name="startDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                <span className="mx-4">-</span>
                <input type="date" value={dateRange.endDate} name="endDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
            </div>
            <div className="flex items-center justify-center mt-10">
                <Button children="검색" onClick={handleSearch} />
            </div>
                <div className="container mx-auto px-4 py-8 w-375">
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

                            {Array.isArray(newBooks) && newBooks.length > 0 ? (
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
                                    children="관심도서 담기"
                                />
                                </div>
                                {newBooks.map((book, index) => {
                                    if (!book) return null;
                                    return (
                                        <div key={index}
                                            className="flex flex-row bg-white rounded-lg -mt-1 shadow-lg overflow-hidden border border-white hover:border hover:border-[#0CBA57] gap-6 p-6"
                                        >

                                            <div className="w-full md:w-48 flex justify-center">
                                                <CheckBoxNonLabel checked={selectedBooks.has(book.libraryBookId)} onChange={(e) => handleSelectBooks(e, book)} inputClassName={"hover:cursor-pointer relative bottom-30 right-1 w-4 h-4"} />
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
                                searchURLParams.has("startDate") ? (
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
    )
}

export default NewBookComponent;