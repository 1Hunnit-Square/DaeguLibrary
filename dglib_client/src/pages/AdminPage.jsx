import Layout from "../layouts/Layout"
import { Outlet, useLocation, useSearchParams } from "react-router-dom"
import { useEffect, useState, useMemo } from "react";
import SubHeader from "../layouts/SubHeader";


const AdminPage = () => {
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const location = useLocation();

    const getDateParams = useMemo(() => {
        const today = new Date();
        const aMonthAgo = new Date(today);
        aMonthAgo.setDate(today.getDate() - 30);

        const endDateStr = today.toLocaleDateString('fr-CA');
        const startDateStr = aMonthAgo.toLocaleDateString('fr-CA');

        return `startDate=${startDateStr}&endDate=${endDateStr}`;
    }, []);

    const LSideMenu = useMemo(() => [
        { id: "regBook", label: "도서관리", path: `/admin/bookmanagement?tab=booklist&page=1&${getDateParams}` },
        { id: "borrow", label: "대출예약관리", path: "/admin/borrow?tab=borrow&page=1" },
        { id: "member", label: "회원관리", path: "/admin/membermanagement?page=1" }], [getDateParams])
        
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
        <Layout LMainMenu={"관리자"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label}  mainTitle="관리자" />
            <Outlet />
        </Layout>
    )
}

export default AdminPage;