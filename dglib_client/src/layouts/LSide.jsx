import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const LSide = ({ LMainMenu, LSideMenu }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const location = useLocation();


    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
    };

   useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath.includes(LSideMenu[0].path)) {
            setActiveMenu(LSideMenu[0].id);
            return;
        }
        const currentMenuItem = LSideMenu.find(menu => currentPath.includes(menu.path));
        if (currentMenuItem) {
            setActiveMenu(currentMenuItem.id);
        } else {
            setActiveMenu(LSideMenu[0].id);
    }

    }, [location.pathname, LSideMenu]);



    return (
        <div className="w-72 p-5">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b-2 border-[#00893B]">
                    {LMainMenu}
                </h2>
            </div>
            <div className="space-y-2">
                {LSideMenu.map((menu) => (
                    <div
                        key={menu.id}
                        className={`
                            ${activeMenu === menu.id ?
                                'border border-[#00893B]' :
                                ''
                            }
                        `}
                    >
                        <NavLink
                            to={menu.path}
                            className={`
                                block py-3 text-gray-700 font-medium text-center
                                hover:bg-green-100 hover:text-[#00893B]
                                ${activeMenu === menu.id ? 'text-[#00893B]' : ''}
                            `}
                            onClick={() => handleMenuClick(menu.id)}
                        >
                            {menu.label}
                        </NavLink>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LSide;