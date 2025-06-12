import DynamicTab from "../../menus/DynamicTab";
import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import NormalBoardComponent from "./NormalBoardComponent";
import QnaComponent from "./QnaComponent";

const BoardManagementComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();


    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'board' || tabParam === 'qna')) ? tabParam : 'board';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);

        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
        id: 'board',
        label: '기본 게시판',
        content: <NormalBoardComponent />
        },
        {
        id: 'qna',
        label: 'QnA',
        content: <QnaComponent />
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
export default BoardManagementComponent;

