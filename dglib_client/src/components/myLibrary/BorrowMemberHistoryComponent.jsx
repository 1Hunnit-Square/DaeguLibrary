import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getMemberBorrowHistory } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import { useSearchParams } from "react-router-dom";
import { usePagination } from "../../hooks/usePage";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import SelectComponent from "../common/SelectComponent";
import { useMemo, useEffect, forwardRef, memo } from "react";



const BorrowMemberHistoryComponent = forwardRef(( _, ref) => {
   const [searchURLParams, setSearchURLParams] = useSearchParams();
   const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
   const { data = {content: [], totalElements: 0}, isLoading, isError } = useQuery({
        queryKey: ["borrowMemberBookHistory", searchURLParams.toString()],
        queryFn: () => getMemberBorrowHistory(searchURLParams),
    })
    console.log(data);

    const year = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = {};
        for (let i = 0; i <= 10; i++) {
            const yearValue = currentYear - i;
            years[`${yearValue}년`] = yearValue.toString();
        }
        return years;
    }, []);
    const month = useMemo(() => {
        const months = {"월전체": "allmonth"};
        for (let i = 1; i <= 12; i++) {
            months[`${i}월`] = i.toString();
        }
        return months;
    }, []);

    const { renderPagination } = usePagination(data, searchURLParams, setSearchURLParams, isLoading, undefined, ref);

   

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
            {isLoading && (
                <Loading />
            )}
            
            <div className="w-full max-w-4xl mx-auto mb-4">
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                    <SelectComponent 
                        onChange={(value) => handleSelectChange('year', value)}  
                        value={searchURLParams.get("year") || "2025"}  
                        options={year}
                        selectClassName="w-full sm:w-32 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    />
                    <SelectComponent 
                        onChange={(value) => handleSelectChange('month', value)}  
                        value={searchURLParams.get("month") || "allmonth"}    
                        options={month}
                        selectClassName="w-full sm:w-32 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    />
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto border border-green-700 rounded-2xl overflow-hidden min-h-[100px] mb-6">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                       대출이력을 불러오는 중입니다...
                    </div>
                ) : data.content.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                       대출하신 도서가 없습니다.
                    </div>
                ) : (
                    <>
                        {data.content.map((book, index) => {
                            const rentStart = new Date(book.rentStartDate);
                            const dueDate = new Date(book.dueDate);
                            const duration = Math.floor((dueDate - rentStart) / (1000 * 60 * 60 * 24));
                            const canExtend = book.rentStartDate <= book.dueDate && book.reserveCount === 0 && duration <= 7;
                            const isOverdue = new Date() > dueDate;
                            return (
                            <div key={book.rentId}>
                                <div className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        <div className={
                                            (isOverdue && book.rentalState !== "RETURNED")
                                            ? "text-red-500 font-medium text-sm sm:text-base"
                                            : "text-green-600 font-medium text-sm sm:text-base"
                                        }>
                                            <span>{book.rentalState === "RETURNED" ? "반납완료" : isOverdue ? `연체중`  : `대출중` }</span>
                                        </div>
                                        
                                        <div className="text-lg sm:text-xl font-semibold">
                                            {book.deleted ? (
                                                <>
                                                    <span className="line-through">{book.bookTitle}</span>
                                                    <span className="text-red-500 text-sm sm:text-base block sm:inline sm:ml-2 mt-1 sm:mt-0">
                                                        (분실 및 훼손된 도서입니다)
                                                    </span>
                                                </>
                                            ) : (
                                                <Link to={`/mylibrary/detail/${book.isbn}?from=interested`} className="inline">
                                                    <span className="hover:text-green-700 hover:underline hover:cursor-pointer break-words">
                                                        {book.bookTitle}
                                                    </span>
                                                </Link>
                                            )}
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
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">반납일</span>
                                                <span className="truncate" title={book.returnDate}>{book.returnDate || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {index !== data.content.length - 1 && (
                                    <div className="border-b border-gray-200 mx-4 sm:mx-6"></div>
                                )}
                            </div>
                        )})}
                    </>
                )}
            </div>
            
            <div className="w-full max-w-4xl mx-auto">
                {renderPagination()}
            </div>
        </div>
    )
})

export default memo(BorrowMemberHistoryComponent);