// LitInvestorBlog-frontend/src/components/ui/menubar.jsx

import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Menubar({ className, ...props }) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        'bg-white flex h-[2.25rem] items-center gap-[0.25rem] rounded-md border p-[0.25rem] shadow-xs',
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({ ...props }) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({ ...props }) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({ ...props }) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({ ...props }) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

function MenubarTrigger({ className, ...props }) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'focus:bg-light-gray focus:text-antracite data-[state=open]:bg-light-gray data-[state=open]:text-antracite flex items-center rounded-sm px-[0.5rem] py-[0.25rem] text-sm font-medium outline-hidden select-none',
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'bg-white text-antracite data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-[0.5rem] data-[side=left]:slide-in-from-right-[0.5rem] data-[side=right]:slide-in-from-left-[0.5rem] data-[side=top]:slide-in-from-bottom-[0.5rem] z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-[0.25rem] shadow-md',
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({ className, inset, variant = 'default', ...props }) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
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

function MenubarCheckboxItem({ className, children, checked, ...props }) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-light-gray focus:text-antracite relative flex cursor-default items-center gap-[0.5rem] rounded-xs py-[0.375rem] pr-[0.5rem] pl-[2rem] text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-[0.5rem] flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({ className, children, ...props }) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-light-gray focus:text-antracite relative flex cursor-default items-center gap-[0.5rem] rounded-xs py-[0.375rem] pr-[0.5rem] pl-[2rem] text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-[0.5rem] flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({ className, inset, ...props }) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        'px-[0.5rem] py-[0.375rem] text-sm font-medium data-[inset]:pl-[2rem]',
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({ className, ...props }) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn('bg-border-input-gray -mx-[0.25rem] my-[0.25rem] h-px', className)}
      {...props}
    />
  );
}

function MenubarShortcut({ className, ...props }) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        'text-gray ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({ ...props }) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({ className, inset, children, ...props }) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        'focus:bg-light-gray focus:text-antracite data-[state=open]:bg-light-gray data-[state=open]:text-antracite flex cursor-default items-center rounded-sm px-[0.5rem] py-[0.375rem] text-sm outline-none select-none data-[inset]:pl-[2rem]',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-[1rem] w-[1rem]" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({ className, ...props }) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        'bg-white text-antracite data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-[0.5rem] data-[side=left]:slide-in-from-right-[0.5rem] data-[side=right]:slide-in-from-left-[0.5rem] data-[side=top]:slide-in-from-bottom-[0.5rem] z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-[0.25rem] shadow-lg',
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
