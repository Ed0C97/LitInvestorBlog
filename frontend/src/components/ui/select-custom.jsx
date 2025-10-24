// LitInvestorBlog-frontend/src/components/ui/select-custom.jsx

import React from 'react';
import { ChevronDown } from 'lucide-react';

export const SelectCustom = ({ 
  id, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select an option",
  error = false,
  className = ""
}) => {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full px-[1rem] py-[0.625rem] pr-[2.5rem]
          border rounded-lg
          bg-white text-antracite
          appearance-none cursor-pointer
          transition-all duration-200
          hover:border-input-gray/50
          focus:outline-none focus:antracite-2 focus:antracite-blue focus:border-input-gray
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red focus:antracite-red' : 'border-input-gray'}
          ${className}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-[0.75rem] top-[0.25rem]/2 -translate-y-1/2 w-[1rem] h-[1rem] text-gray pointer-events-none" />
    </div>
  );
};

export default SelectCustom;
