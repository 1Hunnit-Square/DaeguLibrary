import DynamicTab from "../../menus/DynamicTab";
import NomalSearchBookComponent from "./NomalSearchBookComponent";
import FilterSearchBookComponent from "./FilterSearchBookComponent";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";


const BookSearchComponent = () => {
  const [searchURLParams, setSearchURLParams] = useSearchParams();


  const activeTab = useMemo(() => {
    const tabParam = searchURLParams.get("tab");
    return (tabParam && (tabParam === 'info' || tabParam === 'settings')) ? tabParam : 'info';
  }, [searchURLParams]);


  const handleTabChange = useCallback((tabId) => {
    const newParams = new URLSearchParams();
    newParams.set("tab", tabId);
    newParams.set("page", "1");
    setSearchURLParams(newParams);
  }, [searchURLParams, setSearchURLParams]);

  const myTabs = useMemo(() => [
    {
      id: 'info',
      label: '일반검색',
      content: <NomalSearchBookComponent />
    },
    {
      id: 'settings',
      label: '상세검색',
      content: <FilterSearchBookComponent />
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

export default BookSearchComponent;