import { useMemo, memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const LSide = ({ LMainMenu, LSideMenu }) => {
  const location = useLocation();

const activeMenu = useMemo(() => {
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  
    const fromParam = searchParams.get('from');
    if (fromParam) {
      return fromParam;
    }
  
  let bestMatch = null;
  let longestMatchLength = 0;

  LSideMenu.forEach(menu => {
    const menuBasePath = menu.path.split('?')[0];
    if (currentPath.startsWith(menuBasePath)) {
      if (menuBasePath.length > longestMatchLength) {
        longestMatchLength = menuBasePath.length;
        bestMatch = menu;
      }
    }
  });

  if (bestMatch) {
    return bestMatch.id;
  }
  return LSideMenu[0]?.id || null;
}, [location.pathname, location.search, LSideMenu]);

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