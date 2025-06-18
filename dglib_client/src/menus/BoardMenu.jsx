import { NavLink } from "react-router-dom";
import { useState } from "react";
import NoticeComponent from "../components/main/NoticeComponent";
import NewsComponent from "../components/main/NewsComponent";
import { useNavigate } from "react-router-dom";

const BoardMenu = () => {

    const [category, setCategory] = useState("notice")
    const navigate = useNavigate();

    const getNavLinkClass = (key) => {
        return category == key
             ? "text-black font-bold border-b-2 border-[#00893B] pb-1"
            : "text-gray-500 hover:text-black cursor-pointer hover:border-b-2 hover:border-gray-300 pb-1 transition-all duration-200";
    };

    function menuHandler(key) {
        setCategory(key);
    }

    return (
        <>
            <div className="p-3 pb-1.5">
                <div className="flex justify-between">
                    <ul className="flex space-x-5 ml-3 justify-items-center">
                        <li className={getNavLinkClass("notice")} onClick={() => menuHandler("notice")}>공지사항</li>
                        <li className={getNavLinkClass("news")} onClick={() => menuHandler("news")}>보도자료</li>
                    </ul>
                    <div onClick={() => {
                        if (category === "notice") navigate("/community/notice");
                        else if (category === "news") navigate("/community/news");
                    }}
                        className="font-bold mr-3 cursor-pointer text-2xl leading-none">+</div>
                </div>
                <div className="w-[100%] h-[1px] bg-[#00893B] mt-2"></div>
            </div>
            {(category == "notice") && <NoticeComponent />}
            {(category == "news") && <NewsComponent />}
        </>
    );
}

export default BoardMenu;