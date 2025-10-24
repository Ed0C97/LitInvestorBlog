// src/components/ui/switch.jsx

'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      // --- Contenitore (width: 2.625rem, height: 1.625rem) ---
      'peer inline-flex h-[1.625rem] w-[2.625rem] shrink-0 cursor-pointer items-center rounded-full p-0 transition-colors duration-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antracite focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',

      // --- Colori dal TUO design system ---
      'data-[state=unchecked]:bg-input-gray',
      'data-[state=checked]:bg-blue',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        // --- "Pallino" (width: 1.375rem, height: 1.375rem) ---
        'pointer-events-none block h-[1.375rem] w-[1.375rem] rounded-full bg-white shadow-lg ring-0 transition-transform duration-300',

        // --- Movimento CORRETTO e SIMMETRICO in rem ---
        // Posizione SPENTO: 0.125rem dal bordo sinistro
        'data-[state=unchecked]:translate-x-[0.125rem]',
        // Posizione ACCESO: 0.125rem dal bordo destro
        'data-[state=checked]:translate-x-[1.125rem]'
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };