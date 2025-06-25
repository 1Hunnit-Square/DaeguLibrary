import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

const GenreMenu = ({ Component }) => {

    const [ genre , setGenre ] = useState("literature");
    const navigate = useNavigate();
    const category = {
        "literature":"문학",
        "philosophy":"철학",
        "religion":"종교",
        "history":"역사",
        "language":"언어",
        "art":"예술",
        "social-sciences":"사회과학",
        "natural-sciences":"자연과학",
        "technology":"기술과학"
    }

    const getNavLinkClass = (key) => {
        return genre === key
        ? "text-black font-bold border-b-2 border-[#00893B] pb-1 transition-all duration-200"
        : "text-gray-500 hover:text-black cursor-pointer pb-1 transition-all duration-200 border-b-2 border-transparent hover:border-gray-300";
    };

    function menuHandler(key){
        setGenre(key);
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
                        
                        navigate(`/books/recommend?genre=${genre}&page=1`);
                    }}
                        className="font-bold mr-3 cursor-pointer text-2xl leading-none ml-auto">+</div>
            </div>

           
            <div className="xl:hidden flex">
                <Swiper
                    
                    spaceBetween={16}
                    slidesPerView="auto"
                    freeMode={true}
                    className="w-[80%]"
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
                        navigate(`/books/recommend?genre=${genre}&page=1`);
                    }}
                        className="font-bold mr-3 cursor-pointer text-2xl leading-none ml-auto">+</div>
            </div>
            
            <div className="w-full h-[1px] bg-[#00893B] mt-1 sm:mt-2"></div>
        </div>
        <Component genre={genre} />
        </>
    );
}

export default GenreMenu;