import { useParams } from 'react-router-dom';
import { getLibraryBookDetail, reserveBook } from '../../api/bookApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";


const LibraryBookDetailComponent = () => {
    const { librarybookid } = useParams();
    const queryClient = useQueryClient();
    const mid = useRecoilValue(memberIdSelector);


    const { data: libraryBookDetail = {}, isLoading, isError, error } = useQuery({
        queryKey: ['libraryBookDetail', librarybookid, mid ],
        queryFn: () => getLibraryBookDetail(librarybookid, mid),
    });


    const reserveMutation = useMutation({
        mutationFn: (reservationData) => reserveBook(reservationData),
        onSuccess: () => {
            queryClient.invalidateQueries(['libraryBookDetail', librarybookid]);
            alert(`'${libraryBookDetail.bookTitle}' 도서를 예약했습니다.`);
        },
        onError: (error) => {
            console.log("예약 변경 오류:", error);
            alert(error.response?.data?.message || "도서 예약에 실패했습니다.");
        }
    });

    const handleReserveClick = () => {
        reserveMutation.mutate({
            id: mid,
            libraryBookId: libraryBookDetail.libraryBookId,
        });
    };

    if (isLoading || reserveMutation.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">
                    오류가 발생했습니다: {error.message}
                </p>
            </div>
        );
    }
    console.log("도서 상세정보", libraryBookDetail);


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

export default LibraryBookDetailComponent;