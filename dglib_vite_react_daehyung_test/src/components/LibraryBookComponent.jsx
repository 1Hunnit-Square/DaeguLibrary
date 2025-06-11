import { useParams } from 'react-router-dom';
import { getLibraryBookDetail, reserveBook } from '../api/bookApi';
import { useEffect, useState } from 'react';

const LibraryBookComponent = () => {
    const { isbn } = useParams();
    const [libraryBookDetail, setLibraryBookDetail] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [memberId, setMemberId] = useState('');

    useEffect(() => {
        const getBookDetails = async () => {
            setIsLoading(true);
            const response = await getLibraryBookDetail(isbn);
            setLibraryBookDetail(response);
            setMemberId("kdh3218");
            setIsLoading(false);
            console.log("도서 상세 정보:", response);
        };

        getBookDetails();
    }, [isbn]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const handleReserveClick = async () => {

        const reservationData = {
            id: memberId,
            libraryBookId: libraryBookDetail.libraryBookId,
        };
        setIsLoading(true);
        try {
            const response = await reserveBook(reservationData);
            const updatedBookDetails = await getLibraryBookDetail(isbn);
            setLibraryBookDetail(updatedBookDetails)
            alert(`'${libraryBookDetail.bookTitle}' 도서를 예약했습니다.`);
        } catch (error) {
            console.log("예약 변경 오류:", error);
            alert(error.response.data.message);
        }

        setIsLoading(false);
    };



    const canReserve = libraryBookDetail.rented === true && libraryBookDetail.reserveCount < 2 && libraryBookDetail.alreadyReservedByMember === false;

    return (
        <div className="max-w-4xl mx-auto p-8">
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            <div className="flex gap-8">

                <div className="w-1/3">
                    <img
                        src={libraryBookDetail.cover}
                        alt={libraryBookDetail.bookTitle}
                        className="w-full rounded-lg shadow-lg object-contain"
                    />
                </div>


                <div className="w-2/3">
                    <h1 className="text-3xl font-bold mb-4">{libraryBookDetail.bookTitle}</h1>

                    <div className="space-y-4">
                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">저자</span>
                            <span>{libraryBookDetail.author}</span>
                        </div>

                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">출판사</span>
                            <span>{libraryBookDetail.publisher}</span>
                        </div>

                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">출판일</span>
                            <span>{libraryBookDetail.pubDate}</span>
                        </div>

                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">ISBN</span>
                            <span>{libraryBookDetail.isbn}</span>
                        </div>

                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">자료위치</span>
                            <span>{libraryBookDetail.location || "위치 정보 없음"}</span>
                        </div>

                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">청구기호</span>
                            <span>{libraryBookDetail.callSign || "청구기호 정보 없음"}</span>
                        </div>
                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">도서상태</span>
                            <span>{libraryBookDetail.rented ? "대출중" : "대출가능"}</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">도서 소개</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {libraryBookDetail.description || "설명이 없습니다."}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleReserveClick}
                    disabled={!canReserve || isLoading}
                    className={`px-6 py-2 rounded text-white transition ${
                        canReserve
                            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                            : 'bg-gray-400'}`}>
                    대출예약
                </button>
            </div>
        </div>
    );
}

export default LibraryBookComponent;