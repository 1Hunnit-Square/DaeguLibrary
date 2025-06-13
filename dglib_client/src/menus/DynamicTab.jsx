import { useMemo, memo } from 'react';

const DynamicTab = ({ tabsConfig, activeTabId, onTabChange }) => {

  const activeTabIndex = useMemo(() => {
    if (activeTabId && tabsConfig.length > 0) {
      const index = tabsConfig.findIndex(tab => tab.id === activeTabId);
      return index !== -1 ? index : 0;
    }
    return Array.isArray(tabsConfig) && tabsConfig.length > 0 ? 0 : -1;
  }, [activeTabId, tabsConfig]);

  const lastTabIndex = tabsConfig.length - 1;

  const handleTabClick = (index) => {
    if (onTabChange && tabsConfig[index]) {
      onTabChange(tabsConfig[index].id);
    }
  };

  return (
    <div className="mx-auto w-full mt-10 bg-white">
      <div className="flex mx-auto w-[90%] bg-gray-50 overflow-hidden ">
        {tabsConfig.map((tab, index) => {
          let borderClass = '';

          if (lastTabIndex <= 1) {
            if (index === 0) {
              borderClass = 'border-r border-t border-[#00893B]';
            } else {
              borderClass = 'border-l border-t border-[#00893B]';
            }
          } else {
            if (index === 0) {
              borderClass = 'border-r border-t border-[#00893B]';
            } else if (index === lastTabIndex) {
              borderClass = 'border-l border-t border-[#00893B]';
            } else {
              borderClass = 'border-l border-t border-r border-[#00893B]';
            }
          }

          return (
            <button
              key={tab.id || `tab-${index}`}
              className={`
                flex-1 py-3 px-2 sm:px-4 text-center font-semibold text-sm sm:text-base
                ease-in-out relative focus:outline-none active:outline-none
                ${
                  activeTabIndex === index
                    ? `bg-white text-[#00893B] ${borderClass} shadow-sm`
                    : `bg-gray-100 text-gray-500 hover:text-[#00893B] hover:bg-gray-50 border border-gray-200`
                }
              `}
              onClick={() => handleTabClick(index)}
            >
              {tab.label}
              
            </button>
          );
        })}
      </div>

      <div className="p-5 pt-10 w-full">
        {activeTabIndex >= 0 && tabsConfig[activeTabIndex] && (
          typeof tabsConfig[activeTabIndex].content === 'function'
            ? tabsConfig[activeTabIndex].content()
            : tabsConfig[activeTabIndex].content
        )}
      </div>
    </div>
  );
};

export default memo(DynamicTab);