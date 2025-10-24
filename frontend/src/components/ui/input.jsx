// LitInvestorBlog-frontend/src/components/ui/input.jsx

import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="border-input-gray"
      className={cn(
          'file:text-antracite placeholder:text-gray selection:bg-blue selection:text-light-gray dark:bg-border-input-gray/30 border-input-gray flex h-[2.25rem] w-full min-w-[0rem] rounded-full border bg-transparent px-[0.75rem] py-[0.25rem] text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-[1.75rem] file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-antracite focus-visible:border-current',
          'aria-invalid:ring-red/20 dark:aria-invalid:ring-red/40 aria-invalid:border-red',
          className,
      )}

      {...props}
    />
  );
}

export { Input };
