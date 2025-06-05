import { useCallback, useMemo } from 'react';
import DynamicTab from "../../menus/DynamicTab";
import RegEbookComponent from './RegEbookComponent';
import { useSearchParams } from "react-router-dom";
import EbookListComponent from './EbookListComponent';

const EbookManagementComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const today = new Date();
    const aMonthAgo = new Date(today);
    aMonthAgo.setDate(today.getDate() - 30);


    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'ebooklist' || tabParam === 'regebook')) ? tabParam : 'booklist';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        newParams.set("page", "1");
        if (tabId === 'ebooklist') {
            newParams.set("startDate", aMonthAgo.toLocaleDateString('fr-CA'));
            newParams.set("endDate", today.toLocaleDateString('fr-CA'));
            newParams.set("option", "도서명")
        }

        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
        id: 'ebooklist',
        label: 'EBOOK 목록',
        content: <EbookListComponent />
        },
        {
        id: 'regebook',
        label: 'EBOOK 등록',
        content: <RegEbookComponent />
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

export default EbookManagementComponent;