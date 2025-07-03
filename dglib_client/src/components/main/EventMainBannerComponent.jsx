import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEventBanners, getEventBannerImageUrl } from "../../api/eventApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const EventMainBannerComponent = () => {
    const [banners, setBanners] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await getEventBanners();

                const pinned = res.filter(b => b.isPinned);
                const normal = res.filter(b => !b.isPinned);

                pinned.sort((a, b) => a.bno - b.bno);
                normal.sort((a, b) => a.bno - b.bno);

                const merged = [...pinned, ...normal];

                setBanners(merged.slice(0, 6));
            } catch (err) {
                console.error("새소식 배너 불러오기 실패", err);
            }
        };
        fetchBanners();
    }, []);

    const handleClick = (eno) => {
        if (!eno) {
            console.warn("새소식 번호가 없습니다.")
            return;
        }
        navigate(`/community/event/${eno}`);
    };

    return (
        <div className="w-full h-full">
            {banners.length > 0 ? (
                <Swiper
                    modules={[Navigation, Autoplay]}
                    slidesPerView={1}
                    navigation
                    autoplay={{ delay: 3000 }}
                    loop
                    className="event-swiper w-full h-full"
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.eno} className="w-full h-full">
                            <div
                                className="w-full h-full"
                                onClick={() => handleClick(banner.eno)}
                            >
                                <img
                                    src={getEventBannerImageUrl(banner.imageUrl)}
                                    alt={banner.imageName}
                                    className="w-full h-full cursor-pointer"
                                    style={{ objectFit: "fill" }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="flex items-center justify-center min-h-[230px]">
                    <p className="text-sm text-gray-500 text-center">등록된 새소식 배너가 없습니다.</p>
                </div>
            )}

            <style>
                {`
                .event-swiper {
                    --swiper-navigation-color: #475569;
                }

                .event-swiper .swiper-button-next,
                .event-swiper .swiper-button-prev {
                    width: 20px;
                    height: 20px;
                }

                .event-swiper .swiper-button-next::after,
                .event-swiper .swiper-button-prev::after {
                    font-size: 20px;
                    color: #475569;    
                }
            `}
            </style>
        </div>
    );
};

export default EventMainBannerComponent;
