// LitInvestorBlog-frontend/src/components/ui/dropdown.jsx

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Dropdown = ({ 
  id, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select an option",
  error = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    // Create a synthetic event object
    const syntheticEvent = {
      target: {
        name: name,
        value: optionValue
      }
    };
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-[1rem] py-[0.625rem] text-sm font-medium
          text-antracite bg-white
          border rounded-lg
          inline-flex items-center justify-between
          transition-all duration-200
          hover:bg-light-gray
          focus:outline-none focus:antracite-2 focus:antracite-blue
          ${error ? 'border-red focus:antracite-red' : 'border-input-gray'}
          ${!selectedOption ? 'text-gray' : ''}
        `}
      >
        <span>{displayText}</span>
        <ChevronDown className={`w-[1rem] h-[1rem] ml-[0.5rem] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-[0.5rem] w-full bg-white border border-input-gray rounded-lg shadow-lg">
          <ul className="py-[0.5rem] text-sm">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full text-left px-[1rem] py-[0.5rem]
                    transition-colors duration-150
                    hover:bg-light-gray
                    ${value === option.value ? 'bg-light-gray text-blue font-medium' : 'text-antracite'}
                  `}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
