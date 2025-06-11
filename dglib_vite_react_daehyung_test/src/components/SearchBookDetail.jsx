import { useLocation } from "react-router-dom";
import { useState } from "react";

const SearchBookDetail = () => {
    const location = useLocation();
    const [bookDetail, setBookDetail] = useState(location.state?.book);
    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex gap-8">

                <div className="w-1/3">
                    <img
                        src={bookDetail.cover}
                        alt={bookDetail.bookTitle}
                        className="w-full rounded-lg shadow-lg object-contain"
                    />
                </div>


                <div className="w-2/3">
                    <h1 className="text-3xl font-bold mb-4">{bookDetail.bookTitle}</h1>

                    <div className="space-y-4">
                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">저자</span>
                            <span>{bookDetail.author}</span>
                        </div>

                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">출판사</span>
                            <span>{bookDetail.publisher}</span>
                        </div>

                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">출판일</span>
                            <span>{bookDetail.pubDate}</span>
                        </div>

                        <div className="flex border-b border-gray-200 py-2">
                            <span className="w-24 font-semibold text-gray-600">ISBN</span>
                            <span>{bookDetail.isbn13}</span>
                        </div>
                    </div>


                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">도서 소개</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {bookDetail.description ? bookDetail.description : "설명이 없습니다."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchBookDetail;