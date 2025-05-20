import SearchSelectComponent from "../common/SearchSelectComponent";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CheckNonLabel from "../common/CheckNonLabel";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getInterestedBook } from "../../api/memberApi";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import Loading from "../../routers/Loading";
import Button from "../common/Button";



const InterestedComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const queryParams = useMemo(() => ({
        query: searchURLParams.get("query") || "",
        option: searchURLParams.get("option") || "전체",
        page: searchURLParams.get("page") || "1",
    }), [searchURLParams]);
    const mid = useRecoilValue(memberIdSelector);
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const queryClient = useQueryClient();

    const { data = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ["interestedBooks", searchURLParams.toString() , mid],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("query", queryParams.query);
            params.set("option", queryParams.option);
            params.set("page", queryParams.page);

            return getInterestedBook(params, mid);
        }

    })

    const deleteMutation = useMutation({
        mutationFn: (ibIds) => {
            return deleteInterestedBook(ibIds, mid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["interestedBooks", searchURLParams.toString(), mid]);
        },
        onError: (error) => {
            console.error("Error deleting book:", error);
        },
    });


    const interestedBooks = useMemo(() => data.content, [data.content]);
    console.log("interestedBooks", interestedBooks);

    useEffect(() => {
        if (interestedBooks.length > 0 && selectedBooks.size === interestedBooks.length) {
            setIsAllSelected(true);
        } else {
            setIsAllSelected(false);
        }
    }, [selectedBooks, interestedBooks]);



    const handleSearch = useCallback((searchQuery, selectedOption) => {
            const newParams = new URLSearchParams();
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("page", "1");
            setSearchURLParams(newParams);
        }, []);

    const handleSelectBooks = useCallback((e, itemId) => {
        const isSelected = e.target.checked;
        setSelectedBooks(prev => {
            const newSelectedBooks = new Set(prev);

            if (isSelected) {
                newSelectedBooks.add(itemId);
            } else {
                newSelectedBooks.delete(itemId);
            }

            return newSelectedBooks;
        });
    }, []);



    const handleSelectAll = useCallback(() => {
        if (isAllSelected) {
            setSelectedBooks(new Set());
        } else {
            const allBookIds = new Set(interestedBooks.map(book => book.ibId));
            setSelectedBooks(allBookIds);
        }
        setIsAllSelected(!isAllSelected);
    }, [isAllSelected, interestedBooks]);


    const searchOption = useMemo(() => ["전체", "제목", "저자", "출판사"], []);

    return (
        <div className="mx-auto">
            {isLoading && (
                <Loading />
            )}
            <SearchSelectComponent
                            options={searchOption}
                            handleSearch={handleSearch}
                            input={queryParams.query}
                            defaultCategory={queryParams.option}
                            selectClassName="mr-2 md:mr-5"
                            dropdownClassName="w-24 md:w-32"
                            className="w-full md:w-[50%] mx-auto mt-10 mb-25"
                            inputClassName="w-full"
                            buttonClassName="right-2"
                        />
                    <div className="flex items-center mx-20 gap-5">
                        <Button children="전체선택" className="text-white text-sm w-22 h-9" onClick={handleSelectAll} />
                        <Button children="선택삭제" className="bg-red-500 hover:bg-red-600 text-white text-sm w-22 h-9" />
                    </div>
                    <div className="mt-5 border border-green-700 rounded-lg overflow-hidden max-w-[90%] mx-auto min-h-[100px]">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                       관심도서 목록을 불러오는 중입니다...
                    </div>
                ) : interestedBooks.length === 0 ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                        등록된 관심도서가 없습니다.
                    </div>
                ) : (
                    interestedBooks.map((book, index) => (
                        <div key={book.ibId}>
                            <div className="flex items-center p-4">
                                <div className="mx-2">
                                    <CheckNonLabel onChange={(e) => handleSelectBooks(e, book.ibId)} checked={selectedBooks.has(book.ibId)} />
                                </div>

                                <div className="flex-grow mx-5">
                                    <div className="mb-5">
                                        <span>{(book.borrowed || book.unmanned) ? `대출중(예약 ${book.reserveCount}명)`  : book.reserved ? `예약대기중(예약 ${book.reserveCount}명)` : "대출가능" }</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        <span>{book.bookTitle}</span>
                                    </div>
                                    <div className="flex items-center text-xs mt-5 text-gray-500 space-x-4">
                                        <span className="border">저자 </span>
                                        <span>{book.author}</span>
                                        <span className="border">출판사</span>
                                        <span>{book.publisher}</span>
                                        <span className="border">위치</span>
                                        <span>{book.location}</span>
                                        <span className="border">청구기호</span>
                                        <span>{book.callSign}</span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Button children="삭제" className="bg-red-500 hover:bg-red-600 text-white text-sm w-15 h-9"/>
                                </div>
                            </div>
                            <div className={`border-b ${index === interestedBooks.length - 1 ? "border-b-0" : "border-b border-gray-200 mx-auto w-[90%]"}`}></div>
                        </div>
                    ))
                )}
            </div>

        </div>
    )
}

export default InterestedComponent;