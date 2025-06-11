import { useState, useEffect } from "react";
import { borrowBook } from "../../api/adminApi";
import Button from "../common/Button";
import { useMutation } from '@tanstack/react-query';
import Loading from "../../routers/Loading";

const initialRentFormData = {
  mno: "",
  libraryBookId: "",
  bookTitle: "",
  dueDate: "",
};
const BorrowBookComponent = () => {
    const [RentFormData, setRentFormData] = useState(initialRentFormData);

    const borrowMutation = useMutation({
        mutationFn: async (RentData) => {
            return await borrowBook(RentData);
        },
        onSuccess: () => {
            alert("도서 대출이 완료되었습니다.");
            setRentFormData(initialRentFormData);
        },
        onError: (error) => {
            console.log("도서 대출 오류:", error);
            alert("도서 대출에 실패했습니다. " + error.response?.data?.message);
        }
    });


    useEffect(() => {
        const handleMessage = (event) => {
        if (event.data.type === "MEMBER_SELECTED") {
            setRentFormData({
                ...RentFormData,
                mno: event.data.mno,
            });
        }
        if (event.data.type === "BOOK_SELECTED") {
            setRentFormData({
                ...RentFormData,
                libraryBookId: event.data.libraryBookId,
                bookTitle: event.data.bookTitle,
                dueDate: setDueDate(),
            })
        }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [RentFormData]);

    const setDueDate = () => {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 7);
        return futureDate.toISOString().split('T')[0];
    }

    const searchMemberClick = () => {
        window.open(`/membersearch`, "_blank", "width=1300,height=800");
    };
    const searchBookClick = () => {
        window.open(`/librarybooksearch`, "_blank", "width=1300,height=800");
    };
    const sumbit = async () => {
        if (!RentFormData.mno) {
        alert("회원번호를 입력해주세요.");
        return;
        } else if (!RentFormData.libraryBookId) {
        alert("도서번호를 입력해주세요.");
        return;
        }
        const RentData = {
            mno: RentFormData.mno,
            libraryBookId: RentFormData.libraryBookId,

        };
        borrowMutation.mutate(RentData);

    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
             {borrowMutation.isPending && (
                    <Loading text={ "대출 등록중입니다.."} />
                  )}
            <div className="bg-white rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-4">
                        <label className="w-32 font-medium text-gray-700">회원번호검색</label>
                        <Button
                            onClick={searchMemberClick}
                            children="회원번호검색"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="w-32 font-medium text-gray-700">회원번호</label>
                        <input
                            type="text"
                            className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                            value={RentFormData.mno}
                            readOnly
                        />
                        <button
                            className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors focus:outline-none"
                            title="삭제"
                            onClick={() => setRentFormData({ ...RentFormData, mno: ""})}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="w-32 font-medium text-gray-700">도서번호검색</label>
                        <Button
                            onClick={searchBookClick}
                            children="도서번호검색"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="w-32 font-medium text-gray-700">도서등록번호</label>
                        <input
                            type="text"
                            className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                            value={RentFormData.libraryBookId}
                            readOnly
                        />
                        <button
                            className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors focus:outline-none"
                            title="삭제"
                            onClick={() => setRentFormData({ ...RentFormData, libraryBookId: "", bookTitle: "", dueDate: ""  })}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="w-32 font-medium text-gray-700">도서명</label>
                        <input
                            type="text"
                            className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                            value={RentFormData.bookTitle}
                            readOnly
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="w-32 font-medium text-gray-700">반납예정일</label>
                        <input
                            type="text"
                            className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                            value={RentFormData.dueDate}
                            readOnly
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={sumbit}
                    disabled={borrowMutation.isPending}
                    children="도서 대출"
                />
            </div>
        </div>
    );
};

export default BorrowBookComponent;