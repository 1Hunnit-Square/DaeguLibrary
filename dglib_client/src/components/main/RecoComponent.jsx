import { useQuery } from "@tanstack/react-query";
import { getTopNewBooks } from "../../api/bookApi";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useRef, useState, useEffect } from "react";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const RecoComponent = ({type}) => {
    console.log(type)
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [calculatedHeights, setCalculatedHeights] = useState({});
    
    const { isLoading, isFetching, data, isError } = useQuery({
        queryKey: ['', type],
        queryFn: () => getTopNewBooks(type),
        staleTime:Infinity,
        refetchOnWindowFocus: false
    })

        // 화면 크기별 예상 높이 계산 (더 정확한 모바일 대응)
        const calculateExpectedHeight = () => {
            const width = window.innerWidth;
            const padding = width >= 640 ? 32 : 16; // p-2 sm:p-4
            
            if (width >= 1280) { // xl: 데스크톱
                // 200px 너비 기준으로 aspect-ratio 3:4 + 텍스트 영역
                const imageHeight = (200 * 4) / 3; // 266px
                const textHeight = 40; // 제목 + 저자
                return imageHeight + textHeight + padding;
            } else { // 모바일: Swiper
                // 화면 너비에서 패딩과 gap을 제외한 실제 슬라이드 너비 계산
                let slidesPerView = 2.5;
                let spaceBetween = 16;
                
                if (width >= 1024) { slidesPerView = 5; spaceBetween = 24; }
                else if (width >= 768) { slidesPerView = 4; spaceBetween = 24; }
                else if (width >= 640) { slidesPerView = 3; spaceBetween = 20; }
                
                const availableWidth = width - (padding * 2);
                const totalGaps = (slidesPerView - 1) * spaceBetween;
                const slideWidth = (availableWidth - totalGaps) / slidesPerView;
                
                // aspect-ratio 3:4로 이미지 높이 계산
                const imageHeight = (slideWidth * 4) / 3;
                const textHeight = 40; // 제목 + 저자
                
                return imageHeight + textHeight + padding;
            }
        };
    
        // 현재 화면 크기의 key 생성
        const getScreenKey = () => {
            const width = window.innerWidth;
            if (width >= 1280) return 'xl';
            if (width >= 1024) return 'lg';
            if (width >= 768) return 'md';
            if (width >= 640) return 'sm';
            return 'xs';
        };
    
        // 실제 높이 측정 및 저장
        useEffect(() => {
            if (!isLoading && containerRef.current) {
                const height = containerRef.current.offsetHeight;
                const screenKey = getScreenKey();
                
                setCalculatedHeights(prev => ({
                    ...prev,
                    [screenKey]: height
                }));
            }
        }, [isLoading, data]);
    
        const handleBookClick = (isbn) => {
            navigate(`/books/detail/${isbn}?from=reco`);
        };
    
        // 로딩 높이 계산 (모바일 최적화)
        const getLoadingHeight = () => {
            const screenKey = getScreenKey();
            const savedHeight = calculatedHeights[screenKey];
            
            if (savedHeight) {
                return savedHeight;
            }
            
            // 저장된 높이가 없으면 계산된 예상 높이 사용
            return calculateExpectedHeight();
        };
    
        if (isLoading) return (
            <div className="p-2 sm:p-4">
                <div 
                    className="flex justify-center items-center"
                    style={{ 
                        height: `${getLoadingHeight()}px`
                    }}
                >
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
                </div>
            </div>
        );
    if (isError) return <div>데이터 로딩 중 오류가 발생했습니다.</div>;
    if (!data) {return <div>데이터를 받아오지 못했습니다.</div>;}


    return (
        <div className="p-2 sm:p-4"  ref={containerRef}>
           
            <div className="hidden xl:flex xl:justify-between xl:gap-4">
                {data.map((bookData) => (
                    <div 
                        key={bookData.isbn}
                        className='flex flex-col items-center group hover:scale-105 transition-transform duration-200 cursor-pointer flex-1 max-w-[200px]' 
                        onClick={() => handleBookClick(bookData.isbn)}
                    >
                        <div className="w-full aspect-[3/4] mb-2">
                            <img 
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200" 
                                src={bookData.cover} 
                                alt={bookData.bookTitle}
                            />
                        </div>
                        <h3 className="text-xs sm:text-sm font-semibold text-center pb-1 w-full overflow-hidden whitespace-nowrap text-ellipsis">
                            {bookData.bookTitle}
                        </h3>
                        <p className="text-xs text-gray-600 text-center w-full overflow-hidden whitespace-nowrap text-ellipsis">
                            {bookData.author}
                        </p>
                    </div>
                ))}
            </div>

            
            <div className="xl:hidden w-full flex justify-center">
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={16}
                    slidesPerView={2.5}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    breakpoints={{
                        640: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 4,
                            spaceBetween: 24,
                        },
                        1024: {
                            slidesPerView: 5,
                            spaceBetween: 24,
                        },
                    }}
                    centeredSlides={false}
                    slidesPerGroup={1}
                    className="w-full"
                >
                    {data.map((bookData) => (
                        <SwiperSlide key={bookData.isbn}>
                            <div 
                                className='flex flex-col items-center group hover:scale-105 transition-transform duration-200 cursor-pointer' 
                                onClick={() => handleBookClick(bookData.isbn)}
                            >
                                <div className="w-full aspect-[3/4] mb-2">
                                    <img 
                                        className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200" 
                                        src={bookData.cover} 
                                        alt={bookData.bookTitle}
                                    />
                                </div>
                                <h3 className="text-xs sm:text-sm font-semibold text-center pb-1 w-full overflow-hidden whitespace-nowrap text-ellipsis">
                                    {bookData.bookTitle}
                                </h3>
                                <p className="text-xs text-gray-600 text-center w-full overflow-hidden whitespace-nowrap text-ellipsis">
                                    {bookData.author}
                                </p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    )
}

export default RecoComponent;