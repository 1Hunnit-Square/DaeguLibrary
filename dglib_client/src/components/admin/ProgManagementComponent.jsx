import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DynamicTab from "../../menus/DynamicTab";
import ProgamAdminComponent from './ProgramAdminComponent';
import PlaceAdminComponent from './PlaceAdminComponent';

const ProgManagementComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 현재 탭 설정 (기본: program)
    const activeTab = useMemo(() => {
        const tabParam = searchParams.get("tab");
        return (tabParam === 'program' || tabParam === 'place') ? tabParam : 'program';
    }, [searchParams]);

    // 탭 전환 핸들러
    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        setSearchParams(newParams);
    }, [setSearchParams]);

    // 탭 목록 설정
    const myTabs = useMemo(() => [
        {
            id: 'program',
            label: '프로그램 관리',
            content: <ProgamAdminComponent />
        },
        {
            id: 'place',
            label: '시설대여 관리',
            content: <PlaceAdminComponent />
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
};

export default ProgManagementComponent;