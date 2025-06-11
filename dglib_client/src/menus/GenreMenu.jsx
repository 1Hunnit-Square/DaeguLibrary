import { NavLink } from "react-router-dom";
import { useState } from "react";

const GenreMenu = ({ Component }) => {

    const [ genre , setGenre ] = useState("literature");
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
        return genre == key
            ? "text-black font-bold"
            : "text-gray-500 hover:text-black cursor-pointer";
    };

    function menuHandler(key){
        setGenre(key);
    }

    return (
        <>
        <div className="p-4">
            <ul className="flex space-x-10 ml-10">
               {
               Object.keys(category).map((key) => (
                <li key={key} className={getNavLinkClass(key)} onClick={() => menuHandler(key)}>{category[key]}</li>
                )
            )}
            </ul>
            <div className="w-[100%] h-[1px] bg-[#00893B] mt-4"></div>
        </div>
        <Component genre={genre} />
        </>
    );
}

export default GenreMenu;