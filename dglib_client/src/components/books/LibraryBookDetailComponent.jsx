import { useParams, useSearchParams  } from 'react-router-dom';
import { getLibraryBookDetail} from '../../api/bookApi';
import { reserveBook, unMannedReserve, addInterestedBook } from '../../api/memberApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Button from "../common/Button";
import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import Loading from '../../routers/Loading';
import CheckBoxNonLabel from '../common/CheckNonLabel';
import { useBookActions } from '../../hooks/useBookActions';
import { useBookMutation } from '../../hooks/useBookMutation';
import { useReactToPrint } from 'react-to-print';




const LibraryBookDetailComponent = () => {
    const { isbn } = useParams();
    console.log("librarybookid", isbn);
    const [searchParams] = useSearchParams();
    const fromParam = searchParams.get('from');
    const [selectedBook, setSelectedBook] = useState(null);
    const queryClient = useQueryClient();
    const contentRef = useRef();
    const [printContent, setPrintContent] = useState(null);
    const reactToPrintFn = useReactToPrint({ 
        contentRef,
        onAfterPrint: () => setPrintContent(null) 
    });
    const handlePrintClick = (libraryBook) => {
        
        setPrintContent({
            bookTitle: bookDetails.bookTitle,
            location: libraryBook.location,
            callSign: libraryBook.callSign,
            libraryBookId: libraryBook.libraryBookId
        });
        
        setTimeout(() => {
            reactToPrintFn();
        }, 100);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [isbn]);



    const { data: libraryBookDetail = {}, isLoading, isError, error } = useQuery({
        queryKey: ['libraryBookDetail', isbn, fromParam],
         queryFn: () => {
                return getLibraryBookDetail(isbn);
        },
    });
    const isbnValue = (fromParam === 'reco' || fromParam === 'personalized') ? isbn : libraryBookDetail?.isbn;

    const findRecoBookData = () => {

        const queries = queryClient.getQueryCache().getAll();
        console.log(libraryBookDetail)
        const recoQueries = queries.filter(query =>
                query.queryKey[0] === 'recoBookList'
            );
        const memberRecoQueries = queries.filter(query =>
        query.queryKey[0] === 'memberRecoBook'
        );

        const genreQueries = queries.filter(query =>
            query.queryKey[0] === 'bookreco'
        );
                for (const query of recoQueries) {
                    const data = query.state?.data;
                    if (data?.content) {
                        const matchingBook = data.content?.find(book => book.isbn13 === isbnValue);
                        if (matchingBook) {
                            return matchingBook;
                        }
                    }
                }

                for (const query of memberRecoQueries) {
                    const data = query.state?.data;
                    if (data?.docs) {
                        const matchingItem = data.docs?.find(item => item.book.isbn13 === isbnValue);
                        if (matchingItem) {
                            return matchingItem.book;
                        }
                    }
                }

                for (const query of genreQueries) {
                    const data = query.state?.data;
                    const parsedData = JSON.parse(data.result);
                    
                    const matchingBook = parsedData.content?.find(book => book.isbn13 === isbnValue);
                    if (matchingBook) {
                        return matchingBook;
                    }
                    
                }

                return null;
        };


    const recoBookInfo = useMemo(() => {
            if (!isbnValue) return null;
            return findRecoBookData();
        }, [isbnValue, queryClient]);



    const bookDetails = useMemo(() => {

        if (libraryBookDetail?.isbn) {
            return libraryBookDetail;
        }


        if (recoBookInfo) {
            return {
                bookTitle: recoBookInfo.bookname,
                cover: recoBookInfo.bookImageURL,
                author: recoBookInfo.authors,
                publisher: recoBookInfo.publisher,
                pubDate: recoBookInfo.publication_year,
                isbn: recoBookInfo.isbn13,
                description: recoBookInfo.description,
            };
        }

        return {
            bookTitle: '도서 정보를 불러오는 중...',
            cover: '',
            author: '',
            publisher: '',
            pubDate: '',
            isbn: isbn || '',
            description: '',
            
        };

    }, [libraryBookDetail, recoBookInfo]);




    console.log("recoBookInfo", recoBookInfo);

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

    const hasValidData = libraryBookDetail?.isbn || recoBookInfo;
    const isActuallyLoading = isLoading && !hasValidData;
    

    return (
        <div className="max-w-full sm:max-w-[95%] lg:max-w-[90%] mx-auto p-4 sm:p-6 lg:p-8">
            {printContent && (
                <div ref={contentRef} className="print:block hidden">
                    <div className="p-5 font-sans">
                        <h2 className="mb-5 text-xl font-bold text-gray-800">도서 위치 정보</h2>
                        <div className="leading-relaxed space-y-2">
                            <p><span className="font-semibold">도서명:</span> {printContent.bookTitle}</p>
                            <p><span className="font-semibold">도서번호:</span> {printContent.libraryBookId}</p>
                            <p><span className="font-semibold">위치:</span> {printContent.location}</p>
                            <p><span className="font-semibold">청구번호:</span> {printContent.callSign}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 로딩 상태 개선 */}
            {isActuallyLoading ? (
                <Loading text="도서 정보를 불러오는 중입니다..." />
            ) : reserveMutation.isPending || unMannedReserveMutation.isPending || interestedMutation.isPending ? (
                <Loading text="처리중입니다..." />
            ) : isError && !hasValidData ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <p className="text-red-500 text-sm sm:text-base px-4 mb-4">
                            {error.response?.data?.message || "도서 정보를 불러올 수 없습니다."}
                        </p>
                        <p className="text-gray-600 text-sm px-4">
                            이전 페이지에서 접근하신 경우, 새로고침으로 인해 캐시 데이터가 사라져서 발생한 문제일 수 있습니다.
                            <br />
                            도서 검색 페이지에서 다시 접근해 주세요.
                        </p>
                    </div>
                </div>
            ) : !hasValidData && !isLoading ? (
                // 캐시 데이터가 없는 경우 안내 메시지
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <p className="text-orange-500 text-lg font-semibold mb-4">
                            도서 정보를 찾을 수 없습니다
                        </p>
                        <p className="text-gray-600 text-sm px-4">
                            도서관에 소장중이지 않은 책에 뒤로가기로 접근하신 경우, 새로고침으로 인해<br />
                            캐시 데이터가 사라져서 도서 정보를 표시할 수 없습니다.
                            <br /><br />
                            
                            뒤로 가기가 아닌 다시 도서를 선택해주세요
                           
                        </p>
                    </div>
                </div>
            ) : (
                // 정상적인 도서 상세 정보 표시
                <>
                    <div className="flex items-center justify-center border border-b-0 border-[#00893B] w-full min-h-[60px] sm:min-h-[80px] p-4">
                        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-center">{bookDetails.bookTitle}</h1>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 border border-[#00893B] w-full min-h-[400px] sm:min-h-[500px] p-4 sm:p-6 lg:p-8">
                        <div className="w-full lg:w-1/5 flex justify-center lg:justify-start">
                            <div className="w-48 sm:w-56 lg:w-full max-w-[200px]">
                                <img
                                    src={bookDetails.cover}
                                    alt={bookDetails.bookTitle}
                                    className="w-full rounded-lg shadow-lg object-contain"
                                />
                            </div>
                        </div>
                        
                        <div className="w-full lg:w-2/3">
                            <div className="space-y-3 sm:space-y-4 mt-4 lg:mt-20">
                                <div className="flex flex-col sm:flex-row border-b border-gray-200 py-2">
                                    <span className="w-full sm:w-24 font-semibold text-gray-600 mb-1 sm:mb-0">저자</span>
                                    <span className="break-words">{bookDetails.author}</span>
                                </div>
    
                                <div className="flex flex-col sm:flex-row border-b border-gray-200 py-2">
                                    <span className="w-full sm:w-24 font-semibold text-gray-600 mb-1 sm:mb-0">출판사</span>
                                    <span className="break-words">{bookDetails.publisher}</span>
                                </div>
    
                                <div className="flex flex-col sm:flex-row border-b border-gray-200 py-2">
                                    <span className="w-full sm:w-24 font-semibold text-gray-600 mb-1 sm:mb-0">출판일</span>
                                    <span>{bookDetails.pubDate}</span>
                                </div>
    
                                <div className="flex flex-col sm:flex-row border-b border-gray-200 py-2">
                                    <span className="w-full sm:w-24 font-semibold text-gray-600 mb-1 sm:mb-0">ISBN</span>
                                    <span className="break-words">{bookDetails.isbn}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 sm:mt-8">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">도서 소개</h2>
                        <div className="border min-h-[120px] sm:min-h-[150px] border-[#00893B]">
                            <p className="text-gray-700 text-sm sm:text-base my-4 sm:my-6 lg:my-8 mx-4 sm:mx-6 lg:mx-10 leading-relaxed whitespace-pre-line">
                                {bookDetails.description || "설명이 없습니다."}
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6 sm:mt-8">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">소장 정보</h2>
                        
                        {/* 모바일 카드 형태 */}
                        <div className="block lg:hidden space-y-4">
                            {!Array.isArray(bookDetails.libraryBooks) || bookDetails.libraryBooks.length === 0 ? (
                                <div className="border border-[#00893B] p-4 text-center">
                                    소장 정보가 없습니다.
                                </div>
                            ) : (
                                bookDetails.libraryBooks.map((libraryBook, index) => (
                                    <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3 bg-white shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <CheckBoxNonLabel 
                                                checked={selectedBook === libraryBook} 
                                                onChange={(e) => handleCheckChange(e, libraryBook)} 
                                            />
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex">
                                                <span className="w-20 font-semibold text-gray-600 shrink-0">도서번호:</span>
                                                <span className="break-words">{libraryBook.libraryBookId}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="w-20 font-semibold text-gray-600 shrink-0">위치:</span>
                                                <span className="break-words">{libraryBook.location}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="w-20 font-semibold text-gray-600 shrink-0">청구번호:</span>
                                                <span className="break-words">{libraryBook.callSign}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="w-20 font-semibold text-gray-600 shrink-0">대출상태:</span>
                                                <span className="break-words">
                                                    {libraryBook.overdue ? `연체중(${libraryBook.reserveCount}명)` : 
                                                     libraryBook.borrowed ? `대출중(${libraryBook.reserveCount}명)` :  
                                                     libraryBook.unmanned ? `무인예약중(${libraryBook.reserveCount}명)` :  
                                                     libraryBook.reserved ? `예약대기중(${libraryBook.reserveCount}명)` : "대출가능"}
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="w-20 font-semibold text-gray-600 shrink-0">반납예정:</span>
                                                <span className={`break-words ${libraryBook.overdue ? 'text-red-600' : ''}`}>
                                                    {libraryBook.dueDate || "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
    
                        {/* 데스크톱 테이블 형태 */}
                        <div className="hidden lg:block overflow-x-auto">
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
                                    {!Array.isArray(bookDetails.libraryBooks) || bookDetails.libraryBooks.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-3 px-6 text-center">소장 정보가 없습니다.</td>
                                        </tr>
                                    ) : (
                                        bookDetails.libraryBooks.map((libraryBook, index) => (
                                            <tr key={index} className={`${
                                                index === bookDetails.libraryBooks.length - 1
                                                ? "border-b border-[#00893B]"
                                                : "border-b border-gray-200"
                                                }`}>
                                                <td className="py-3 px-6 w-10"> 
                                                    <CheckBoxNonLabel checked={selectedBook === libraryBook} onChange={(e) => handleCheckChange(e, libraryBook)} />
                                                </td>
                                                <td className="py-3 px-6">{libraryBook.libraryBookId}</td>
                                                <td className="py-3 px-6">{libraryBook.location}</td>
                                                <td className="py-3 px-6">{libraryBook.callSign}</td>
                                                <td className="py-3 px-6">
                                                    {libraryBook.overdue ? `연체중(${libraryBook.reserveCount}명)` : 
                                                     libraryBook.borrowed ? `대출중(${libraryBook.reserveCount}명)` :  
                                                     libraryBook.unmanned ? `무인예약중(${libraryBook.reserveCount}명)` :  
                                                     libraryBook.reserved ? `예약대기중(${libraryBook.reserveCount}명)` : "대출가능"}
                                                </td>
                                                <td className={`py-3 px-6 ${libraryBook.overdue && 'text-red-600'}`}>
                                                    {libraryBook.dueDate || "-"}
                                                </td>
                                                <td className="py-3 px-6">
                                                    <Button onClick={() => handlePrintClick(libraryBook)}>
                                                        위치인쇄
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-8">
                        <Button 
                            children="대출예약" 
                            onClick={() => handleReserveClick(selectedBook)}
                            disabled={isLoading || !selectedBook || !(selectedBook.borrowed || selectedBook.unmanned) || selectedBook.reserveCount >= 2 }
                            className={`px-4 sm:px-6 py-2 rounded text-white transition text-sm sm:text-base
                                ${!selectedBook
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                                } disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400`}
                        />
                        <Button 
                            children="무인예약" 
                            onClick={() => handleUnMannedReserveClick(selectedBook)}
                            disabled={isLoading || !selectedBook || selectedBook.borrowed || selectedBook.unmanned || selectedBook.reserveCount > 0 }
                            className={`px-4 sm:px-6 py-2 rounded text-white transition text-sm sm:text-base
                                ${!selectedBook
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-fuchsia-800 hover:bg-fuchsia-900 cursor-pointer'
                                } disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400`}
                        />
                        <Button 
                            children="관심도서" 
                            onClick={() => handleInterestedClick(selectedBook)}
                            disabled={isLoading || !selectedBook }
                            className={`px-4 sm:px-6 py-2 rounded text-white transition text-sm sm:text-base
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
};

export default LibraryBookDetailComponent;