import SearchSelectComponent from "../common/SearchSelectComponent";
import { useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import CheckNonLabel from "../common/CheckNonLabel";
import { useQuery } from '@tanstack/react-query';
import { getInterestedBook, deleteInterestedBook } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { usePagination } from "../../hooks/usePage";
import { useItemSelection } from "../../hooks/useItemSelection";
import { useBookMutation } from '../../hooks/useBookMutation';

const InterestedComponent = () => {

    const [searchURLParams, setSearchURLParams] = useSearchParams();

    const { data = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ["interestedBooks", searchURLParams.toString()],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("query", searchURLParams.get("query") || "");
            params.set("option", searchURLParams.get("option") || "");
            params.set("page", searchURLParams.get("page") || "");

            return getInterestedBook(params);
        }

    })

    const interestedBooks = useMemo(() => data.content, [data.content]);

    const handleSearch = useCallback((searchQuery, selectedOption) => {
            const newParams = new URLSearchParams();
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("page", "1");
            setSearchURLParams(newParams);
        }, []);

    const { selectedItems: selectedBooks, isAllSelected, handleSelectItem: handleSelectBooks, handleSelectAll, resetSelection: resetSelectedBooks } = useItemSelection(interestedBooks, 'ibId');

    const deleteMutation = useBookMutation(async (ibIds) => await deleteInterestedBook(ibIds), { successMessage: "관심도서를 삭제했습니다", onReset: resetSelectedBooks, queryKeyToInvalidate: 'interestedBooks'} );

    const handleSelectAllClick = useCallback(() => {
    const event = {
        target: {
        checked: !isAllSelected
        }
    };
    handleSelectAll(event);
    }, [handleSelectAll, isAllSelected]);

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




    const { renderPagination } = usePagination(data, searchURLParams, setSearchURLParams, isLoading, resetSelectedBooks);




    const searchOption = useMemo(() => ["전체", "제목", "저자", "출판사"], []);

    return (
        <div className="mx-auto">
            {isLoading && (
                <Loading />
            )}
            <SearchSelectComponent
                            options={searchOption}
                            handleSearch={handleSearch}
                            input={searchURLParams.get("query")}
                            defaultCategory={searchURLParams.get("option")}
                            selectClassName="mr-2 md:mr-5"
                            dropdownClassName="w-24 md:w-32"
                            className="w-full md:w-[50%] mx-auto mt-10 mb-25"
                            inputClassName="w-full"
                            buttonClassName="right-2"
                        />
                    <div className="flex items-center mx-20 gap-5">
                        <Button children="전체선택" className="text-white text-sm w-22 h-9" onClick={handleSelectAllClick} />
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

                                <div className={`flex-grow mx-5 ${book.deleted ? "opacity-50" : ""}`}>
                                    <div className={
                                            (book.borrowed || book.unmanned)
                                            ? "text-red-500"
                                            : book.reserved
                                                ? "text-yellow-500"
                                                : "text-green-600"
                                        }>
                                        <span>{(book.borrowed || book.unmanned) ? `대출중(예약 ${book.reserveCount}명)`  : book.reserved ? `예약대기중(예약 ${book.reserveCount}명)` : "대출가능" }</span>
                                    </div>
                                    <div className="text-1xl mb-1 mt-2">
                                        {book.deleted ?  <>
                                        <div className="block text-xl font-semibold mb-4">
                                            <span className="line-through hover:cursor-default">{book.bookTitle}</span>
                                            {book.deleted && <span className="text-red-500 no-underline hover:text-red-500 hover:no-underline "> (분실 및 훼손된 도서입니다)</span>}
                                        </div>
                                        </> :  <>
                                        <Link to={`/mylibrary/detail/${book.isbn}?from=interested`} className="block text-xl font-semibold mb-4">
                                            <span className="hover:text-green-700 hover:underline hover:cursor-pointer">{book.bookTitle}</span>
                                        </Link>
                                        </>}

                                    </div>
                                    <div className="grid grid-cols-4 text-xs mt-5 text-gray-500">
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">저자</span>
                                            <span className="truncate" title={book.author}>{book.author}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">출판사</span>
                                            <span className="truncate" title={book.publisher}>{book.publisher}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">위치</span>
                                            <span className="truncate" title={book.location}>{book.location}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">청구기호</span>
                                            <span className="truncate" title={book.callSign}>{book.callSign}</span>
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