'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef(({ className, label, description, classNameLabel, ...props }, ref) => {
  const id = React.useId();

  return (
    <div className="flex items-start">
      <CheckboxPrimitive.Root
        ref={ref}
        id={id}
        className={cn(
          // Stili di base del quadratino
          'peer h-[1rem] w-[1rem] shrink-0 rounded-sm border-2 border-white/50 transition-colors',
          // Stili per lo stato 'focus'
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          // Stili per lo stato 'disabled'
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Stili per lo stato 'checked'
          'data-[state=checked]:bg-blue data-[state=checked]:text-white data-[state=checked]:border-blue',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
          <Check className="h-[0.75rem] w-[0.75rem]" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {(label || description) && (
        <div className="grid gap-[0.375rem] leading-none ml-[0.75rem]">
          {label && (
            <label
              htmlFor={id}
              // --- INIZIO BLOCCO CORRETTO ---
              className={cn(
                // Classi di default
                "text-sm font-medium leading-none text-light-gray peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                // Classe custom passata dall'esterno
                classNameLabel
              )}
              // --- FINE BLOCCO CORRETTO ---
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray peer-disabled:opacity-70">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };