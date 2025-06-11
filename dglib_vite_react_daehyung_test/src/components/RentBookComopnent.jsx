import { useState, useEffect } from "react";
import { rentBook } from "../api/bookApi";

const initialRentFormData = {
  mno: "",
  libraryBookId: "",
  bookTitle: "",
  dueDate: "",
};

const initialLibraryBooks = [{ id: 0, location: "", callSign: "" }];


const RentBookComponent = () => {
    const [RentFormData, setRentFormData] = useState(initialRentFormData);
    const [isLoading, setIsLoading] = useState(false);




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
        window.open(`/membersearchmodal`, "_blank", "width=1300,height=800");
    };
    const searchBookClick = () => {
        window.open(`/librarybooksearchmodal`, "_blank", "width=1300,height=800");
    };
    const sumbit = async () => {
        if (!RentFormData.mno) {
        alert("회원번호를 입력해주세요.");
        return;
        } else if (!RentFormData.libraryBookId) {
        alert("도서번호를 입력해주세요.");
        return;
        }
        setIsLoading(true);
        const RentData = {
            mno: RentFormData.mno,
            libraryBookId: RentFormData.libraryBookId,

        };
        console.log("서버로 전송될 데이터:", RentData);
        try {
            const response = await rentBook(RentData);
            alert("도서 등록이 완료되었습니다.");
            setRentFormData(initialRentFormData);
        } catch (error) {
            console.log("예약 변경 오류:", error);
            alert(error.response.data.message);
        }
        setIsLoading(false);

    };



    return (
        <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">도서 대출</h2>

        <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center">
                <label className="w-32 font-semibold">회원번호검색</label>
                <button
                    className="px-6 py-2 rounded text-white transition
                                                bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    onClick={searchMemberClick}
                >
                    회원번호검색
                </button>
                </div>

                <div className="flex items-center">
                <label className="w-32 font-semibold">회원번호</label>
                <input
                    type="text"
                    className="flex-1 p-3 border rounded bg-white"
                    value={RentFormData.mno}
                    readOnly
                />
                <button
                    className="ml-2 p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors focus:outline-none"
                    title="삭제"
                    onClick={() => setRentFormData({ ...RentFormData, mno: ""})}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>
                <div className="flex items-center">
                <label className="w-32 font-semibold">도서번호검색</label>
                <button
                    className="px-6 py-2 rounded text-white transition
                                                bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    onClick={searchBookClick}
                >
                    도서번호검색
                </button>
                </div>
                <div className="flex items-center">
                <label className="w-32 font-semibold">도서등록번호</label>
                <input
                    type="text"
                    className="flex-1 p-3 border rounded bg-white"
                    value={RentFormData.libraryBookId}
                    readOnly
                />
                <button
                    className="ml-2 p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors focus:outline-none"
                    title="삭제"
                    onClick={() => setRentFormData({ ...RentFormData, libraryBookId: "", bookTitle: "", dueDate: ""  })}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>
                <div className="flex items-center">
                <label className="w-32 font-semibold">도서명</label>
                <input
                    type="text"
                    className="flex-1 p-3 border rounded bg-white"
                    value={RentFormData.bookTitle}
                    readOnly
                />
                </div>
                <div className="flex items-center">
                <label className="w-32 font-semibold">반납예정일</label>
                <input
                    type="text"
                    className="flex-1 p-3 border rounded bg-white"
                    value={RentFormData.dueDate}
                    readOnly
                />
                </div>
            </div>
            </div>

            <div className="flex justify-center">
            <button
                onClick={sumbit}
                className="px-6 py-2 rounded text-white transition bg-blue-500 hover:bg-blue-600 cursor-pointer"
                disabled={isLoading}
            >
                도서 대출
            </button>
            </div>
        </div>
        </div>
    );
    };

export default RentBookComponent;
