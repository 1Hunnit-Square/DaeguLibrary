import { useMemo, memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const LSide = ({ LMainMenu, LSideMenu }) => {
  const location = useLocation();

  const activeMenu = useMemo(() => {
    const currentPath = location.pathname;
    const currentMenuItem = LSideMenu.find(menu => {
      const menuBasePath = menu.path.split('?')[0];
      return currentPath === menuBasePath;
    });
    if (currentMenuItem) {
      return currentMenuItem.id;
    }
    return LSideMenu[0]?.id || null;
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
            className={
              activeMenu === menu.id ? 'border border-[#00893B]' : ''
            }
          >
            <NavLink
              to={menu.path}
              className={`
                block py-3 text-gray-700 font-medium text-center
                hover:bg-green-100 hover:text-[#00893B]
                ${activeMenu === menu.id ? 'text-[#00893B]' : ''}
              `}
              // handleMenuClick 함수를 제거하고 NavLink의 기본 동작만 사용
            >
              {menu.label}
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(LSide);