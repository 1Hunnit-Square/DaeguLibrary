import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo  } from "react";
import SubHeader from "../layouts/SubHeader";


const AboutPage = () => {
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const location = useLocation();

    const LSideMenu = useMemo(() => [
        { id: "greeting", label: "인사말", path: "/about/greeting" },
        { id: "organization", label: "조직 및 현황", path: "/about/organization" },
        { id: "policy", label: "도서관 정책", path: "/about/policy" },
        { id: "location", label: "오시는길", path: "/about/location" },
    ], []);

    useEffect(() => {
        const currentPath = location.pathname;

        const currentMenuItem = LSideMenu.find(menu => currentPath.includes(menu.path));
        if (currentMenuItem) {
          setActiveMenuItem(currentMenuItem);
        } else {
          setActiveMenuItem(LSideMenu[0]);
        }
      }, [location.pathname, LSideMenu]);



    return (
        <Layout LMainMenu={"도서관소개"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label}  mainTitle="도서관 소개" />
            <Outlet />
        </Layout>
    )
}

export default AboutPage;