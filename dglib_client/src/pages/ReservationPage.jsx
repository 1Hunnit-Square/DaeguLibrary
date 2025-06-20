import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo, useRef } from "react";
import SubHeader from "../layouts/SubHeader";
import { useReactToPrint } from "react-to-print";

const ReservationPage = () => {
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const location = useLocation();
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });


    const LSideMenu = useMemo(() => [
        { id: "bookrequest", label: "희망도서 신청", path: "/reservation/bookrequest" },
        { id: "program", label: "프로그램 신청", path: "/reservation/program" },
        { id: "facility", label: "시설이용 신청", path: "/reservation/facility" }], []);

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
        <Layout LMainMenu={"신청 및 예약"} LSideMenu={LSideMenu} print={reactToPrintFn}>
            <SubHeader subTitle={activeMenuItem?.label}  mainTitle="신청 및 예약" />
            <div ref={contentRef}>
              <Outlet />
            </div>
        </Layout>
    )
}

export default ReservationPage;