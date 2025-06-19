import DynamicTab from "../../menus/DynamicTab";
import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import ProgramBannerComponent from "./ProgarmBannerComponent";
import EventBannerComponent from "./EventBannerComponent";

const BannerManagementComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();


    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'program' || tabParam === 'event')) ? tabParam : 'program';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);

        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
        id: 'program',
        label: '이 달의 프로그램',
        content: <ProgramBannerComponent />
        },
        {
        id: 'event',
        label: '새소식',
        content: <EventBannerComponent />
        },
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
export default BannerManagementComponent;

