import React, { useCallback, useMemo } from 'react';
import DynamicTab from "../menus/DynamicTab";
import { useSearchParams } from "react-router-dom";
import Layout from '../layouts/Layout';
import FindIdComponent from '../components/member/FindIdComponent';
import SubHeader from '../layouts/SubHeader';
import FindPwComponent from '../components/member/FindPwComponent';

const FindAccountPage = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();

    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'id' || tabParam === 'pw')) ? tabParam : 'id';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);
        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
        id: 'id',
        label: '아이디찾기',
        content: <FindIdComponent />
        },
        {
        id: 'pw',
        label: '비밀번호찾기',
        content: <FindPwComponent />
        },
    ], []);

    return (
         <Layout sideOn={false}>
            <SubHeader subTitle="계정 찾기" mainTitle="기타" />
        <div className="container mx-auto py-6">
        <DynamicTab
            tabsConfig={myTabs}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
        />
        </div>
        </Layout>
    );
    }
export default FindAccountPage;