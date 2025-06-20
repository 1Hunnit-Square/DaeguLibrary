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
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
            <style>{`
                .swiper-pagination-bullet-active {
                    background-color: #00893B !important;
                    opacity: 1;
                }
            `}</style>
            
            <div className="border border-gray-300 min-h-20 flex items-center justify-center w-full sm:w-full md:max-w-[75%] lg:max-w-[85%] xl:max-w-[75%] mx-auto rounded-lg px-4 py-3 bg-white shadow-sm mb-8">
                <p className="text-sm sm:text-base md:text-sm text-center text-gray-700 font-medium">
                    <span className="text-[#00893B] font-semibold">{name}</span>님의 최근 대출 이력과 연령, 성별 정보를 바탕으로<br />
                    분석한 맞춤 도서 추천입니다.
                </p>
            </div>

            <div className="w-full max-w-6xl mx-auto mt-10 h-[350px] sm:h-[400px]">
                {isLoading ? (
                    <div className="w-full h-full flex flex-col justify-center items-center border border-gray-200 rounded-lg bg-gray-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00893B] mb-4"></div>
                        <div className="text-gray-600 font-medium">추천 도서를 분석중입니다...</div>
                    </div>
                ) : isError ? (
                    <div className="w-full h-full flex justify-center items-center border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-red-500 font-medium">오류가 발생했습니다.</p>
                    </div>
                ) : !data.docs || data.docs.length === 0 ? (
                    <div className="w-full h-full flex justify-center items-center border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-500 font-medium">추천도서가 없습니다.</p>
                    </div>
                ) : (
                    <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={15}
                    slidesPerView={2}
                    loop={true}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true }}
                    className="w-full h-full"
                    breakpoints={{
                        640: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 25,
                        },
                        1280: {
                            slidesPerView: 5,
                            spaceBetween: 30,
                        },
                    }}
                >
                        {data.docs.map((item, index) => (
                            <SwiperSlide key={index}>
                                <Link 
                                    to={`/mylibrary/detail/${item.book.isbn13}?from=personalized`} 
                                    className="flex flex-col items-center justify-center p-3 sm:p-4 h-[300px] sm:h-[350px] border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                                >
                                    {item.book.bookImageURL ? (
                                        <img
                                            src={item.book.bookImageURL}
                                            alt={item.book.bookname}
                                            className="max-w-full max-h-[150px] sm:max-h-[180px] object-contain mb-3"
                                        />
                                    ) : (
                                        <div className="w-[120px] sm:w-[150px] h-[150px] sm:h-[180px] bg-gray-100 flex items-center justify-center mb-3 rounded text-xs sm:text-sm text-gray-500">
                                            이미지 없음
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col justify-center text-center px-2">
                                        <h3 className="text-xs sm:text-sm font-medium mb-1 line-clamp-2">{item.book.bookname || "제목 없음"}</h3>
                                        <p className="text-xs text-gray-600 line-clamp-1">{item.book.authors || "저자 정보 없음"}</p>
                                    </div>
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