import DynamicTab from "../../menus/DynamicTab";
import NomalSearchBookComponent from "./NomalSearchBookComponent";
import FilterSearchBookComponent from "./FilterSearchBookComponent";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";


const BookSearchComponent = () => {
  const [searchURLParams, setSearchURLParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!searchURLParams.has("tab")) {
      const newParams = new URLSearchParams(searchURLParams);
      newParams.set("tab", "info");
      setSearchURLParams(newParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    const tabParam = searchURLParams.get("tab");
    if (tabParam && (tabParam === 'info' || tabParam === 'settings')) {
      setActiveTab(tabParam);
    }
  }, [searchURLParams]);


  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const newParams = new URLSearchParams();
    newParams.set("tab", tabId);
    newParams.set("page", "1");
    setSearchURLParams(newParams);
  };

  const myTabs = [
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
  ];


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