// LitInvestorBlog-frontend/src/components/ui/context-menu.jsx

'use client';

import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function ContextMenu({ ...props }) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({ ...props }) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({ ...props }) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({ ...props }) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({ ...props }) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({ ...props }) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({ className, inset, children, ...props }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-light-gray focus:text-antracite data-[state=open]:bg-light-gray data-[state=open]:text-antracite flex cursor-default items-center rounded-sm px-[0.5rem] py-[0.375rem] text-sm outline-hidden select-none data-[inset]:pl-[2rem] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({ className, ...props }) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        'bg-white text-antracite data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-[0.5rem] data-[side=left]:slide-in-from-right-[0.5rem] data-[side=right]:slide-in-from-left-[0.5rem] data-[side=top]:slide-in-from-bottom-[0.5rem] z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-[0.25rem] shadow-lg',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({ className, ...props }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          'bg-white text-antracite data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-[0.5rem] data-[side=left]:slide-in-from-right-[0.5rem] data-[side=right]:slide-in-from-left-[0.5rem] data-[side=top]:slide-in-from-bottom-[0.5rem] z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-[0.25rem] shadow-md',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({ className, inset, variant = 'default', ...props }) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-light-gray focus:text-antracite data-[variant=destructive]:text-red data-[variant=destructive]:focus:bg-red/10 dark:data-[variant=destructive]:focus:bg-red/20 data-[variant=destructive]:focus:text-red data-[variant=destructive]:*:[svg]:!text-red [&_svg:not([class*='text-'])]:text-gray relative flex cursor-default items-center gap-[0.5rem] rounded-sm px-[0.5rem] py-[0.375rem] text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-[2rem] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({ className, children, checked, ...props }) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-light-gray focus:text-antracite relative flex cursor-default items-center gap-[0.5rem] rounded-sm py-[0.375rem] pr-[0.5rem] pl-[2rem] text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-[0.5rem] flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({ className, children, ...props }) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-light-gray focus:text-antracite relative flex cursor-default items-center gap-[0.5rem] rounded-sm py-[0.375rem] pr-[0.5rem] pl-[2rem] text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-[0.5rem] flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({ className, inset, ...props }) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        'text-antracite px-[0.5rem] py-[0.375rem] text-sm font-medium data-[inset]:pl-[2rem]',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({ className, ...props }) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('bg-border-input-gray -mx-[0.25rem] my-[0.25rem] h-px', className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        'text-gray ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
