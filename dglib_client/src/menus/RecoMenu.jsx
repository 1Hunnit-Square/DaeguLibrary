import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

const RecoMenu = ({ Component }) => {

    const [ type , setType ] = useState("topborrow");
    const category = {
        "topborrow":"베스트셀러",
        "new":"신착도서"
    }

    const getNavLinkClass = (key) => {
        return type == key
            ? "text-black font-bold border-b-2 border-[#00893B] pb-1"
            : "text-gray-500 hover:text-black cursor-pointer hover:border-b-2 hover:border-gray-300 pb-1 transition-all duration-200";
    };

    function menuHandler(key){
        setType(key);
    }

    return (
        <>
        <div className="p-2 sm:p-4">
           
            <div className="hidden xl:flex ml-5 xl:gap-8">
                {Object.keys(category).map((key) => (
                    <div 
                        key={key} 
                        className={`${getNavLinkClass(key)} whitespace-nowrap text-base`} 
                        onClick={() => menuHandler(key)}
                    >
                        {category[key]}
                    </div>
                ))}
            </div>

           
            <div className="xl:hidden">
                <Swiper
                    
                    spaceBetween={16}
                    slidesPerView="auto"
                    freeMode={true}
                    className="w-full"
                >
                    {Object.keys(category).map((key) => (
                        <SwiperSlide key={key} className="!w-auto">
                            <div 
                                className={`${getNavLinkClass(key)} whitespace-nowrap text-sm sm:text-base px-2`} 
                                onClick={() => menuHandler(key)}
                            >
                                {category[key]}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            
            <div className="w-full h-[1px] bg-[#00893B] mt-1 sm:mt-2"></div>
        </div>
        <Component type={type} />
        </>
    );
}

export default RecoMenu;