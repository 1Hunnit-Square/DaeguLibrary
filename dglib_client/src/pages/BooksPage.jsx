import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import DynamicTab from "../menus/DynamicTab";
import NomalSearchBookComponent from "../components/books/NomalSearchBookComponent";
import FilterSearchBookComponent from "../components/books/FilterSearchBookComponent";
import { useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import BookSearchComponent from "../components/books/BookSearchComponent";

const BooksPage = () => {
  const [searchURLParams, setSearchURLParams] = useSearchParams();
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const location = useLocation();

   useEffect(() => {
    if (!searchURLParams.has("tab")) {
      const newParams = new URLSearchParams(searchURLParams);
      newParams.set("tab", "info");
      setSearchURLParams(newParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentMenuItem = LSideMenu.find(menu => currentPath.includes(menu.path));
    if (currentMenuItem) {
      setActiveMenuItem(currentMenuItem);
    } else {
      setActiveMenuItem(LSideMenu[0]);
    }
  }, [location.pathname]);


   const LSideMenu = [
        { id: "search", label: "통합검색", path: "/books/search" },
        { id: "newbook", label: "신착도서", path: "/books/new" },
        { id: "reco", label: "추천도서", path: "/books/recombook" },
        { id: "borrowbest", label: "대출베스트도서", path: "/books/borrowbest" },]

  return (
    <Layout LMainMenu={"도서정보"} LSideMenu={LSideMenu}>
      <SubHeader subTitle={activeMenuItem?.label}  mainTitle="도서정보" />
      <Outlet />
    </Layout>
  );
}

export default BooksPage;