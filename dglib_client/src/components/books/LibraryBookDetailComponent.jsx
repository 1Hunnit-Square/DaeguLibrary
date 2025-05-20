import { useParams, useNavigate } from 'react-router-dom';
import { getLibraryBookDetail} from '../../api/bookApi';
import { reserveBook, unMannedReserve, addInterestedBook } from '../../api/memberApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import Button from "../common/Button";
import { useCallback, useState } from "react";
import { useMoveTo } from "../../hooks/useMoveTo";
import Loading from '../../routers/Loading';
import CheckBoxNonLabel from '../common/CheckNonLabel';



const LibraryBookDetailComponent = () => {
    const { librarybookid } = useParams();
    const queryClient = useQueryClient();
    const mid = useRecoilValue(memberIdSelector);
    const navigate = useNavigate();
    const { moveToLogin } = useMoveTo();
    const [selectedBook, setSelectedBook] = useState(null);


    const { data: libraryBookDetail = {}, isLoading, isError, error } = useQuery({
        queryKey: ['libraryBookDetail', librarybookid, mid ],
        queryFn: () => getLibraryBookDetail(librarybookid, mid),
    });


    const reserveMutation = useMutation({
        mutationFn: async (reservationData) => {
            return await reserveBook(reservationData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['libraryBookDetail', librarybookid]);
            alert(`'${libraryBookDetail.bookTitle}' 도서를 예약했습니다.`);
            setSelectedBook(null);
        },
        onError: (error) => {
            console.log("오류:", error);
            alert("도서 예약에 실패했습니다. " + error.response?.data?.message);
        }
    });

    const unMannedReserveMutation = useMutation({
        mutationFn: async (reservationData) => {
            return await unMannedReserve(reservationData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['libraryBookDetail', librarybookid]);
            alert(`'${libraryBookDetail.bookTitle}' 도서를 무인예약했습니다.`);
            setSelectedBook(null);
        },
        onError: (error) => {
            console.log("오류:", error);
            alert("도서 무인 예약에 실패했습니다. " + error.response?.data?.message);
        }
    });

    const interestedMutation = useMutation({
        mutationFn: async (reservationData) => {
            return await addInterestedBook(reservationData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['libraryBookDetail', librarybookid]);
            alert(`'${libraryBookDetail.bookTitle}' 도서를 관심도서로 등록했습니다.`);
            setSelectedBook(null);
        },
        onError: (error) => {
            console.log("오류:", error);
            alert("도서 관심도서 등록에 실패했습니다. " + error.response?.data?.message);
        }
    });

    const handleReserveClick = useCallback(() => {
        if (!mid) {
            moveToLogin("로그인이 필요합니다.");
            return;
        }
        if (!selectedBook) {
            alert("예약할 도서를 선택해주세요.");
            return;
        }
        if (selectedBook.overdue && !confirm("연체중인 도서입니다. 예약하시겠습니까?")) {
            return;
        }
        reserveMutation.mutate({
            mid: mid,
            libraryBookId: selectedBook.libraryBookId,
        });
    }, [mid, navigate, reserveMutation, selectedBook] );

    const handleUnMannedReserveClick = useCallback(() => {
        if (!mid) {
            moveToLogin("로그인이 필요합니다.");
            return;
        }
        if (!selectedBook) {
            alert("예약할 도서를 선택해주세요.");
            return;
        }
        unMannedReserveMutation.mutate({
            mid: mid,
            libraryBookId: selectedBook.libraryBookId,
        });
    }, [mid, navigate, unMannedReserveMutation, selectedBook] );


    const handleInterestedClick = useCallback(() => {
        if (!mid) {
            moveToLogin("로그인이 필요합니다.");
            return;
        }
        if (!selectedBook) {
            alert("관심도서로 등록할 도서를 선택해주세요.");
            return;
        }
        interestedMutation.mutate({
            mid: mid,
            libraryBookId: selectedBook.libraryBookId,
        });
    }, [mid, navigate, interestedMutation, selectedBook] );


    const handleCheckChange = useCallback((e, libraryBook) => {
        if (selectedBook === libraryBook) {
            setSelectedBook(null);
        } else {
            setSelectedBook(libraryBook);
        }
    }, [selectedBook]);



    if (isLoading || reserveMutation.isPending) {
        return (
            <Loading />
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




    return (
        <div className="max-w-[90%] mx-auto p-8">
            {isLoading && (
                <Loading />
            )}
            <div className="flex gap-8 items-center justify-center border border-b-0 border-[#00893B] w-full min-h-15">
                <h1 className="text-3xl font-bold">{libraryBookDetail.bookTitle}</h1>
            </div>
            <div className="flex gap-8  border border-[#00893B] w-full h-[500px]">
                <div className="w-1/5 mx-10 flex flex-col item-center justify-center">
                    <img
                        src={libraryBookDetail.cover}
                        alt={libraryBookDetail.bookTitle}
                        className="w-full rounded-lg shadow-lg object-contain"
                    />
                    <div>위치 인쇄해야함 어디다 넣지</div>
                </div>
                <div className="w-2/3">

                    <div className="space-y-4 mt-20">
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
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">도서 소개</h2>
                <div className="border min-h-30 border-[#00893B]">
                    <p className="text-gray-700 my-8 mx-10 leading-relaxed whitespace-pre-line">
                        {libraryBookDetail.description || "설명이 없습니다."}
                    </p>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">소장 정보</h2>
                <div className="">
                    <table className="min-w-full border border-[#00893B]">
                        <thead className="bg-[#00893B] text-white">
                            <tr>
                                <th className="py-3 px-6 text-left text-sm font-semibold uppercase"></th>
                                <th className="py-3 px-6 text-left text-sm font-semibold uppercase">도서번호</th>
                                <th className="py-3 px-6 text-left text-sm font-semibold uppercase">도서위치</th>
                                <th className="py-3 px-6 text-left text-sm font-semibold uppercase">청구번호</th>
                                <th className="py-3 px-6 text-left text-sm font-semibold uppercase">대출상태</th>
                                <th className="py-3 px-6 text-left text-sm font-semibold uppercase">반납예정일</th>
                                <th className="py-3 px-6 text-left text-sm font-semibold uppercase">위치 인쇄</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {!isLoading && libraryBookDetail.libraryBooks === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-3 px-6 text-center">소장 정보가 없습니다.</td>
                                </tr>
                            ) : (
                                libraryBookDetail.libraryBooks.map((libraryBook, index) => (
                                    <tr key={index} className={`${
                                        index === libraryBookDetail.libraryBooks.length - 1
                                        ? "border-b border-[#00893B]"
                                        : "border-b border-gray-200"
                                        }`}>
                                        <td className="py-3 px-6 w-10"> <CheckBoxNonLabel checked={selectedBook === libraryBook} onChange={(e) => handleCheckChange(e, libraryBook)} /></td>
                                        <td className="py-3 px-6">{libraryBook.libraryBookId}</td>
                                        <td className="py-3 px-6">{libraryBook.location}</td>
                                        <td className="py-3 px-6">{libraryBook.callSign}</td>
                                        <td className="py-3 px-6">{(libraryBook.borrowed || libraryBook.unmanned) ? `대출중(${libraryBook.reserveCount}명)` : libraryBook.reserved ? `예약대기중(${libraryBook.reserveCount}명)` : "대출가능"}</td>
                                        <td className="py-3 px-6">{libraryBook.dueDate || "-"}</td>
                                        <td className="py-3 px-6">
                                            <Button children="아이콘" onClick={() => window.print()} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-8 flex justify-center gap-8">
                <Button children="대출예약" onClick={handleReserveClick}
                disabled={isLoading || !selectedBook || !(selectedBook.borrowed || selectedBook.unmanned) || selectedBook.alreadyReservedByMember || selectedBook.alreadyUnmannedByMember || selectedBook.reserveCount >= 2 }
                className={`px-6 py-2 rounded text-white transition
                    ${!selectedBook
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                    } disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400`}
                />
                <Button children="무인예약" onClick={handleUnMannedReserveClick}
                disabled={isLoading || !selectedBook || selectedBook.borrowed || selectedBook.unmanned }
                className={`px-6 py-2 rounded text-white transition
                    ${!selectedBook
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-fuchsia-800 hover:bg-fuchsia-900 cursor-pointer'
                    } disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400`}
                />
                <Button children="관심도서" onClick={handleInterestedClick}
                disabled={isLoading || !selectedBook }
                className={`px-6 py-2 rounded text-white transition
                    ${!selectedBook
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'cursor-pointer'
                    } disabled:hover:bg-gray-400 disabled:cursor-not-allowed`}
                />
            </div>
        </div>
    );
}

export default LibraryBookDetailComponent;