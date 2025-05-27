import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo } from "react";
import SubHeader from "../layouts/SubHeader";

const MyLibraryPage = () => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const location = useLocation();

    const LSideMenu = useMemo(() => [
        { id: "borrowstatus", label: "대출관리", path: "/mylibrary/borrowstatus" },
        { id: "bookreservation", label: "도서예약", path: "/mylibrary/bookreservation" },
        { id: "interested", label: "관심도서", path: "/mylibrary/interested?page=1&option=전체" },
        { id: "request", label: "희망도서", path: "/mylibrary/request" },
        { id: "program", label: "프로그램 신청 내역", path: "/mylibrary/useprogram" },
        { id: "usedfacility", label: "이용 신청 내역", path: "/mylibrary/usedfacility" },
        { id: "personalized", label: "맞춤 정보", path: "/mylibrary/personalized" }], [] )

    useEffect(() => {
      const currentPath = location.pathname;
      const searchParams = new URLSearchParams(location.search);

      if (currentPath.includes('/detail/')) {
        const fromParam = searchParams.get('from');
        if (fromParam) {
          const menuItem = LSideMenu.find(menu => menu.id === fromParam);
          if (menuItem) {
            setActiveMenuItem(menuItem);
            return;
          }
        }
      }
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
        <Layout LMainMenu={"내서재"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label}  mainTitle="내서재" />
            <Outlet />
        </Layout>
    )
}

export default MyLibraryPage;