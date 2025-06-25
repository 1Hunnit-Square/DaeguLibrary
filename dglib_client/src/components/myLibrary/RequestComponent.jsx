import { useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getMemberWishBookList, cancelWishBook } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { useBookMutation } from '../../hooks/useBookMutation';
import SelectComponent from "../common/SelectComponent";
import { useSelectHandler } from "../../hooks/useSelectHandler";


const RequestComponent = () => {
   const [searchURLParams, setSearchURLParams] = useSearchParams();
   const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams, false);
    const { data = [], isLoading, isError } = useQuery({
        queryKey: ["MemberWishBookList", searchURLParams.toString()],
        queryFn: () => {
            const year = searchURLParams.get("year") || "";
            return getMemberWishBookList(year);
        }

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


    const cancelMutation = useBookMutation(async (wishNo) => await cancelWishBook(wishNo), { successMessage: "희망도서신청을 취소했습니다", queryKeyToInvalidate: 'MemberWishBookList'} );


    const handleDeleteButton = useCallback((wishNo) => {
        if (window.confirm("정말 취소하시겠습니까?")) {
            cancelMutation.mutate([wishNo]);
        }
    }, [cancelMutation]);

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 mt-10">
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
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto border border-green-700 rounded-2xl overflow-hidden min-h-[100px] mb-6">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                       희망도서 신청 목록을 불러오는 중입니다...
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                        신청한 희망도서가 없습니다.
                    </div>
                ) : (
                    data.map((book, index) => (
                        <div key={book.wishNo}>
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 space-y-4">
                                        <div className={
                                               book.state === "ACCEPTED" ? "text-green-500 font-medium text-sm sm:text-base" :
                                               book.state === "REJECTED" ? "text-red-500 font-medium text-sm sm:text-base" :
                                                "text-gray-500 font-medium text-sm sm:text-base"} >
                                            <span>{book.state === "ACCEPTED" ? `비치완료` : book.state === "REJECTED" ? `반려`  : "처리중" }</span>
                                        </div>
                                        
                                        <div className="text-lg sm:text-xl font-semibold">
                                            <span className="break-words">{book.bookTitle}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">저자</span>
                                                <span className="truncate" title={book.author}>
                                                    {book.author && book.author.length > 20 ? `${book.author.substring(0, 20)}...` : book.author}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">출판사</span>
                                                <span className="truncate" title={book.publisher}>
                                                    {book.publisher && book.publisher.length > 20 ? `${book.publisher.substring(0, 20)}...` : book.publisher}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">신청일</span>
                                                <span className="truncate" title={book.appliedAt}>{book.appliedAt}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">처리일</span>
                                                <span className="truncate" title={book.processedAt || '-'}>
                                                    {book.processedAt || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col justify-center items-center gap-3 sm:ml-4">
                                        {book.state === "APPLIED" && (
                                            <Button 
                                                children="취소" 
                                                className="bg-red-500 hover:bg-red-600 text-white text-sm w-full sm:w-auto px-4 py-2" 
                                                onClick={() => handleDeleteButton(book.wishNo)} 
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {index !== data.length - 1 && (
                                <div className="border-b border-gray-200 mx-4 sm:mx-6"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default RequestComponent;