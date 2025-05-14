import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import DynamicTab from "../menus/DynamicTab";
import NomalSearchBookComponent from "../components/books/NomalSearchBookComponent";
import FilterSearchBookComponent from "../components/books/FilterSearchBookComponent";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const BooksSearch = () => {
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
    <Layout>
      <SubHeader subTitle="통합검색" mainTitle="도서정보" />
      <DynamicTab
        tabsConfig={myTabs}
        activeTabId={activeTab}
        onTabChange={handleTabChange}
      />
    </Layout>
  );
}

export default BooksSearch;