import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react";
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


    const LSideMenu = [
        { id: "regBook", label: "도서등록", path: "/admin/regbook" },
        { id: "organization", label: "조직 및 현황", path: "/about/organization" },
        { id: "policy", label: "도서관 정책", path: "/about/policy" },
        { id: "location", label: "오시는길", path: "/about/location" },]
    return (
        <Layout LMainMenu={"도서관소개"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label}  mainTitle="도서관 소개" />
            <Outlet />
        </Layout>
    )
}

export default AdminPage;