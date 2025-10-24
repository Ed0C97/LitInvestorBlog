// src/components/ui/badge.utils.js

import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  // Stili di base, tradotti dal tuo CSS .badge
  'inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        // Ho impostato 'blue' come default, ma puoi cambiarlo con 'gray' o un altro colore
        default: 'border-blue bg-blue/10 text-blue',
        blue:    'border-blue bg-blue/10 text-blue',
        green:   'border-green bg-green/10 text-green',
        yellow:  'border-yellow bg-yellow/10 text-yellow',
        red:     'border-red bg-red/10 text-red',
        gray:    'border-gray bg-gray/10 text-gray',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);