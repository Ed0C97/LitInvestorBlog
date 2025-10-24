// src/components/ui/FilterPanel.jsx
// ✅ MOBILE OPTIMIZED

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import FilterLink from './ui/FilterLink';

const FilterPanel = ({
  filterOptions,
  activeFilters,
  onFilterChange,
  onClearFilters
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isFilterContentVisible, setIsFilterContentVisible] = useState(false);

  const toggleFilters = () => {
    if (isFilterPanelOpen) {
      setIsFilterContentVisible(false);
      setTimeout(() => setIsFilterPanelOpen(false), 300);
    } else {
      setIsFilterPanelOpen(true);
      requestAnimationFrame(() => {
        setTimeout(() => setIsFilterContentVisible(true), 50);
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFilterPanelOpen) {
        toggleFilters();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFilterPanelOpen]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getActiveFilterLabels = () => {
    const labels = [];
    if (activeFilters.category) {
      const cat = filterOptions.categories.find((c) => c.value === activeFilters.category);
      if (cat) labels.push(cat.label);
    }
    if (activeFilters.year) labels.push(activeFilters.year);
    if (activeFilters.month && activeFilters.year) labels.push(months[parseInt(activeFilters.month) - 1]);
    return labels;
  };

  const activeLabels = getActiveFilterLabels();
  const activeFiltersCount = activeLabels.length;

  return (
    <div className="mb-[1.5rem] sm:mb-[2rem]">
      <div className="flex items-center gap-[0.5rem] mb-[1rem] flex-wrap">
        <Button
          onClick={toggleFilters}
          variant="outline"
          className="flex items-center gap-[0.5rem] self-start min-h-[44px]"
        >
          {isFilterPanelOpen ? <X className="w-[1rem] h-[1rem]" /> : <Filter className="w-[1rem] h-[1rem]" />}
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-[0.25rem] bg-blue text-white text-xs rounded-full w-[1.25rem] h-[1.25rem] flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {activeLabels.map((label, index) => (
          <span
            key={index}
            className="inline-flex items-center px-[0.75rem] py-[0.375rem] text-sm bg-blue/10 text-blue rounded-full"
          >
            {label}
          </span>
        ))}
      </div>

      <div className={twMerge(
        'transition-all duration-300 ease-out overflow-hidden',
        isFilterPanelOpen ? 'h-auto' : 'h-[0rem]',
      )}>
        <div className={twMerge(
          'pt-[1.5rem] pb-[2rem] transition-opacity duration-300 ease-out relative border-t border-input-gray',
          isFilterContentVisible ? 'opacity-100' : 'opacity-0',
        )}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-[1.5rem] sm:gap-x-[2rem] gap-y-[1.5rem] sm:gap-y-[1rem]">
            <div>
              <h3 className="text-xs font-semibold text-dark-gray mb-[0.75rem] uppercase">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <FilterLink
                    label="All Categories"
                    onClick={() => onFilterChange('category', 'all')}
                    isActive={!activeFilters.category}
                  />
                </li>
                {filterOptions.categories?.map((cat) => (
                  <li key={cat.value}>
                    <FilterLink
                      label={cat.label}
                      onClick={() => onFilterChange('category', cat.value)}
                      isActive={activeFilters.category === cat.value}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-dark-gray mb-[0.75rem] uppercase">Year</h3>
              <ul className="space-y-2">
                <li>
                  <FilterLink
                    label="All Years"
                    onClick={() => onFilterChange('year', 'all')}
                    isActive={!activeFilters.year}
                  />
                </li>
                {Object.keys(filterOptions.dates || {})
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <li key={year}>
                      <FilterLink
                        label={year}
                        onClick={() => onFilterChange('year', year)}
                        isActive={activeFilters.year === year}
                      />
                    </li>
                  ))}
              </ul>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-xs font-semibold text-dark-gray mb-[0.75rem] uppercase">Month</h3>
              {activeFilters.year ? (
                <ul className="space-y-2">
                  <li>
                    <FilterLink
                      label="All Months"
                      onClick={() => onFilterChange('month', 'all')}
                      isActive={!activeFilters.month}
                    />
                  </li>
                  {filterOptions.dates[activeFilters.year]?.map((month) => (
                    <li key={month}>
                      <FilterLink
                        label={months[month - 1]}
                        onClick={() => onFilterChange('month', String(month))}
                        isActive={activeFilters.month === String(month)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-dark-gray italic mt-[0.5rem] py-[0.375rem]">
                  Select a year first
                </p>
              )}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-[1.5rem] sm:mt-[0rem] sm:absolute sm:bottom-[0rem] sm:right-[0rem] sm:pb-[2rem]">
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="w-full sm:w-auto min-h-[44px]"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
