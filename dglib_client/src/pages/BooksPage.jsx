import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import { useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const BooksPage = () => {

  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const location = useLocation();
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });


  const currentDate = new Date().toDateString();
  const getDateParams = useMemo(() => {
        const today = new Date();
        const aMonthAgo = new Date(today);
        aMonthAgo.setDate(today.getDate() - 30);

        const endDateStr = today.toLocaleDateString('fr-CA');
        const startDateStr = aMonthAgo.toLocaleDateString('fr-CA');

        return `startDate=${startDateStr}&endDate=${endDateStr}`;
    }, [currentDate]);




   const LSideMenu = useMemo(() => [
        { id: "search", label: "통합검색", path: "/books/search?tab=info&page=1" },
        { id: "newbook", label: "신착도서", path: `/books/new?page=1&${getDateParams}` },
        { id: "reco", label: "추천도서", path: "/books/recommend?genre=literature&page=1" },
        { id: "borrowbest", label: "대출베스트도서", path: "/books/top?check=오늘" },
        {id: "ebook", label: "EBOOK", path: "/books/ebook"}], [getDateParams]);

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
    <Layout LMainMenu={"도서정보"} LSideMenu={LSideMenu}>
      <SubHeader subTitle={activeMenuItem?.label} print={reactToPrintFn}  mainTitle="도서정보" />
      <div ref={contentRef}>
        <Outlet />
      </div>
      
    </Layout>
  );
}

export default BooksPage;