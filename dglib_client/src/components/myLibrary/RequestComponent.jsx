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
        <div className="mx-auto">
            <div className="flex-1 flex mx-20 justify-end mt-10">
                <SelectComponent onChange={(value) => handleSelectChange('year', value)}  value={searchURLParams.get("year") || "2025"}  options={year}/>
            </div>
            {isLoading && (
                <Loading />
            )}

                    <div className="mt-5 border border-green-700 rounded-lg overflow-hidden max-w-[90%] mx-auto min-h-[100px]">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                       희망도서 신청 목록을 불러오는 중입니다...
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                        신청한 희망도서가 없습니다.
                    </div>
                ) : (
                    data.map((book, index) => (
                        <div key={book.wishNo}>
                            <div className="flex items-center p-4">

                                <div className={`flex-grow mx-5`}>
                                    <div className={
                                           book.state === "ACCEPTED" ? "text-green-500 text-sm mb-1" :
                                           book.state === "REJECTED" ? "text-red-500 text-sm mb-1" :
                                            "text-gray-500 text-sm mb-1"} >
                                        <span>{book.state === "ACCEPTED" ? `비치완료` : book.state === "REJECTED" ? `반려`  : "처리중" }</span>
                                    </div>
                                    <div className="text-1xl mb-1 mt-2">
                                        <div className="text-xl font-semibold mb-4">
                                            <div  className="inline">
                                                <span className="">{book.bookTitle}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 text-xs mt-5 text-gray-500">
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">저자</span>
                                            <span className="truncate max-w-40" title={book.author}>{book.author}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">출판사</span>
                                            <span className="truncate max-w-40"  title={book.publisher}>{book.publisher}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">신청일</span>
                                            <span className="truncate" title={book.appliedAt}>{book.appliedAt}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">처리일</span>
                                            <span className="truncate" title={book.processedAt || '-'}>
                                                {book.processedAt || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center min-w-[60px]">
                                    { book.state === "APPLIED" && (
                                        <Button children="취소" className="bg-red-500 hover:bg-red-600 text-white text-sm w-15 h-9" onClick={() => handleDeleteButton(book.wishNo)} />
                                    )}
                                </div>
                            </div>
                            <div className={`border-b ${index === data.length - 1 ? "border-b-0" : "border-b border-gray-200 mx-auto w-[90%]"}`}></div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-10">

            </div>
        </div>
    )
}

export default RequestComponent;