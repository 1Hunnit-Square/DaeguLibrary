import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import DynamicTab from "../../menus/DynamicTab";
import EmailManagementComponent from "./EmailManagementComponent";
import SmsManagementComponent from "./SmsManagementComponent";


const MessengerComponent = ()=> {
    
    const [searchURLParams, setSearchURLParams] = useSearchParams();


    const activeTab = useMemo(() => {
        const tabParam = searchURLParams.get("tab");
        return (tabParam && (tabParam === 'sms' || tabParam === 'email')) ? tabParam : 'email';
    }, [searchURLParams]);


    const handleTabChange = useCallback((tabId) => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabId);

        setSearchURLParams(newParams);
    }, [searchURLParams, setSearchURLParams]);

    const myTabs = useMemo(() => [
        {
        id: 'email',
        label: '메일 관리',
        content: <EmailManagementComponent />
        },
        {
        id: 'sms',
        label: 'SMS 관리',
        content: <SmsManagementComponent />
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

export default MessengerComponent;