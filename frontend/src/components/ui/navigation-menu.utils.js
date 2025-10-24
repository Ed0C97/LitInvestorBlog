// src/components/ui/navigation-menu.utils.js
import { cva } from 'class-variance-authority';

export const navigationMenuTriggerStyle = cva(
  'group inline-flex h-[2.25rem] w-max items-center justify-center rounded-md bg-white px-[1rem] py-[0.5rem] text-sm font-medium hover:bg-light-gray hover:text-antracite focus:bg-light-gray focus:text-antracite disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-light-gray data-[state=open]:text-antracite data-[state=open]:focus:bg-light-gray data-[state=open]:bg-light-gray/50 focus-visible:ring-antracite/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1',
);