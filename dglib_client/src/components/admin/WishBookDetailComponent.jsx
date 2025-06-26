import Button from '../common/Button';

const WishBookDetailComponent = ({ wishBook, setIsModalOpen, handleReject }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-9999 bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-3xl max-h-[90vh] overflow-auto scrollbar-hidden">
                <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold">희망도서 상세조회</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsModalOpen(false)} className="text-white text-xl hover:text-gray-200 hover:cursor-pointer">
                        &times;
                    </button>
                </div>
                </div>
                <div className="min-h-[90vh] p-6">
                    <div className="bg-white rounded-md shadow-sm  mb-6">
                        <div className="p-5 space-y-1">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                            <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 flex-shrink-0">회원ID</label>
                            <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 w-[25%] min-h-9">{wishBook.mid}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                             <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">희망도서명</label>
                             <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 truncate w-[50%] min-h-9">{wishBook.bookTitle}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                             <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">저자</label>
                             <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 truncate w-[50%] min-h-9">{wishBook.author}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                             <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">출판사</label>
                             <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 truncate w-[50%] min-h-9">{wishBook.publisher}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                             <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">ISBN</label>
                             <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 truncate w-[50%] min-h-9">{wishBook.isbn}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                             <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">비고</label>
                             <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 truncate w-[50%] min-h-30">{wishBook.note}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                             <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">신청일</label>
                             <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 truncate w-[50%] min-h-9">{wishBook.appliedAt}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                             <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">처리일</label>
                             <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 truncate w-[50%] min-h-9">{wishBook.processedAt}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                             <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">상태</label>
                             <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 truncate w-[50%] min-h-9">
                                 {wishBook.state === "CANCELED" ?  "취소" : wishBook.state === "REJECTED" ? "반려" : wishBook.state === "ACCEPTED" ? "완료" : "처리중" }</div>
                        </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-8">
                        <Button children="거절" onClick={() => handleReject(wishBook.wishNo)} className="mt-4 bg-red-500  hover:bg-red-600" />
                        <Button children="닫기" onClick={() => setIsModalOpen(false)} className="mt-4 bg-gray-500 hover:bg-gray-600" />
                    </div>

                </div>

        </div>
    </div>
  );
}

export default WishBookDetailComponent;