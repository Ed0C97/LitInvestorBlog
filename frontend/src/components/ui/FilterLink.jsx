// LitInvestorBlog-frontend/src/components/ui/FilterLink.jsx

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const FilterLink = ({ label, onClick, isActive }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={clsx(
      'flex items-center gap-[0.75rem] text-sm group w-full text-left py-[0.375rem] transition-colors duration-150',
      isActive
        ? 'text-blue font-semibold'
        : 'text-antracite hover:text-blue',
    )}
  >
    <ArrowRight
      className={clsx(
        'w-[1rem] h-[1rem] transition-all duration-150',
        'group-hover:text-blue group-hover:translate-x-1',
        isActive ? 'text-blue' : 'text-dark-gray',
      )}
    />
    <span>{label}</span>
  </a>
);

export default FilterLink;
