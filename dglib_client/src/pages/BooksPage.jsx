import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import { useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";

const BooksPage = () => {

  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const location = useLocation();

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
        { id: "reco", label: "추천도서", path: "/books/recommend" },
        { id: "borrowbest", label: "대출베스트도서", path: "/books/top" },], [getDateParams]);

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
    <Layout LMainMenu={"도서정보"} LSideMenu={LSideMenu}>
      <SubHeader subTitle={activeMenuItem?.label}  mainTitle="도서정보" />
      <Outlet />
    </Layout>
  );
}

export default BooksPage;