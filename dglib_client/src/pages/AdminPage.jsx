import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo } from "react";
import SubHeader from "../layouts/SubHeader";


const AdminPage = () => {
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
        { id: "regBook", label: "도서관리", path: "/admin/bookmanagement?tab=booklist&page=1" },
        { id: "borrow", label: "대출예약관리", path: "/admin/borrow?tab=borrow&page=1" },], [])
    return (
        <Layout LMainMenu={"관리자"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label}  mainTitle="관리자" />
            <Outlet />
        </Layout>
    )
}

export default AdminPage;