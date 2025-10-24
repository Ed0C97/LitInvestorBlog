// LitInvestorBlog-frontend/src/components/ui/tabs.jsx

'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-[0.5rem]', className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-light-gray text-gray inline-flex h-[2.25rem] w-fit items-center justify-center rounded-lg p-[3px]',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-white dark:data-[state=active]:text-antracite focus-visible:border-antracite focus-visible:ring-antracite/50 focus-visible:outline-antracite dark:data-[state=active]:border-input-gray dark:data-[state=active]:bg-border-input-gray/30 text-antracite dark:text-gray inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-[0.375rem] rounded-md border border-transparent px-[0.5rem] py-[0.25rem] text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
