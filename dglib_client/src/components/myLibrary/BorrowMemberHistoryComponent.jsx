import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getMemberBorrowHistory } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import { useSearchParams } from "react-router-dom";
import { usePagination } from "../../hooks/usePage";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import SelectComponent from "../common/SelectComponent";
import { useMemo } from "react";



const BorrowMemberHistoryComponent = () => {
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

    const { renderPagination } = usePagination(data, searchURLParams, setSearchURLParams, isLoading);
    return (
        <div className="mx-auto">
            {isLoading && (
                <Loading />
            )}
                     <div className="flex-1 flex max-w-[90%] justify-end gap-3">
                        <SelectComponent onChange={(value) => handleSelectChange('year', value)}  value={searchURLParams.get("year") || "2025"}  options={year}/>
                        <SelectComponent onChange={(value) => handleSelectChange('month', value)}  value={searchURLParams.get("month") || "allmonth"}    options={month} />
                    </div>
                    <div className="mt-5 border border-green-700 rounded-lg overflow-hidden max-w-[90%] mx-auto min-h-[100px]">

                {isLoading ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                       대출이력을 불러오는 중입니다...
                    </div>
                ) : data.content.length === 0 ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                       대출하신 도서가 없습니다.
                    </div>
                ) : (
                    <>

                    {data.content.map((book, index) => (

                        <div key={book.rentId}>
                            <div className="flex items-center p-4">
                                <div className={`flex-grow mx-5`}>
                                    <div className={
                                            (book.rentStartDate > book.dueDate)
                                            ? "text-red-500"
                                                : "text-green-600"
                                        }>
                                        <span>{book.rentalState === "RETURNED" ? "반납완료" : (book.rentStartDate > book.dueDate) ? `연체중`  : `대출중` }</span>
                                    </div>
                                    <div className="text-1xl mb-1 mt-2">

                                        <div className="text-xl font-semibold mb-4">
                                            <Link to={`/mylibrary/detail/${book.isbn}?from=borrowstatus`} className="inline">
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
                                            <span className="border px-2 py-1 w-20 text-center">대출일</span>
                                            <span className="truncate" title={book.rentStartDate}>{book.rentStartDate}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">반납예정일</span>
                                            <span className="truncate" title={book.dueDate}>{book.dueDate}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">반납일</span>
                                            <span className="truncate" title={book.returnDate}>{book.returnDate}</span>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className={`border-b ${index === data.length - 1 ? "border-b-0" : "border-b border-gray-200 mx-auto w-[90%]"}`}></div>
                        </div>
                    ))}
                 </>
                )}
            </div>
            {renderPagination()}
        </div>
    )
}

export default BorrowMemberHistoryComponent;