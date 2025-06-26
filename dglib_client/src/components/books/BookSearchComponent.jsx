import DynamicTab from "../../menus/DynamicTab";
import NomalSearchBookComponent from "./NomalSearchBookComponent";
import FilterSearchBookComponent from "./FilterSearchBookComponent";
import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback, useRef } from "react";


const BookSearchComponent = () => {
  const [searchURLParams, setSearchURLParams] = useSearchParams();
  const componentTopRef = useRef(null);


  const activeTab = useMemo(() => {
    const tabParam = searchURLParams.get("tab");
    return (tabParam && (tabParam === 'info' || tabParam === 'settings')) ? tabParam : 'info';
  }, [searchURLParams]);


  const handleTabChange = useCallback((tabId) => {
    const newParams = new URLSearchParams();
    newParams.set("tab", tabId);
    newParams.set("page", "1");
    if(tabId === 'settings') {
      newParams.set("sortBy", "bookTitle");
      newParams.set("orderBy", "desc");
    }
    setSearchURLParams(newParams);
  }, [searchURLParams, setSearchURLParams]);

  const myTabs = [
    {
      id: 'info',
      label: '일반검색',
      content: <NomalSearchBookComponent ref={componentTopRef} />
    },
    {
      id: 'settings',
      label: '상세검색',
      content: <FilterSearchBookComponent ref={componentTopRef} />
    }
  ];

  return (
    <div className="container mx-auto py-6" ref={componentTopRef}>
      <DynamicTab
        tabsConfig={myTabs}
        activeTabId={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}

export default BookSearchComponent;