import { useCallback, useMemo } from 'react';
import DynamicTab from "../../menus/DynamicTab";
import { useSearchParams } from "react-router-dom";
import BorrowBookListComponent from './BorrowBookListComponent';
import ReservationBookListComponent from './ReservationBookListComponent';
import BorrowBookComponent from './BorrowBookComponent';

const BorrowComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();


    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'borrow' || tabParam === 'reservation' || tabParam === 'borrowlist')) ? tabParam : 'borrow';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        newParams.set("page", "1");
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
            id: 'borrow',
            label: '도서대출',
            content: <BorrowBookComponent />
        },
        {
        id: 'borrowlist',
        label: '대출관리',
        content: <BorrowBookListComponent />
        },
        {
        id: 'reservation',
        label: '예약관리',
        content: <ReservationBookListComponent />
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

export default BorrowComponent;