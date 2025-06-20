import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo, useRef } from "react";
import SubHeader from "../layouts/SubHeader";
import { useReactToPrint } from "react-to-print";
import { useLogin } from "../hooks/useLogin";

const MyLibraryPage = () => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

    const LSideMenu = useMemo(() => [
        { id: "borrowstatus", label: "대출관리", path: "/mylibrary/borrowstatus" },
        { id: "bookreservation", label: "도서예약", path: "/mylibrary/bookreservation" },
        { id: "interested", label: "관심도서", path: "/mylibrary/interested?page=1&option=전체" },
        { id: "request", label: "희망도서", path: `/mylibrary/request?year=${currentYear}` },
        { id: "myebook", label: "내 EBOOK", path: "/mylibrary/myebook?page=1&option=전체" },
        { id: "program", label: "프로그램 신청 내역", path: "/mylibrary/useprogram" },
        { id: "usedfacility", label: "시설이용 신청 내역", path: "/mylibrary/usedfacility" },
        { id: "personalized", label: "맞춤 정보", path: "/mylibrary/personalized" },
        ], [] )

    useEffect(() => {
      const currentPath = location.pathname;
      const searchParams = new URLSearchParams(location.search);
      console.log("🔍 Current Path:", currentPath)
      console.log("🔍 Search Params:", searchParams.toString());

  
        const fromParam = searchParams.get('from');
        if (fromParam) {
          
          const menuItem = LSideMenu.find(menu => menu.id === fromParam);
          console.log("✅ Setting activeMenuItem from fromParam:", menuItem); 
          if (menuItem) {
            setActiveMenuItem(menuItem);
            return;
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
    }, [location, LSideMenu]);





    return (
        <Layout LMainMenu={"내서재"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label} print={reactToPrintFn}  mainTitle="내서재" />
            <div ref={contentRef}>
              <Outlet />
            </div>
        </Layout>
    )
}

export default MyLibraryPage;