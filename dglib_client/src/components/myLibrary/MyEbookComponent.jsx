import SearchSelectComponent from "../common/SearchSelectComponent";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CheckNonLabel from "../common/CheckNonLabel";
import { useQuery } from '@tanstack/react-query';
import { deleteEbook, getMyEbook } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { usePagination } from "../../hooks/usePage";
import { useItemSelection } from "../../hooks/useItemSelection";
import { useBookMutation } from '../../hooks/useBookMutation';

const MyEboookComponent = () => {
  const [searchURLParams, setSearchURLParams] = useSearchParams();

    const { data = { content: [], totalElements: 0 }, isLoading, isError } = useQuery({
        queryKey: ["myEbooks", searchURLParams.toString()],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("query", searchURLParams.get("query") || "");
            params.set("option", searchURLParams.get("option") || "");
            params.set("page", searchURLParams.get("page") || "");

            return getMyEbook(params);
        }

    })
    console.log("myEbooks data", data);

    const myEbooks = useMemo(() => data.content, [data.content]);

    const handleSearch = useCallback((searchQuery, selectedOption) => {
            const newParams = new URLSearchParams();
            newParams.set("query", searchQuery);
            newParams.set("option", selectedOption);
            newParams.set("page", "1");
            setSearchURLParams(newParams);
        }, []);

    const { selectedItems: selectedBooks, isAllSelected, handleSelectItem: handleSelectBooks, handleSelectAll, resetSelection: resetSelectedBooks } = useItemSelection(myEbooks, 'ebookId');

    const deleteMutation = useBookMutation(async (ebookId) => await deleteEbook(ebookId), { successMessage: "EBOOK 열람 기록을 삭제했습니다", onReset: resetSelectedBooks, queryKeyToInvalidate: 'myEbooks'} );

    const handleSelectAllClick = useCallback(() => {
    const event = {
        target: {
        checked: !isAllSelected
        }
    };
    handleSelectAll(event);
    }, [handleSelectAll, isAllSelected]);

    const handleDeleteButton = useCallback((ebookId) => {
        if (window.confirm("모든 EBOOK 열람 정보가 삭제됩니다. 정말 삭제하시겠습니까?")) {
            deleteMutation.mutate([ebookId]);
        }
    }, [deleteMutation]);

    const handleDeleteAll = useCallback(() => {
        if (selectedBooks.size === 0) {
            alert("삭제할 EBOOK을 선택해주세요.");
            return;
        }
        if (window.confirm("모든 EBOOK 열람 정보가 삭제됩니다. 정말 삭제하시겠습니까?")) {
            deleteMutation.mutate(Array.from(selectedBooks));
        }
    }, [deleteMutation, selectedBooks]);

    const readClick = (id) => {

        const windowName = "EBOOK Viewer"
        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        window.open(`/viewer?id=${id}`, windowName, `width=${screenWidth},height=${screenHeight},left=0,top=0`);
    };

    const { renderPagination } = usePagination(data, searchURLParams, setSearchURLParams, isLoading, resetSelectedBooks);

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
                       나의 EBOOK 목록을 불러오는 중입니다...
                    </div>
                ) : myEbooks.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg sm:text-xl py-10">
                        열람한 EBOOK이 없습니다.
                    </div>
                ) : (
                    myEbooks.map((book, index) => (
                        <div key={book.ebookId}>
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-shrink-0">
                                        <CheckNonLabel onChange={(e) => handleSelectBooks(e, book.ebookId)} checked={selectedBooks.has(book.ebookId)} />
                                    </div>
                                    
                                    <div className="flex-1 space-y-4">
                                        <div className="text-lg sm:text-xl font-semibold">
                                            <span className="break-words">{book.ebookTitle}</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">저자</span>
                                                <span className="truncate" title={book.ebookAuthor}>
                                                    {book.ebookAuthor && book.ebookAuthor.length > 20 ? `${book.ebookAuthor.substring(0, 20)}...` : book.ebookAuthor}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">출판사</span>
                                                <span className="truncate" title={book.ebookPublisher}>
                                                    {book.ebookPublisher && book.ebookPublisher.length > 20 ? `${book.ebookPublisher.substring(0, 20)}...` : book.ebookPublisher}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">출판일</span>
                                                <span className="truncate" title={book.ebookPubDate}>{book.ebookPubDate}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-center sm:text-left">
                                                <span className="bg-gray-100 px-2 py-1 rounded font-medium text-xs">최종 열람</span>
                                                <span className="truncate" title={book.lastReadTime}>{book.lastReadTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:ml-4">
                                        <Button 
                                            children="읽기" 
                                            className="text-white text-sm w-full sm:w-auto px-4 py-2" 
                                            onClick={() => readClick(book.ebookId)} 
                                        />
                                        <Button 
                                            children="삭제" 
                                            className="bg-red-500 hover:bg-red-600 text-white text-sm w-full sm:w-auto px-4 py-2" 
                                            onClick={() => handleDeleteButton(book.ebookId)} 
                                        />
                                    </div>
                                </div>
                            </div>
                            {index !== myEbooks.length - 1 && (
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
export default MyEboookComponent;