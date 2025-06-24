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

      
        const calculateExpectedHeight = () => {
            const width = window.innerWidth;
            const padding = width >= 640 ? 32 : 16; 
            
            if (width >= 1280) { 
                const imageHeight = (200 * 4) / 3; 
                const textHeight = 40;
                return imageHeight + textHeight + padding;
            } else { 
                let slidesPerView = 2.5;
                let spaceBetween = 16;
                
                if (width >= 1024) { slidesPerView = 5; spaceBetween = 24; }
                else if (width >= 768) { slidesPerView = 4; spaceBetween = 24; }
                else if (width >= 640) { slidesPerView = 3; spaceBetween = 20; }
                
                const availableWidth = width - (padding * 2);
                const totalGaps = (slidesPerView - 1) * spaceBetween;
                const slideWidth = (availableWidth - totalGaps) / slidesPerView;
                
              
                const imageHeight = (slideWidth * 4) / 3;
                const textHeight = 40;
                
                return imageHeight + textHeight + padding;
            }
        };
    
       
        const getScreenKey = () => {
            const width = window.innerWidth;
            if (width >= 1280) return 'xl';
            if (width >= 1024) return 'lg';
            if (width >= 768) return 'md';
            if (width >= 640) return 'sm';
            return 'xs';
        };
    
        
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
    
       
        const getLoadingHeight = () => {
            const screenKey = getScreenKey();
            const savedHeight = calculatedHeights[screenKey];
            
            if (savedHeight) {
                return savedHeight;
            }
            
          
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
           
           <div className="hidden xl:flex xl:justify-center gap-6 xl:gap-5">
                {data.map((bookData) => (
                    <div 
                        key={bookData.isbn}
                        className="flex flex-col items-center group hover:scale-105 transition-transform duration-200 cursor-pointer flex-1 basis-0 min-w-0"
                        onClick={() => handleBookClick(bookData.isbn)}
                    >
                        <div className="w-full max-w-[200px] aspect-[3/4] mb-2 overflow-hidden rounded-lg">
                            <img 
                                className="w-full h-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200" 
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
                                <div className="w-full aspect-[3/4] mb-2 overflow-hidden rounded-lg">
                                    <img 
                                        className="w-full h-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200" 
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