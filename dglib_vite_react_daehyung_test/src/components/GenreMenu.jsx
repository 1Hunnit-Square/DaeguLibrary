import { NavLink } from "react-router-dom";

const GenreMenu = () => {

    const getNavLinkClass = ({ isActive }) => {
        return isActive
            ? "text-blue-600 font-bold underline"
            : "text-gray-700 hover:text-blue-500";
    };

    return (
        <div className="border-b border-gray-300 p-4 mb-4">
            <ul className="flex space-x-6 justify-center">
                <li><NavLink to={'/genre/literature'} className={getNavLinkClass}>문학</NavLink></li>
                <li><NavLink to={'/genre/philosophy'} className={getNavLinkClass}>철학</NavLink></li>
                <li><NavLink to={'/genre/religion'} className={getNavLinkClass}>종교</NavLink></li>
                <li><NavLink to={'/genre/history'} className={getNavLinkClass}>역사</NavLink></li>
                <li><NavLink to={'/genre/language'} className={getNavLinkClass}>언어</NavLink></li>
                <li><NavLink to={'/genre/art'} className={getNavLinkClass}>예술</NavLink></li>
                <li><NavLink to={'/genre/social-sciences'} className={getNavLinkClass}>사회과학</NavLink></li>
                <li><NavLink to={'/genre/natural-sciences'} className={getNavLinkClass}>자연과학</NavLink></li>
                <li><NavLink to={'/genre/technology'} className={getNavLinkClass}>기술과학</NavLink></li>
            </ul>
        </div>
    );
}

export default GenreMenu;