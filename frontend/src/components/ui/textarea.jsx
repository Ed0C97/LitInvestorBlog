// LitInvestorBlog-frontend/src/components/ui/textarea.jsx

import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input-gray placeholder:text-gray focus-visible:border-antracite focus-visible:ring-antracite/50 aria-invalid:ring-red/20 dark:aria-invalid:ring-red/40 aria-invalid:border-red dark:bg-border-input-gray/30 flex field-sizing-content min-h-[4rem] w-full rounded-md border bg-transparent px-[0.75rem] py-[0.5rem] text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
