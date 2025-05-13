import React, { useState, useEffect } from 'react';

const DynamicTab = ({ tabsConfig, activeTabId, onTabChange }) => {
  const findActiveIndex = () => {
    if (activeTabId && tabsConfig.length > 0) {
      const index = tabsConfig.findIndex(tab => tab.id === activeTabId);
      return index !== -1 ? index : 0;
    }
    return Array.isArray(tabsConfig) && tabsConfig.length > 0 ? 0 : -1;
  };

  const [activeTabIndex, setActiveTabIndex] = useState(findActiveIndex);
  const lastTabIndex = tabsConfig.length - 1;


  useEffect(() => {
    const newIndex = findActiveIndex();
    if (newIndex !== activeTabIndex) {
      setActiveTabIndex(newIndex);
    }
  }, [activeTabId, tabsConfig]);


  const handleTabClick = (index) => {
    setActiveTabIndex(index);
    if (onTabChange && tabsConfig[index]) {
      onTabChange(tabsConfig[index].id);
    }
  };

  return (
    <div className="mx-auto w-[90%] mt-10 bg-white">
      <div className="flex">
        {tabsConfig.map((tab, index) => {
          let borderClass = '';

          if (lastTabIndex <= 1) {
            if (index === 0) {
              borderClass = 'border-r border-t border-black';
            } else {
              borderClass = 'border-l border-t border-black';
            }
          } else {
            if (index === 0) {
              borderClass = 'border-r border-t border-black';
            } else if (index === lastTabIndex) {
              borderClass = 'border-l border-t border-black';
            } else {
              borderClass = 'border-l border-t border-r border-black';
            }
          }

          return (
            <button
              key={tab.id || `tab-${index}`}
              className={`
                flex-1 py-3 px-2 sm:px-4 text-center font-medium text-sm
                transition-colors duration-150 ease-in-out
                ${
                  activeTabIndex === index
                    ? `bg-white ${borderClass}`
                    : `bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-white border border-gray-300`
                }
              `}
              onClick={() => handleTabClick(index)}
              role="tab"
              aria-selected={activeTabIndex === index}
              aria-controls={`tabpanel-${tab.id || index}`}
              id={`tab-${tab.id || index}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="p-5 pt-10 flex justify-center"
        role="tabpanel"
        aria-labelledby={`tab-${tabsConfig[activeTabIndex]?.id || activeTabIndex}`}
        id={`tabpanel-${tabsConfig[activeTabIndex]?.id || activeTabIndex}`}
      >
        {activeTabIndex >= 0 && tabsConfig[activeTabIndex] && (
          typeof tabsConfig[activeTabIndex].content === 'function'
            ? tabsConfig[activeTabIndex].content()
            : tabsConfig[activeTabIndex].content
        )}
      </div>
    </div>
  );
};

export default DynamicTab;