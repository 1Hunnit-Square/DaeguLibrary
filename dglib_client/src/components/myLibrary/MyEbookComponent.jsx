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
        <div className="mx-auto">
            {isLoading && (
                <Loading />
            )}
            <SearchSelectComponent
                            options={searchOption}
                            handleSearch={handleSearch}
                            input={searchURLParams.get("query") || ""}
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
                       나의 EBOOK 목록을 불러오는 중입니다...
                    </div>
                ) : myEbooks.length === 0 ? (
                    <div className="text-center text-gray-500 text-xl my-10">
                        열람한 EBOOK이 없습니다.
                    </div>
                ) : (
                    myEbooks.map((book, index) => (
                        <div key={book.ebookId}>
                            <div className="flex items-center p-4">
                                <div className="mx-2">
                                    <CheckNonLabel onChange={(e) => handleSelectBooks(e, book.ebookId)} checked={selectedBooks.has(book.ebookId)} />
                                </div>
                                <div className={`flex-grow mx-5`}>
                                    <div className="text-1xl mb-1 mt-2">

                                        <div className="text-xl font-semibold mb-4">
                                                <span className="">{book.ebookTitle}</span>
                                        </div>

                                    </div>
                                    <div className="grid grid-cols-4 text-xs mt-5 text-gray-500">
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">저자</span>
                                            <span className="truncate max-w-40" title={book.ebookAuthor}>{book.ebookAuthor}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">출판사</span>
                                            <span className="truncate max-w-40" title={book.ebookPublisher}>{book.ebookPublisher}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">출판일</span>
                                            <span className="truncate" title={book.ebookPubDate}>{book.ebookPubDate}</span>
                                        </div>
                                        <div className="flex gap-2 items-center ">
                                            <span className="border px-2 py-1 w-20 text-center">최종 열람</span>
                                            <span className="truncate" title={book.lastReadTime}>{book.lastReadTime}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button children="읽기" className="" onClick={() => {
                                                readClick(book.ebookId);
                                            }} />
                                    <Button children="삭제" className="bg-red-500 hover:bg-red-600 text-white text-sm w-15 h-9" onClick={() => handleDeleteButton(book.ebookId)} />
                                </div>
                            </div>
                            <div className={`border-b ${index === myEbooks.length - 1 ? "border-b-0" : "border-b border-gray-200 mx-auto w-[90%]"}`}></div>
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
export default MyEboookComponent;