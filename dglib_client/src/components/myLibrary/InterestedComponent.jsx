import SearchSelectComponent from "../common/SearchSelectComponent";
import { useCallback, useMemo, useRef } from "react";
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
    const topRef = useRef(null);

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
    console.log("interestedBooks data", data);

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




    const { renderPagination } = usePagination(data, searchURLParams, setSearchURLParams, isLoading, resetSelectedBooks, topRef);




    const searchOption = useMemo(() => ["전체", "제목", "저자", "출판사"], []);

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 mt-10">
            {isLoading && (
                <Loading />
            )}
            
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 border border-gray-100 bg-white rounded-xl shadow-md">
                <SearchSelectComponent
                    options={searchOption}
                    handleSearch={handleSearch}
                    input={searchURLParams.get("query") || ""}
                    defaultCategory={searchURLParams.get("option") || "전체"}
                    selectClassName="mr-2 md:mr-5"
                    dropdownClassName="w-24 md:w-32"
                    className="w-full"
                    inputClassName="w-full"
                    buttonClassName="right-2"
                />
            </div>

            <div className="w-full max-w-4xl mx-auto mb-4 mt-10">
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                    <Button children="전체선택" className="text-white text-sm w-full sm:w-auto px-4 py-2" onClick={handleSelectAllClick} />
                    <Button children="선택삭제" className="bg-red-500 hover:bg-red-600 text-white text-sm w-full sm:w-auto px-4 py-2" onClick={handleDeleteAll}/>
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto border border-green-700 rounded-2xl overflow-hidden min-h-[100px] mb-6">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                       관심도서 목록을 불러오는 중입니다...
                    </div>
                ) : interestedBooks.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                        등록된 관심도서가 없습니다.
                    </div>
                ) : (
                    interestedBooks.map((book, index) => (
                        <div key={book.ibId}>
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-shrink-0">
                                        <CheckNonLabel onChange={(e) => handleSelectBooks(e, book.ibId)} checked={selectedBooks.has(book.ibId)} />
                                    </div>
                                    
                                    <div className={`flex-1 space-y-4 ${book.deleted ? "opacity-50" : ""}`}>
                                        <div className={
                                            (book.borrowed || book.unmanned)
                                            ? "text-red-500 font-medium text-sm sm:text-base"
                                            : book.reserved
                                                ? "text-yellow-500 font-medium text-sm sm:text-base"
                                                : "text-green-600 font-medium text-sm sm:text-base"
                                        }>
                                            <span>{book.borrowed ? `대출중(예약 ${book.reserveCount}명)` : book.unmanned ? `무인예약중`  : book.reserved ? `예약대기중(예약 ${book.reserveCount}명)` : "대출가능" }</span>
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
                                                    <span className="hover:text-green-700 hover:underline hover:cursor-pointer break-words">{book.bookTitle}</span>
                                                </Link>
                                            )}
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
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">위치</span>
                                                <span className="truncate" title={book.location}>{book.location}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">청구기호</span>
                                                <span className="truncate" title={book.callSign}>{book.callSign}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col justify-center items-center gap-3 sm:ml-4">
                                        <Button 
                                            children="삭제" 
                                            className="bg-red-500 hover:bg-red-600 text-white text-sm w-full sm:w-auto px-4 py-2" 
                                            onClick={() => handleDeleteButton(book.ibId)} 
                                        />
                                    </div>
                                </div>
                            </div>
                            {index !== interestedBooks.length - 1 && (
                                <div className="border-b border-gray-200 mx-4 sm:mx-6"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <div className="w-full max-w-4xl mx-auto">
                {renderPagination()}
            </div>
        </div>
    )
}

export default InterestedComponent;