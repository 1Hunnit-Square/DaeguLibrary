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
                setBanners(res.slice(0, 3));
            } catch (err) {
                console.error("메인 배너 불러오기 실패", err);
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
            <h2 className="text-ms font-bold text-gray-800 mb-1">이달의 프로그램</h2>
            {banners.length > 0 ? (
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    slidesPerView={1} // 한 번에 보여질 슬라이드 수
                    navigation
                    pagination={{ clickable: true }} // 페이지네이션을 클릭 가능하게 설정
                    autoplay={{ delay: 3000 }} // 슬라이드 간 지연 시간
                    loop
                    className="rounded-lg overflow-hidden shadow"
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.programInfoId}>
                            <div
                                className="w-full flex flex-col items-center overflow-hidden cursor-pointer px-4"
                                onClick={() => handleClick(banner.programInfoId)}
                            >
                                <img
                                    src={getProgramBannerImageUrl(banner.thumbnailPath)}
                                    alt={banner.progName}
                                    className="w-full h-[240px] sm:h-[260px] lg:h-[280px] object-contain object-center mx-auto bg-white"
                                />
                                <div className="bg-white px-4 pt-3 pb-4 text-center mb-4">
                                    <p className="text-base sm:text-lg font-bold text-green-800">【{banner.progName}】</p>
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
                <p className="text-sm text-gray-500 text-center">등록된 배너가 없습니다.</p>
            )}
        </div>
    );
};

export default ProgramMainBannerComponent;