// src/components/ui/button.utils.js
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[0.5rem] whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Varianti di default (le ho lasciate, ma puoi rimuoverle se non le usi)
        default: 'rounded-md bg-blue text-light-gray hover:bg-blue/90 focus-visible:ring-blue',
        destructive: 'rounded-md bg-red text-white hover:bg-red/90 focus-visible:ring-red',
        secondary: 'rounded-md bg-input-gray text-antracite hover:bg-input-gray/80 focus-visible:ring-gray',
        ghost: 'rounded-md hover:bg-light-gray hover:text-antracite focus-visible:ring-gray',
        link: 'text-blue underline-offset-4 hover:underline',

        // --- NUOVA VARIANTE "DARK" ---
        dark: 'bg-antracite text-white border border-antracite hover:bg-green hover:border-green focus-visible:ring-green',

        // --- TUTTE LE VARIANTI "OUTLINE" CORRETTE E COMPLETE ---
        outline: // La versione grigia di base
          'border border-gray bg-transparent text-gray hover:bg-gray hover:text-white focus-visible:ring-gray',

        'outline-blue':
          'border border-blue bg-transparent text-blue hover:bg-blue hover:text-white focus-visible:ring-blue',

        'outline-green':
          'border border-green bg-transparent text-green hover:bg-green hover:text-white focus-visible:ring-green',

        'outline-yellow': // Corretto l'hover text
          'border border-yellow bg-transparent text-yellow hover:bg-yellow hover:text-antracite focus-visible:ring-yellow',

        'outline-red':
          'border border-red bg-transparent text-red hover:bg-red hover:text-white focus-visible:ring-red',

        'outline-gray': // Alias per "outline"
          'border border-gray bg-transparent text-gray hover:bg-gray hover:text-white focus-visible:ring-gray',

        'outline-white':
          'border border-white bg-transparent text-white hover:bg-white hover:text-antracite focus-visible:ring-white',

        'outline-antracite': // Nuova variante aggiunta
          'border border-antracite bg-transparent text-antracite hover:bg-antracite hover:text-white focus-visible:ring-antracite',
      },
      size: {
        default: 'h-[2.5rem] px-[1.5rem] py-[0.5rem]',
        sm: 'h-[2rem] px-[1rem] py-[0.375rem] text-xs',
        lg: 'h-[3rem] px-[2rem] py-[0.75rem] text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);