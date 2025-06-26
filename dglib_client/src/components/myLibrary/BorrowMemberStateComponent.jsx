import { useCallback, memo } from "react";
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
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
            {isLoading && (
                <Loading />
            )}
            
            <div className="w-full max-w-4xl mx-auto mb-4">
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                    <Button children="전체선택" className="text-white text-sm w-full sm:w-auto px-4 py-2" onClick={handleSelectAllClick} />
                    <Button children="반납연기" className="text-white text-sm w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600" onClick={handleExtendBorrow}/>
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto border border-green-700 rounded-2xl overflow-hidden min-h-[100px] mb-6">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                       대출중인 도서목록을 불러오는 중입니다...
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                       대출중인 도서가 없습니다.
                    </div>
                ) : (
                    <>
                        {data.map((book, index) => {
                            const rentStart = new Date(book.rentStartDate);
                            const dueDate = new Date(book.dueDate);
                            const duration = Math.floor((dueDate - rentStart) / (1000 * 60 * 60 * 24));
                            const canExtend = book.rentStartDate <= book.dueDate && book.reserveCount === 0 && duration <= 7;
                            const isOverdue = new Date() > dueDate;
                            return (
                                <div key={book.rentId}>
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-shrink-0">
                                                <CheckNonLabel onChange={(e) => handleSelectBooks(e, book.rentId)} checked={selectedBooks.has(book.rentId)} />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className={
                                                    (isOverdue)
                                                    ? "text-red-500 font-medium text-sm sm:text-base"
                                                    : "text-green-600 font-medium text-sm sm:text-base"
                                                }>
                                                    <span>{isOverdue ? `연체중(예약${book.reserveCount}명)`  : `대출중(예약${book.reserveCount}명)` }</span>
                                                </div>
                                                
                                                <div className="text-lg sm:text-xl font-semibold">
                                                    <Link to={`/mylibrary/detail/${book.isbn}?from=borrowstatus`} className="inline">
                                                        <span className="hover:text-green-700 hover:underline hover:cursor-pointer break-words">{book.bookTitle}</span>
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                        <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">저자</span>
                                                        <span className="truncate break-words" title={book.author}>{book.author && book.author.length > 20 ? `${book.author.substring(0, 20)}...` : book.author}</span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                        <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">대출일</span>
                                                        <span className="truncate" title={book.rentStartDate}>{book.rentStartDate}</span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                        <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">반납예정일</span>
                                                        <span className="truncate" title={book.dueDate}>{book.dueDate}</span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                        <span className={`px-2 py-1 rounded font-medium text-xs ${!canExtend || isOverdue ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                                            {!canExtend || isOverdue  ? "대출연장불가" : "대출연장가능"}
                                                        </span>
                                                    </div>
                                                </div>
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

export default memo(BorrowMemberStateComponent);