import SearchSelectComponent from "../common/SearchSelectComponent";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CheckNonLabel from "../common/CheckNonLabel";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getInterestedBook, deleteInterestedBook } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { usePagination } from "../../hooks/usePagination";



const InterestedComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const queryParams = useMemo(() => ({
        query: searchURLParams.get("query") || "",
        option: searchURLParams.get("option") || "전체",
        page: searchURLParams.get("page") || "1",
    }), [searchURLParams]);
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const queryClient = useQueryClient();

    const { data = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ["interestedBooks", searchURLParams.toString()],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("query", queryParams.query);
            params.set("option", queryParams.option);
            params.set("page", queryParams.page);

            return getInterestedBook(params);
        }

    })

    const deleteMutation = useMutation({
        mutationFn: (ibIds) => {
            return deleteInterestedBook(ibIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["interestedBooks", searchURLParams.toString()]);
            alert("삭제되었습니다.");
        },
        onError: (error) => {
            console.error("Error deleting book:", error);
            alert("삭제에 실패했습니다." + error.message);
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

    const handleDeleteButton = useCallback((ibid) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            deleteMutation.mutate([ibid]);
        }
    }, [deleteMutation]);

    const handleDeleteAll = useCallback(() => {
        if (selectedBooks.size === 0) {
            alert("삭제할 도서를 선택해주세요.");
            return;
        }
        if (window.confirm("정말 삭제하시겠습니까?")) {
            deleteMutation.mutate(Array.from(selectedBooks));
        }
    }, [deleteMutation, selectedBooks]);

    const pageClick = useCallback((page) => {
                if (isLoading) return;
                const newParams = new URLSearchParams(searchURLParams);
                newParams.set("page", page.toString());
                setSearchURLParams(newParams);
            }, [ searchURLParams, isLoading, setSearchURLParams]);


        const { renderPagination } = usePagination(data, pageClick, isLoading);




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
                        <Button children="선택삭제" className="bg-red-500 hover:bg-red-600 text-white text-sm w-22 h-9" onClick={handleDeleteAll}/>
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
                                    <div className={
                                            (book.borrowed || book.unmanned)
                                            ? "text-red-500"
                                            : book.reserved
                                                ? "text-yellow-500"
                                                : "text-green-600"
                                        }>
                                        <span>{(book.borrowed || book.unmanned) ? `대출중(예약 ${book.reserveCount}명)`  : book.reserved ? `예약대기중(예약 ${book.reserveCount}명)` : "대출가능" }</span>
                                    </div>
                                    <div className="text-1xl mb-1 mt-2 hover:text-green-700 hover:underline">
                                        <span>{book.bookTitle}</span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center text-xs mt-5 text-gray-500">
                                        <div className="flex gap-2">
                                            <span className="border px-2 py-1 w-20 text-center mb-1">저자</span>
                                            <span className="truncate my-auto" title={book.author}>{book.author}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="border px-2 py-1 w-20 text-center mb-1">출판사</span>
                                            <span className="truncate my-auto" title={book.publisher}>{book.publisher}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="border px-2 py-1 w-20 text-center mb-1">위치</span>
                                            <span className="truncate my-auto" title={book.location}>{book.location}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="border px-2 py-1 w-20 text-center mb-1">청구기호</span>
                                            <span className="truncate my-auto" title={book.callSign}>{book.callSign}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Button children="삭제" className="bg-red-500 hover:bg-red-600 text-white text-sm w-15 h-9" onClick={() => handleDeleteButton(book.ibId)} />
                                </div>
                            </div>
                            <div className={`border-b ${index === interestedBooks.length - 1 ? "border-b-0" : "border-b border-gray-200 mx-auto w-[90%]"}`}></div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-10">
                {renderPagination()}
            </div>
        </div>
    )
}

export default InterestedComponent;