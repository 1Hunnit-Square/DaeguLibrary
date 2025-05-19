import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo } from "react";
import SubHeader from "../layouts/SubHeader";

const ReservationPage = () => {
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const location = useLocation();

    const LSideMenu = useMemo(() => [
        { id: "bookrequest", label: "희망도서 신청", path: "/reservation/bookrequest" },
        { id: "program", label: "프로그램 신청", path: "/reservation/program" },
        { id: "facility", label: "시설 이용 신청", path: "/reservation/facility" }], []);

    useEffect(() => {
        const currentPath = location.pathname;

        const currentMenuItem = LSideMenu.find(menu => currentPath.includes(menu.path));
        if (currentMenuItem) {
          setActiveMenuItem(currentMenuItem);
        } else {
          setActiveMenuItem(LSideMenu[0]);
        }
      }, [location.pathname]);



    return (
        <Layout LMainMenu={"신청 및 예약"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label}  mainTitle="신청 및 예약" />
            <Outlet />
        </Layout>
    )
}

export default ReservationPage;