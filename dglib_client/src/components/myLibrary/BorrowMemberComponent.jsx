import { useCallback, useMemo, useRef } from 'react';
import DynamicTab from "../../menus/DynamicTab";
import { useSearchParams } from "react-router-dom";
import BorrowMemberStateComponent from './BorrowMemberStateComponent';
import BorrowMemberHistoryComponent from './BorrowMemberHistoryComponent';


const BorrowMemberComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const year =  new Date().getFullYear();
    const componentTopRef = useRef(null);



    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'borrownow' || tabParam === 'borrowpast')) ? tabParam : 'borrownow';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        if( tabId === 'borrowpast') {
            newParams.set("page", "1");
            newParams.set("year", year.toString());
            newParams.set("month", "allmonth");
        }else {
            newParams.delete("page", "1");
        }
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs =  [
        {
            id: 'borrownow',
            label: '대출현황',
            content: <BorrowMemberStateComponent />
        },
        {
        id: 'borrowpast',
        label: '대출이력',
        content: <BorrowMemberHistoryComponent ref={componentTopRef} />
        },

    ];

    return (
        <div className="container mx-auto py-6" ref={componentTopRef}>
        <DynamicTab
            tabsConfig={myTabs}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
        />
        </div>
    );
    }

export default BorrowMemberComponent;