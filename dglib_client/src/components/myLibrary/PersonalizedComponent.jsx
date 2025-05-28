import { useCallback, useMemo } from 'react';
import DynamicTab from "../../menus/DynamicTab";
import { useSearchParams } from "react-router-dom";
import MyReadingComponent from './MyReadingComponent';
import BookSuggestionComponent from './BookSuggestionComponent';

const PersonalizedComponent = () => {
   const [searchURLParams, setSearchURLParams] = useSearchParams();

    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'myreading' || tabParam === 'booksuggestion')) ? tabParam : 'myreading';
    }, [searchURLParams]);

    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
            id: 'myreading',
            label: '나의 도서이용 성향',
            content: <MyReadingComponent />
        },
        {
            id: 'booksuggestion',
            label: '빅데이터 기반 추천 도서',
            content: <BookSuggestionComponent />
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

export default PersonalizedComponent;