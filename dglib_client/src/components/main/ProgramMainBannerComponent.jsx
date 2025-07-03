import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getProgramBanners, getProgramBannerImageUrl } from "../../api/programApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProgramMainBannerComponent = () => {
    const [banners, setBanners] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await getProgramBanners();
                const sorted = res.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                setBanners(sorted.slice(0, 6));
            } catch (err) {
                console.error("프로그램 배너 불러오기 실패", err);
            }
        };

        fetchBanners();
    }, []);

    const handleClick = (progNo) => {
        if (!progNo) {
            console.warn("프로그램 번호가 없습니다.");
            return;
        }
        navigate(`/reservation/program/${progNo}`);
    };

    return (
        <div className="w-full h-full">
            <h2 className="text-ms pl-3 font-bold text-gray-800">이달의 프로그램</h2>
            {banners.length > 0 ? (
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    slidesPerView={1} // 한 번에 보여질 슬라이드 수
                    navigation
                    pagination={{ clickable: true }} // 페이지네이션을 클릭 가능하게 설정
                    autoplay={{ delay: 5000 }} // 슬라이드 간 지연 시간
                    loop
                    autoHeight={true}
                    className="program-swiper w-full h-full"
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.programInfoId}>
                            <div className="w-full h-full py-4">
                                <div
                                    className="w-3/4 h-[110px] sm:h-[200px] lg:h-[270px] overflow-hidden rounded-3xl shadow-lg mx-auto cursor-pointer hover:opacity-80 transition duration-200"
                                    onClick={() => handleClick(banner.programInfoId)}
                                >
                                    <img
                                        src={getProgramBannerImageUrl(banner.thumbnailPath)}
                                        alt={banner.progName}
                                        className="w-full h-full"
                                    />
                                </div>
                                {/* 텍스트 영역 */}
                                <div 
                                    className="w-fit pt-3 pb-4 text-center cursor-pointer mx-auto"
                                    onClick={() => handleClick(banner.programInfoId)}    
                                >
                                    <p className="text-base sm:text-lg font-bold text-green-900">【{banner.progName}】</p>
                                    <p className="text-sm font-bold text-gray-700">{banner.startDate} ~ {banner.endDate}</p>
                                    <p className="text-sm font-bold text-gray-700 mt-1">
                                        {banner.dayNames?.join(', ')} {banner.startTime} ~ {banner.endTime}
                                    </p>
                                    <p className="text-sm font-bold text-gray-700 mt-1">{banner.target} 대상</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="flex items-center justify-center min-h-[300px]">
                    <p className="text-sm text-gray-500 text-center mt-15">등록된 배너가 없습니다.</p>
                </div>
            )}

            <style>
                {`
                    .program-swiper {
                        --swiper-navigation-color: #160258;
                        --swiper-pagination-color: #00893B;
                    }

                    .program-swiper .swiper-button-next,
                    .program-swiper .swiper-button-prev {
                        width: 20px;
                        height: 20px;
                    }

                    .program-swiper .swiper-button-next::after,
                    .program-swiper .swiper-button-prev::after {
                        font-size: 20px;
                        color: #160258;
                    }
                `}
            </style>

        </div>
    );
};

export default ProgramMainBannerComponent;