// LitInvestorBlog-frontend/src/components/ui/calendar.jsx

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-[0.75rem]', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-[0.5rem]',
        month: 'flex flex-col gap-[1rem]',
        caption: 'flex justify-center pt-[0.25rem] relative items-center w-full',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-[0.25rem]',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-[0rem] opacity-50 hover:opacity-100',
        ),
        nav_button_previous: 'absolute left-[0.25rem]',
        nav_button_next: 'absolute right-[0.25rem]',
        table: 'w-full border-collapse space-x-1',
        head_row: 'flex',
        head_cell:
          'text-gray rounded-md w-[2rem] font-normal text-[0.8rem]',
        row: 'flex w-full mt-[0.5rem]',
        cell: cn(
          'relative p-[0rem] text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-light-gray [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 p-[0rem] font-normal aria-selected:opacity-100',
        ),
        day_range_start:
          'day-range-start aria-selected:bg-blue aria-selected:text-light-gray',
        day_range_end:
          'day-range-end aria-selected:bg-blue aria-selected:text-light-gray',
        day_selected:
          'bg-blue text-light-gray hover:bg-blue hover:text-light-gray focus:bg-blue focus:text-light-gray',
        day_today: 'bg-light-gray text-antracite',
        day_outside:
          'day-outside text-gray aria-selected:text-gray',
        day_disabled: 'text-gray opacity-50',
        day_range_middle:
          'aria-selected:bg-light-gray aria-selected:text-antracite',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn('size-4', className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn('size-4', className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
