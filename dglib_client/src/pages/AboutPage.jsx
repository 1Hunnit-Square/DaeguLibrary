import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo, useRef  } from "react";
import SubHeader from "../layouts/SubHeader";
import { useReactToPrint } from "react-to-print";


const AboutPage = () => {
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const location = useLocation();
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    const LSideMenu = useMemo(() => [
        { id: "greeting", label: "인사말", path: "/about/greeting" },
        { id: "organization", label: "조직 및 현황", path: "/about/organization" },
        { id: "policy", label: "도서관 정책", path: "/about/policy" },
        { id: "location", label: "오시는길", path: "/about/location" },
    ], []);

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
        <Layout LMainMenu={"도서관소개"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label} print={reactToPrintFn}  mainTitle="도서관 소개" />
            <div ref={contentRef}>
              <Outlet />
            </div>
        </Layout>
    )
}

export default AboutPage;