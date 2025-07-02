import { NavLink, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

const RecoMenu = ({ Component }) => {

    const [ type , setType ] = useState("topborrow");
    const navigate = useNavigate();
    const currentDate = new Date().toDateString();
    const getDateParams = useMemo(() => {
        const today = new Date();
        const aMonthAgo = new Date(today);
        aMonthAgo.setDate(today.getDate() - 30);

        const endDateStr = today.toLocaleDateString('fr-CA');
        const startDateStr = aMonthAgo.toLocaleDateString('fr-CA');

        return `startDate=${startDateStr}&endDate=${endDateStr}`;
    }, [currentDate]);
    const category = {
        "topborrow":"대출베스트",
        "new":"신착도서"
    }

    const getNavLinkClass = (key) => {
        return type === key
        ? "text-black font-bold border-b-2 border-[#00893B] pb-1 transition-all duration-200"
        : "text-gray-500 hover:text-black cursor-pointer pb-1 transition-all duration-200 border-b-2 border-transparent hover:border-gray-300";
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
                <div onClick={() => {
                        if (type === "topborrow") navigate(`/books/top?check=오늘`);
                        else if (type === "new") navigate(`/books/new?page=1&${getDateParams}`);
                    }}
                        className="font-bold mr-3 cursor-pointer text-2xl leading-none ml-auto">+</div>
                
            </div>

           
            <div className="xl:hidden flex">
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
                <div onClick={() => {
                        if (type === "topborrow") navigate(`/books/top?check=오늘`);
                        else if (type === "new") navigate(`/books/new?page=1&${getDateParams}`);
                    }}
                        className="font-bold mr-3 cursor-pointer text-2xl leading-none ml-auto">+</div>
            </div>
            
            <div className="w-full h-[1px] bg-[#00893B] mt-1 sm:mt-2"></div>
        </div>
        <Component type={type} />
        </>
    );
}

export default RecoMenu;