import React, { useCallback, useMemo } from 'react';
import DynamicTab from "../../menus/DynamicTab";
import RegBookComponent from './RegBookComponent';
import { useSearchParams } from "react-router-dom";

const BookManagementComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();


    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'booklist' || tabParam === 'regbook')) ? tabParam : 'booklist';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        newParams.set("page", "1");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
        id: 'booklist',
        label: '도서목록',
        content: <div>하이</div>
        },
        {
        id: 'regbook',
        label: '도서추가',
        content: <RegBookComponent />
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
export default BookManagementComponent;