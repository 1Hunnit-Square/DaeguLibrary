import React, { useState } from 'react';

const DynamicTab = ({ tabsConfig }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(
    Array.isArray(tabsConfig) && tabsConfig.length > 0 ? 0 : -1
  );
  const lastTabIndex = tabsConfig.length - 1;

  return (
    <div className="mx-auto w-[90%] mt-10 bg-white">
      <div className="flex">
        {tabsConfig.map((tab, index) => {
          let borderClass = '';


          if (lastTabIndex <= 1) {

            if (index === 0) {
              borderClass = 'border-r border-t border-black';
            }

            else {
              borderClass = 'border-l border-t border-black';
            }
          }

          else {
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
              onClick={() => setActiveTabIndex(index)}
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
        aria-labelledby={`tab-${tabsConfig[activeTabIndex].id || activeTabIndex}`}
        id={`tabpanel-${tabsConfig[activeTabIndex].id || activeTabIndex}`}
      >
        {typeof tabsConfig[activeTabIndex].content === 'function'
          ? tabsConfig[activeTabIndex].content()
          : tabsConfig[activeTabIndex].content
        }
      </div>
    </div>
  );
};

export default DynamicTab;