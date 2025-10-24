// src/components/ui/toggle.utils.js
import { cva } from 'class-variance-authority';

export const toggleVariants = cva(
  "inline-flex items-center justify-center gap-[0.5rem] rounded-md text-sm font-medium hover:bg-light-gray hover:text-gray disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-light-gray data-[state=on]:text-antracite [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-antracite focus-visible:ring-antracite/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-red/20 dark:aria-invalid:ring-red/40 aria-invalid:border-red whitespace-nowrap",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-border-input-gray bg-transparent shadow-xs hover:bg-light-gray hover:text-antracite',
      },
      size: {
        default: 'h-[2.25rem] px-[0.5rem] min-w-[2.25rem]',
        sm: 'h-[2rem] px-[0.375rem] min-w-[2rem]',
        lg: 'h-[2.5rem] px-[0.625rem] min-w-[2.5rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);