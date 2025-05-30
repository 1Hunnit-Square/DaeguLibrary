import {getMemberRecoBook} from '../../api/bookPythonApi';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { memberNameSelector } from '../../atoms/loginState';
import { useRecoilValue } from "recoil";
import { Link } from "react-router-dom";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const BookSuggestionComponent = () => {
    const name = useRecoilValue(memberNameSelector);
    const { data= {docs: []}, isLoading, isError } = useQuery({
        queryKey: ['memberRecoBook'],
        queryFn: getMemberRecoBook,
        staleTime: Infinity,
        refetchOnWindowFocus: false
    });
    console.log("추천도서 데이터:", data.docs);

    return (
        <div className="w-full p-4">
            <style jsx>{`
                .swiper-pagination-bullet-active {
                    background-color: #10b981 !important;
                    opacity: 1;
                }
            `}</style>
            <div className="border min-h-20 flex items-center justify-center max-w-[50%] mx-auto rounded-lg">
                <p>{name}님의 최근 대출 이력과 연령, 성별 정보를 바탕으로 분석한 맞춤 도서 추천입니다.</p>
            </div>

            <div className="w-full mt-10 h-[400px]">
                {isLoading ? (
                    <div className="w-full h-full flex flex-col justify-center items-center border border-gray-200 rounded-lg">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                        <div className="pt-5 text-gray-600">데이터를 분석중입니다...</div>
                    </div>
                ) : isError ? (
                    <div className="w-full h-full flex justify-center items-center border border-gray-200 rounded-lg">
                        <p className="text-red-500">오류가 발생했습니다.</p>
                    </div>
                ) : !data.docs || data.docs.length === 0 ? (
                    <div className="w-full h-full flex justify-center items-center border border-gray-200 rounded-lg">
                        <p>추천도서가 없습니다.</p>
                    </div>
                ) : (

                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={5}
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        pagination={{ clickable: true }}
                        className="w-full h-full"
                    >
                        {data.docs.map((item, index) => (

                            <SwiperSlide key={index}>
                                <Link to={`/mylibrary/detail/${item.book.isbn13}?from=personalized`} className="flex flex-col items-center justify-center p-4 h-[350px] border border-gray-200 rounded-lg shadow-sm">
                                    {item.book.bookImageURL ? (
                                        <img
                                            src={item.book.bookImageURL}
                                            alt={item.book.bookname}
                                            className="max-w-full max-h-[200px] object-contain mb-3"
                                        />
                                    ) : (
                                        <div className="w-[150px] h-[200px] bg-gray-100 flex items-center justify-center mb-3">
                                            이미지 없음
                                        </div>
                                    )}
                                    <h3 className="text-base font-medium text-center mt-2">{item.book.bookname || "제목 없음"}</h3>
                                    <p className="text-sm text-gray-600 text-center">{item.book.authors || "저자 정보 없음"}</p>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                )}

            </div>
        </div>
    );
}

export default BookSuggestionComponent;