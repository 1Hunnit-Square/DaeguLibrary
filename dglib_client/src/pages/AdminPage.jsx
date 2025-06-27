import Layout from "../layouts/Layout"
import { Outlet, useLocation, useSearchParams } from "react-router-dom"
import { useEffect, useState, useMemo, useRef } from "react";
import SubHeader from "../layouts/SubHeader";
import { useReactToPrint } from "react-to-print";
import { memberRoleSelector } from "../atoms/loginState";
import { useRecoilValue } from "recoil";


const AdminPage = () => {
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const location = useLocation();
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });
    const role = useRecoilValue(memberRoleSelector);


    const currentDate = new Date().toDateString();
    const getDateParams = useMemo(() => {
        const today = new Date();
        const aMonthAgo = new Date(today);
        aMonthAgo.setDate(today.getDate() - 30);

        const endDateStr = today.toLocaleDateString('fr-CA');
        const startDateStr = aMonthAgo.toLocaleDateString('fr-CA');

        return `startDate=${startDateStr}&endDate=${endDateStr}`;
    }, [currentDate]);

    const LSideMenu = useMemo(() => {
      const menu = [
          { id: "regBook", label: "도서관리", path: `/admin/bookmanagement?tab=booklist&page=1&option=도서명&${getDateParams}` },
          { id: "ebook", label: "EBOOK 관리", path: `/admin/ebookmanagement?tab=ebooklist&page=1&option=도서명&${getDateParams}` },
          { id: "borrow", label: "대출예약관리", path: "/admin/borrow?tab=borrow&page=1" },
      ];
  
      if (role === "ADMIN") {
          menu.push(
              { id: "member", label: "회원관리", path: "/admin/membermanagement?page=1" },
              { id: "calendar", label: "이달의 행사 관리", path: "/admin/calendarmanagement" },
              { id: "progplace", label: "프로그램 · 시설 관리", path: "/admin/progmanagement" },
              { id: "banner", label: "배너관리", path: "/admin/bannermanagement" },
              { id: "service", label: "게시판관리", path: "/admin/boardmanagement" },
              { id: "messenger", label: "메신저관리", path: "/admin/messengermanagement" },
              { id: "stats", label: "통계관리", path: `/admin/statsmanagement?${getDateParams}` }
          );
      }
  
      return menu;
  }, [getDateParams, role]);

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
            <SubHeader subTitle={activeMenuItem?.label} print={reactToPrintFn} mainTitle="관리자" />
            <div ref={contentRef}>
              <Outlet />
            </div>
        </Layout>
    )
}

export default AdminPage;