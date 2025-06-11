import { NavLink } from "react-router-dom";

const getNavLinkClass = ({ isActive }) => {
    return isActive
        ? "text-white px-3 py-2 rounded-md text-sm font-medium"
        : "text-gray-700 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium";
};

const Menu = () => {
    return (
        <div className="bg-blue-500 p-4 shadow-md">
        <ul className="flex space-x-4 justify-center">
            <li><NavLink to={'/genre'} className={getNavLinkClass}>장르</NavLink></li>
            <li><NavLink to={'/search'} className={getNavLinkClass}>검색</NavLink></li>
            <li><NavLink to={'/bookreg'} className={getNavLinkClass}>도서등록</NavLink></li>
            <li><NavLink to={'/librarybooklist'} className={getNavLinkClass}>도서목록</NavLink></li>
            <li><NavLink to={'/rentbook'} className={getNavLinkClass}>도서대출</NavLink></li>
            <li><NavLink to={'/rentlist'} className={getNavLinkClass}>대출목록</NavLink></li>
            <li><NavLink to={'/reserve'} className={getNavLinkClass}>예약목록</NavLink></li>
        </ul>
        </div>
    );
}

export default Menu;