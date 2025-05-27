import { useCallback } from "react";
import { Link } from "react-router-dom";
import CheckNonLabel from "../common/CheckNonLabel";
import { useQuery} from '@tanstack/react-query';
import { getMemberBorrowList, extendBorrow  } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { useItemSelection } from "../../hooks/useItemSelection";
import { useBookMutation } from '../../hooks/useBookMutation';

const BorrowMemberStateComponent = () => {

    const { data = [], isLoading, isError } = useQuery({
        queryKey: ["borrowMemberBookNowList"],
        queryFn: getMemberBorrowList,
    })
    console.log(data);
    const { selectedItems: selectedBooks, isAllSelected, handleSelectItem: handleSelectBooks, handleSelectAll, resetSelection: resetSelectedBooks } = useItemSelection(data, 'rentId');
    const extendBorrowBooks = useBookMutation(async (rentIds) => await extendBorrow(rentIds), { successMessage: "대출을 7일 연장했습니다.", onReset: resetSelectedBooks, queryKeyToInvalidate: 'interestedBooks'} );
    const handleSelectAllClick = useCallback(() => {
    const event = {
        target: {
        checked: !isAllSelected
        }
    };
    handleSelectAll(event);
    }, [handleSelectAll, isAllSelected]);

    const handleExtendBorrow = useCallback(() => {
        if (selectedBooks.size === 0) {
            alert("연장할 도서를 선택해주세요.");
            return;
        }

        const nonExtendableBooks = data.filter(book => {
                if (selectedBooks.has(book.rentId)) {
                    const rentStart = new Date(book.rentStartDate);
                    const dueDate = new Date(book.dueDate);
                    const duration = Math.floor((dueDate - rentStart) / (1000 * 60 * 60 * 24));
                    const canExtend = book.rentStartDate <= book.dueDate &&
                                    book.reserveCount === 0 &&
                                    duration <= 7;
                    return !canExtend;
                }
            return false;
        });

        if (nonExtendableBooks.length > 0) {
            const titles = nonExtendableBooks.map(book => book.bookTitle).join(", ");
            alert(`다음 도서는 연장이 불가능합니다: ${titles}`);
            return;
        }
        if (window.confirm("선택한 도서를 7일 연장하시겠습니까?")) {
            extendBorrowBooks.mutate(Array.from(selectedBooks));
        }
    }
    , [selectedBooks, extendBorrowBooks, data]);
    console.log(Array.from(selectedBooks));

    return (
        <div className="mx-auto">
            {isLoading && (
                <Loading />
            )}
                       <div className="flex items-center mx-20 gap-5">
                        <Button children="전체선택" className="text-white text-sm w-22 h-9" onClick={handleSelectAllClick} />
                        <Button children="반납연기" className="text-white text-sm w-22 h-9 bg-blue-500 hover:bg-blue-600" onClick={handleExtendBorrow}/>
                    </div>
                    <div className="mt-5 border border-green-700 rounded-lg overflow-hidden max-w-[90%] mx-auto min-h-[100px]">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                       대출중인 도서목록을 불러오는 중입니다...
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                       대출중인 도서가 없습니다.
                    </div>
                ) : (
                    data.map((book, index) => {
                        const rentStart = new Date(book.rentStartDate);
                        const dueDate = new Date(book.dueDate);
                        const duration = Math.floor((dueDate - rentStart) / (1000 * 60 * 60 * 24));
                        const canExtend = book.rentStartDate <= book.dueDate && book.reserveCount === 0 && duration <= 7;
                        return (
                        <div key={book.rentId}>
                            <div className="flex items-center p-4">
                                <div className="mx-2">
                                    <CheckNonLabel onChange={(e) => handleSelectBooks(e, book.rentId)} checked={selectedBooks.has(book.rentId)} />
                                </div>
                                <div className={`flex-grow mx-5`}>
                                    <div className={
                                            (book.rentStartDate > book.dueDate)
                                            ? "text-red-500"
                                                : "text-green-600"
                                        }>
                                        <span>{(book.rentStartDate > book.dueDate) ? `연체중(예약${book.reserveCount}명)`  : `대출중(예약${book.reserveCount}명)` }</span>
                                    </div>
                                    <div className="text-1xl mb-1 mt-2">

                                        <Link to={`/mylibrary/detail/${book.isbn}?from=borrowstatus`} className="block text-xl font-semibold mb-4">
                                            <span className="hover:text-green-700 hover:underline hover:cursor-pointer">{book.bookTitle}</span>
                                        </Link>


                                    </div>
                                    <div className="grid grid-cols-4 text-xs mt-5 text-gray-500">
                                        <div className="flex gap-2 items-center">
                                            <span className="border px-2 py-1 w-20 text-center">저자</span>
                                            <span className="truncate " title={book.author}>{book.author}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">대출일</span>
                                            <span className="truncate" title={book.rentStartDate}>{book.rentStartDate}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">반납예정일</span>
                                            <span className="truncate" title={book.dueDate}>{book.dueDate}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className={`border px-2 py-1 w-25 text-center ${!canExtend ? "text-red-500" : "text-green-600"}`}>
                                                {!canExtend ? "대출연장불가" : "대출연장가능"}
                                                </span>

                                        </div>
                                    </div>
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

export default BorrowMemberStateComponent;