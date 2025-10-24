// src/components/SlidingTabsNav.jsx
// ✅ MOBILE OPTIMIZED - Icone perfettamente centrate

import React from 'react';

const gridColsMap = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
  4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6',
  7: 'grid-cols-7',
};

const SlidingTabsNav = ({ activeTab, onTabChange, tabs, variant = 'dark' }) => {
  const totalTabs = tabs.length;
  const getActiveIndex = () => tabs.findIndex((tab) => tab.value === activeTab);
  const activeIndex = getActiveIndex();
  const percentageWidth = 100 / totalTabs;
  const gridClass = gridColsMap[totalTabs] || 'grid-cols-1';

  const variants = {
    dark: {
      containerClasses: 'bg-white-glass border-input-gray',
      sliderClass: 'bg-blue',
      textSelectedClass: 'text-white',
      textIdleClass: 'text-light-gray',
      textIdleHoverClass: 'hover:text-white',
    },
    light: {
      containerClasses: 'bg-white-glass border-input-gray',
      sliderClass: 'bg-blue',
      textSelectedClass: 'text-white',
      textIdleClass: 'text-dark-gray',
      textIdleHoverClass: 'hover:text-antracite',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`relative w-full p-[0.25rem] h-[3.5rem] grid ${gridClass} border ${currentVariant.containerClasses}`}
      style={{ borderRadius: '1.75rem' }}
    >
      {/* Slider - nascosto su mobile, visibile su desktop */}
      <div
        className={`hidden sm:block absolute top-[0.25rem] bottom-[0.25rem] rounded-full transition-all duration-300 ease-in-out ${currentVariant.sliderClass}`}
        style={{
          opacity: activeIndex === -1 ? 0 : 1,
          left: `calc(${activeIndex * percentageWidth}% + 0.25rem)`,
          width: `calc(${percentageWidth}% - 0.5rem)`,
        }}
      />
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            type="button"
            aria-label={tab.title || tab.label}
            className={`relative z-10 cursor-pointer transition-colors duration-300 ease-in-out font-medium flex items-center justify-center gap-[0.5rem] text-sm sm:text-base ${
              isSelected
                ? currentVariant.textSelectedClass
                : `${currentVariant.textIdleClass} ${currentVariant.textIdleHoverClass}`
            }`}
          >
            {/* Icona: blu su mobile quando selezionata, bianca su desktop quando selezionata */}
            <Icon className={`w-[1.25rem] h-[1.25rem] flex-shrink-0 transition-colors duration-300 ${
              isSelected ? 'text-blue sm:text-white' : ''
            }`} />
            <span className="hidden sm:inline truncate">{tab.title || tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SlidingTabsNav;
