import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo } from "react";
import SubHeader from "../layouts/SubHeader";


const UsagePage = () => {
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const location = useLocation();

     const LSideMenu = useMemo(() =>[
        { id: "readingroom", label: "자료실 이용", path: "/usage/readingroom" },
        { id: "membership", label: "회원가입 안내", path: "/usage/membership" },
        { id: "borrowreturn", label: "도서 대출 및 반납", path: "/usage/borrowreturn" },
        { id: "eventcalendar", label: "이달의 행사 일정", path: "/usage/eventcalendar" },], [])


     useEffect(() => {
      const currentPath = location.pathname;
      const currentMenuItem = LSideMenu.find(menu => {
        const menuBasePath = menu.path.split('?')[0];
        return currentPath.includes(menuBasePath);
      });
      if (currentMenuItem) {
        setActiveMenuItem(currentMenuItem);
      } else {
        setActiveMenuItem(LSideMenu[0]);
      }
    }, [location.pathname, LSideMenu]);


    return (
         <Layout LMainMenu={"도서관 이용"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label}  mainTitle="도서관 이용" />
            <Outlet />
        </Layout>
    );
}

export default UsagePage;