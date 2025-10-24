// LitInvestorBlog-frontend/src/components/ui/hover-card.jsx

import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from '@/lib/utils';

function HoverCard({ ...props }) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({ ...props }) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-white text-antracite data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-[0.5rem] data-[side=left]:slide-in-from-right-[0.5rem] data-[side=right]:slide-in-from-left-[0.5rem] data-[side=top]:slide-in-from-bottom-[0.5rem] z-50 w-[16rem] origin-(--radix-hover-card-content-transform-origin) rounded-md border p-[1rem] shadow-md outline-hidden',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
