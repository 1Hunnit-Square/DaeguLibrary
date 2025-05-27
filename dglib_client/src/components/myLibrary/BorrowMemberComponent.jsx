import { useCallback, useMemo } from 'react';
import DynamicTab from "../../menus/DynamicTab";
import { useSearchParams } from "react-router-dom";
import BorrowMemberStateComponent from './BorrowMemberStateComponent';


const BorrowMemberComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const today = new Date();
    const aMonthAgo = new Date(today);
    aMonthAgo.setDate(today.getDate() - 30);


    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'borrownow' || tabParam === 'borrowpast')) ? tabParam : 'borrownow';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        if( tabId === 'borrowpast') {
            newParams.set("page", "1");
        }else {
            newParams.delete("page", "1");
        }
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
            id: 'borrownow',
            label: '대출현황',
            content: <BorrowMemberStateComponent />
        },
        {
        id: 'borrowpast',
        label: '대출이력',
        content: <div>바이</div>
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

export default BorrowMemberComponent;