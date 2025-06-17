import { useEffect, useState } from "react";
import { getProgramBanners, getProgramBannerImageUrl } from "../../api/programApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProgramMainBannerComponent = () => {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await getProgramBanners();
                setBanners(res.slice(0, 3));
            } catch (err) {
                console.error("메인 배너 불러오기 실패", err);
            }
        };

        fetchBanners();
    }, []);

    return (
        <div className="w-full h-full">
            {banners.length > 0 ? (
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000 }}
                    loop
                    className="rounded-lg overflow-hidden shadow"
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.bno}>
                            <div className="w-full flex flex-col">
                                {/* 이미지 */}
                                <img
                                    src={getProgramBannerImageUrl(banner.thumbnailPath)}
                                    alt={banner.progName}
                                    className="w-full h-[200px] sm:h-[240px] lg:h-[260px] object-contain object-center"
                                />
                                {/* 설명 카드 */}
                                <div className="bg-white p-3 text-center mb-6">
                                    <p className="text-lg font-bold text-gray-900">【{banner.progName}】</p>
                                    <p className="text-sm font-bold text-gray-700">
                                        {banner.startDate} ~ {banner.endDate}
                                    </p>
                                    <p className="text-sm font-bold text-gray-700">
                                        {banner.dayNames?.join(', ')} {banner.startTime} ~ {banner.endTime}
                                    </p>
                                    <p className="text-sm font-bold text-gray-700">{banner.target} 대상</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <p className="text-sm text-gray-500 text-center">등록된 배너가 없습니다.</p>
            )}
        </div>
    );
};

export default ProgramMainBannerComponent;