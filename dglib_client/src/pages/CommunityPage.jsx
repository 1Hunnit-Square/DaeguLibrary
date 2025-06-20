import Layout from "../layouts/Layout"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo, useRef } from "react";
import SubHeader from "../layouts/SubHeader";
import { useReactToPrint } from "react-to-print";

const CommunityPage = () => {
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const location = useLocation();
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    const LSideMenu = useMemo(() => [
        { id: "notice", label: "공지사항", path: "/community/notice" },
        { id: "news", label: "새소식", path: "/community/event" },
        { id: "qna", label: "문의게시판", path: "/community/qna" },
        { id: "gallery", label: "도서관갤러리", path: "/community/gallery" },
        { id: "press", label: "보도자료", path: "/community/news" },
        { id: "donation", label: "도서기증", path: "/community/donation" },], [])

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
        <Layout LMainMenu={"시민참여"} LSideMenu={LSideMenu} >
            <SubHeader subTitle={activeMenuItem?.label} print={reactToPrintFn}  mainTitle="시민참여" />
            <div ref={contentRef}>
              <Outlet />
            </div>
        </Layout>
    )
}

export default CommunityPage;