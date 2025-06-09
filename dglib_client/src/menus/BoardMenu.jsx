import { NavLink } from "react-router-dom";
import { useState } from "react";
import NoticeComponent from "../components/main/NoticeComponent";
import { useNavigate } from "react-router-dom";

const BoardMenu = () => {

    const [ category , setCategory ] = useState("notice")
    const navigate = useNavigate();

    const getNavLinkClass = (key) => {
        return category == key
            ? "text-black font-bold"
            : "text-gray-500 hover:text-black cursor-pointer";
    };

    function menuHandler(key){
        setCategory(key);
    }

    return (
        <>
         <div className="p-3 pb-2">
            <div className="flex justify-between">
         <ul className="flex space-x-5 ml-3 justify-items-center">
            <li className={getNavLinkClass("notice")} onClick={() => menuHandler("notice")}>공지사항</li>
            <li className={getNavLinkClass("news")} onClick={() => menuHandler("news")}>보도자료</li>
        </ul>
        <div onClick={()=>navigate("/community/notice")}
            className = "font-bold mr-3 cursor-pointer text-2xl leading-none">+</div>
        </div>
        <div className="w-[100%] h-[1px] bg-[#00893B] mt-3"></div>
        </div>
        {(category == "notice") && <NoticeComponent />}
        </>
    );
}

export default BoardMenu;