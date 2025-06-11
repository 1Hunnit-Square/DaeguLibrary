import React, { useCallback, useMemo } from 'react';
import DynamicTab from "../../menus/DynamicTab";
import RegBookComponent from './RegBookComponent';
import { useSearchParams } from "react-router-dom";
import LibraryBookListComponent from './LibraryBookListComponent';
import WishBookListComponent from './WishBookListComponent';

const BookManagementComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const today = new Date();
    const aMonthAgo = new Date(today);
    aMonthAgo.setDate(today.getDate() - 30);


    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'booklist' || tabParam === 'regbook' || tabParam === 'wishbook')) ? tabParam : 'booklist';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        newParams.set("page", "1");
        if (tabId === 'booklist') {
            newParams.set("startDate", aMonthAgo.toLocaleDateString('fr-CA'));
            newParams.set("endDate", today.toLocaleDateString('fr-CA'));
            newParams.set("option", "도서명")
        }
        if (tabId === 'wishbook') {
            newParams.set("startDate", aMonthAgo.toLocaleDateString('fr-CA'));
            newParams.set("endDate", today.toLocaleDateString('fr-CA'));
            newParams.set("option", "회원ID")
        }
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
        id: 'booklist',
        label: '도서목록',
        content: <LibraryBookListComponent />
        },
        {
        id: 'regbook',
        label: '도서등록 및 수정',
        content: <RegBookComponent />
        },
        {
            id: 'wishbook',
            label: '희망도서',
            content: <WishBookListComponent />
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