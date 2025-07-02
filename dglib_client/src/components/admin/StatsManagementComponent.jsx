import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import DynamicTab from "../../menus/DynamicTab";
import BorrowStatsComponent from "./BorrowStatsComponent";
import MemberStatsComponent from "./MemberStatsComponent";
import MetricsComponent from "./MetricsComponent";

const StatsManagementComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const today = new Date();
    const aMonthAgo = new Date(today);
    aMonthAgo.setDate(today.getDate() - 30);



    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'borrow' || tabParam === 'member' || tabParam == 'metrics')) ? tabParam : 'borrow';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        if(tabId === 'borrow') {
            
            newParams.set("startDate", aMonthAgo.toLocaleDateString('fr-CA'));
            newParams.set("endDate", today.toLocaleDateString('fr-CA'));
        }

        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
        id: 'borrow',
        label: '최다 대출도서',
        content: <BorrowStatsComponent />
        },
        {
        id: 'member',
        label: '회원 통계',
        content: <MemberStatsComponent />
        },
         {
        id: 'metrics',
        label: '시스템 통계',
        content: <MetricsComponent />
        }
    ], []);

    return (
        <div className="container mx-auto py-6">
        <DynamicTab
            tabsConfig={myTabs}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
        />
        </div>
    );


}


export default StatsManagementComponent;