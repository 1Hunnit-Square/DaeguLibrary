import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import { useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";

const BooksPage = () => {

  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const currentMenuItem = LSideMenu.find(menu => currentPath.includes(menu.path));
    if (currentMenuItem) {
      setActiveMenuItem(currentMenuItem);
    } else {
      setActiveMenuItem(LSideMenu[0]);
    }
  }, [location.pathname]);


   const LSideMenu = useMemo(() => [
        { id: "search", label: "통합검색", path: "/books/search?tab=info&page=1" },
        { id: "newbook", label: "신착도서", path: "/books/new" },
        { id: "reco", label: "추천도서", path: "/books/recommend" },
        { id: "borrowbest", label: "대출베스트도서", path: "/books/top" },], []);

  return (
    <Layout LMainMenu={"도서정보"} LSideMenu={LSideMenu}>
      <SubHeader subTitle={activeMenuItem?.label}  mainTitle="도서정보" />
      <Outlet />
    </Layout>
  );
}

export default BooksPage;