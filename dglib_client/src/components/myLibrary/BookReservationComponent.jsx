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
        <div className="mx-auto">
            {isLoading && (
                <Loading />
            )}
                    <div className="mt-5 border border-green-700 rounded-lg overflow-hidden max-w-[90%] mx-auto min-h-[100px]">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                       예약중인 도서목록을 불러오는 중입니다...
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                       예약중인 도서가 없습니다.
                    </div>
                ) : (
                    data.map((book, index) => {
                        return (
                        <div key={book.reserveId}>
                            <div className="flex items-center p-4">

                                <div className={`flex-grow mx-5`}>
                                    <div className={
                                            (book.rentStartDate > book.dueDate)
                                            ? "text-red-500"
                                                : "text-green-600"
                                        }>
                                        <span>{(book.unmanned) ? `무인예약중`  : `예약중` }</span>
                                    </div>
                                    <div className="text-1xl mb-1 mt-2">

                                        <div className="text-xl font-semibold mb-4">
                                            <Link to={`/mylibrary/detail/${book.isbn}?from=bookreservation`} className="inline">
                                                <span className="hover:text-green-700 hover:underline hover:cursor-pointer">{book.bookTitle}</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 text-xs mt-5 text-gray-500">
                                        <div className="flex gap-2 items-center">
                                            <span className="border px-2 py-1 w-20 text-center">저자</span>
                                            <span className="truncate " title={book.author}>{book.author}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">신청일</span>
                                            <span className="truncate" title={book.reserveDate}>{new Date(book.reserveDate).toLocaleDateString('en-CA')}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">예상반납일</span>
                                            <span className="truncate" title={book.dueDate}>{book.dueDate ? new Date(book.reserveDate).toLocaleDateString('en-CA') : "-"}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">우선순위</span>
                                            <span className="truncate" title={book.reserveCount}>{book.reserveCount > 0 ? book.reserveCount : "-"}</span>
                                        </div>

                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Button children="취소" className="bg-red-500 hover:bg-red-600 text-white text-sm w-15 h-9" onClick={() => cancelHandle(book.reserveId)}  />
                                </div>
                            </div>
                            <div className={`border-b ${index === data.length - 1 ? "border-b-0" : "border-b border-gray-200 mx-auto w-[90%]"}`}></div>
                        </div>
                    )})
                )}
            </div>
        </div>
    )
}

export default BookReservationComponent;