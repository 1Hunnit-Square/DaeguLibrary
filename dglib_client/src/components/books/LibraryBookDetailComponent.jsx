import { useParams } from 'react-router-dom';
import { getLibraryBookDetail} from '../../api/bookApi';
import { reserveBook, unMannedReserve, addInterestedBook } from '../../api/memberApi';
import { useQuery } from '@tanstack/react-query';
import Button from "../common/Button";
import { useCallback, useState } from "react";
import Loading from '../../routers/Loading';
import CheckBoxNonLabel from '../common/CheckNonLabel';
import { useBookActions } from '../../hooks/useBookActions';
import { useBookMutation } from '../../hooks/useBookMutation';



const LibraryBookDetailComponent = () => {
    const { librarybookid } = useParams();
    const [selectedBook, setSelectedBook] = useState(null);
    const { data: libraryBookDetail = {}, isLoading, isError, error } = useQuery({
        queryKey: ['libraryBookDetail', librarybookid],
        queryFn: () => getLibraryBookDetail(librarybookid),
    });

    console.log(libraryBookDetail)


    const reserveMutation = useBookMutation(async (book) => await reserveBook(book), { successMessage: "도서를 예약했습니다."} );

    const unMannedReserveMutation = useBookMutation(async (book) => await unMannedReserve(book), { successMessage: "도서를 무인예약했습니다."} );

    const interestedMutation = useBookMutation( async (book) => await addInterestedBook(book), { successMessage: "도서를 관심도서로 등록했습니다."});

    const { handleReserveClick, handleUnMannedReserveClick, handleInterestedClick } = useBookActions(
            { reserve: reserveMutation, unmanned: unMannedReserveMutation, interested: interestedMutation}, selectedBook);


    const handleCheckChange = useCallback((e, libraryBook) => {
        if (selectedBook === libraryBook) {
            setSelectedBook(null);
        } else {
            setSelectedBook(libraryBook);
        }
    }, [selectedBook]);

    return (
        <div className="max-w-[90%] mx-auto p-8">
            {isLoading ? (
                <Loading text="도서 정보를 불러오는 중입니다..." />
            ) : reserveMutation.isPending || unMannedReserveMutation.isPending || interestedMutation.isPending ? (
                <Loading text="처리중입니다..." />
            ) : isError ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-red-500">
                        오류가 발생했습니다: {error.message}
                    </p>
                </div>
            ) : (
                <>
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
                                    {!Array.isArray(libraryBookDetail.libraryBooks) || libraryBookDetail.libraryBooks.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-3 px-6 text-center">소장 정보가 없습니다.</td>
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
                                                <td className="py-3 px-6">{libraryBook.overdue ? `연체중(${libraryBook.reserveCount}명)` : (libraryBook.borrowed || libraryBook.unmanned) ? `대출중(${libraryBook.reserveCount}명)` :  libraryBook.reserved ? `예약대기중(${libraryBook.reserveCount}명)` : "대출가능"}</td>
                                                <td className={`py-3 px-6 ${libraryBook.overdue && 'text-red-600'}`}>{libraryBook.dueDate || "-"}</td>
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
                        <Button children="대출예약" onClick={() => handleReserveClick(selectedBook)}
                        disabled={isLoading || !selectedBook || !(selectedBook.borrowed || selectedBook.unmanned) || selectedBook.reserveCount >= 2 }
                        className={`px-6 py-2 rounded text-white transition
                            ${!selectedBook
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                            } disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400`}
                        />
                        <Button children="무인예약" onClick={() => handleUnMannedReserveClick(selectedBook)}
                        disabled={isLoading || !selectedBook || selectedBook.borrowed || selectedBook.unmanned || selectedBook.reserveCount > 0 }
                        className={`px-6 py-2 rounded text-white transition
                            ${!selectedBook
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-fuchsia-800 hover:bg-fuchsia-900 cursor-pointer'
                            } disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400`}
                        />
                        <Button children="관심도서" onClick={() => handleInterestedClick(selectedBook)}
                        disabled={isLoading || !selectedBook }
                        className={`px-6 py-2 rounded text-white transition
                            ${!selectedBook
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'cursor-pointer'
                            } disabled:hover:bg-gray-400 disabled:cursor-not-allowed`}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default LibraryBookDetailComponent;