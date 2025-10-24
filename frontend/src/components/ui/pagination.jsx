import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}) => {
  const [inputValue, setInputValue] = useState(String(currentPage));

  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 1 || num > totalPages) {
      setInputValue(String(currentPage));
    } else {
      onPageChange(num);
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-center gap-[4rem] mt-[5rem]",
      className
    )}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "flex items-center justify-center w-[2.75rem] h-[2.75rem]",
          "bg-white text-dark-gray rounded-full border-0",
          "cursor-pointer transition-all duration-200",
          "hover:bg-gray-200 hover:text-antracite",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
        aria-label="Previous page"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.25rem] h-[1.25rem]">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      {/* Page Input */}
      <div className="flex items-center gap-[0.5rem] text-base font-semibold text-antracite">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
          className={cn(
            "w-[2.75rem] h-[2.75rem] border border-input-gray rounded-xl text-center",
            "font-semibold text-base",
            "focus:outline-none focus:border-input-gray",
            "[appearance:textfield]",
            "[&::-webkit-outer-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:appearance-none"
          )}
          min="1"
          max={totalPages}
        />
        <span>of {totalPages}</span>
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "flex items-center justify-center w-[2.75rem] h-[2.75rem]",
          "bg-white text-dark-gray rounded-full border-0",
          "cursor-pointer transition-all duration-200",
          "hover:bg-gray-200 hover:text-antracite",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
        aria-label="Next page"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.25rem] h-[1.25rem]">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
