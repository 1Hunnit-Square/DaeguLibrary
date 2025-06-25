import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery} from '@tanstack/react-query';
import { getMemberReserveList, cancelReserveBook  } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { useBookMutation } from '../../hooks/useBookMutation';

const BookReservationComponent = () => {
    const { data = [], isLoading, isError } = useQuery({
        queryKey: ["borrowMemberReserveList"],
        queryFn: getMemberReserveList,
    })
    console.log(data);

    const cancelReservationBooks = useBookMutation(async (reserveId) => await cancelReserveBook(reserveId), { successMessage: "예약을 취소했습니다.", queryKeyToInvalidate: 'borrowMemberReserveList'} );

    const cancelHandle = useCallback((reserveId) => {
        if (window.confirm("정말 예약을 취소하시겠습니까?")) {
            cancelReservationBooks.mutate(reserveId);
        }
    }, [cancelReservationBooks]);

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 mt-10 lg:px-8">
            {isLoading && (
                <Loading />
            )}
            
            <div className="w-full max-w-4xl mx-auto border border-green-700 rounded-2xl overflow-hidden min-h-[100px] mb-6">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                       예약중인 도서목록을 불러오는 중입니다...
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                       예약중인 도서가 없습니다.
                    </div>
                ) : (
                    <>
                        {data.map((book, index) => {
                            return (
                                <div key={book.reserveId}>
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 space-y-4">
                                                <div className={
                                                    (book.rentStartDate > book.dueDate)
                                                    ? "text-red-500 font-medium text-sm sm:text-base"
                                                    : "text-green-600 font-medium text-sm sm:text-base"
                                                }>
                                                    <span>{(book.unmanned) ? `무인예약중`  : `예약중` }</span>
                                                </div>
                                                
                                                <div className="text-lg sm:text-xl font-semibold">
                                                    <Link to={`/mylibrary/detail/${book.isbn}?from=bookreservation`} className="inline">
                                                        <span className="hover:text-green-700 hover:underline hover:cursor-pointer break-words">{book.bookTitle}</span>
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                        <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">저자</span>
                                                        <span className="truncate" title={book.author}>
                                                            {book.author && book.author.length > 20 ? `${book.author.substring(0, 20)}...` : book.author}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                        <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">신청일</span>
                                                        <span className="truncate" title={book.reserveDate}>{new Date(book.reserveDate).toLocaleDateString('en-CA')}</span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                        <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">예상반납일</span>
                                                        <span className="truncate" title={book.dueDate}>{book.dueDate ? new Date(book.dueDate).toLocaleDateString('en-CA') : "무인예약중"}</span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                        <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">우선순위</span>
                                                        <span className="truncate" title={book.reserveRank}>{book.reserveRank > 0 ? book.reserveRank : "-"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col justify-center items-center gap-3 sm:ml-4">
                                                <Button 
                                                    children="취소" 
                                                    className="bg-red-500 hover:bg-red-600 text-white text-sm w-full sm:w-auto px-4 py-2" 
                                                    onClick={() => cancelHandle(book.reserveId)}  
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {index !== data.length - 1 && (
                                        <div className="border-b border-gray-200 mx-4 sm:mx-6"></div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    )
}

export default BookReservationComponent;