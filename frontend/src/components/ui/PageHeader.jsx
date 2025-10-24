// src/components/ui/PageHeader.jsx
import React from 'react';

const PageHeader = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`w-full mb-[3rem] ${className}`}>
      <div className="max-w-5xl mx-auto px-[1rem] pt-[3rem]">
        <div className="border-b border-input-gray my-[0.5rem]"></div>
        {subtitle && (
          <h2 className="text-2xl font-normal text-dark-gray">
            {subtitle}
          </h2>
        )}
        {title && (
          <h1 className="text-4xl font-bold text-antracite mt-[1rem]">{title}</h1>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
