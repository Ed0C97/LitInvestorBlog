// LitInvestorBlog-frontend/src/components/ui/command.jsx

'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function Command({ className, ...props }) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'bg-white text-antracite flex h-full w-full flex-col overflow-hidden rounded-md',
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  ...props
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-[0rem]">
        <Command className="[&_[cmdk-group-heading]]:text-gray **:data-[slot=command-input-wrapper]:h-[3rem] [&_[cmdk-group-heading]]:px-[0.5rem] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-[0.5rem] [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-[0rem] [&_[cmdk-input-wrapper]_svg]:h-[1.25rem] [&_[cmdk-input-wrapper]_svg]:w-[1.25rem] [&_[cmdk-input]]:h-[3rem] [&_[cmdk-item]]:px-[0.5rem] [&_[cmdk-item]]:py-[0.75rem] [&_[cmdk-item]_svg]:h-[1.25rem] [&_[cmdk-item]_svg]:w-[1.25rem]">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, ...props }) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-[2.25rem] items-center gap-[0.5rem] border-b px-[0.75rem]"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'placeholder:text-gray flex h-[2.5rem] w-full rounded-md bg-transparent py-[0.75rem] text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'max-h-[300px] scroll-py-[0.25rem] overflow-x-hidden overflow-y-auto',
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({ ...props }) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-[1.5rem] text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({ className, ...props }) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'text-antracite [&_[cmdk-group-heading]]:text-gray overflow-hidden p-[0.25rem] [&_[cmdk-group-heading]]:px-[0.5rem] [&_[cmdk-group-heading]]:py-[0.375rem] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('bg-border-input-gray -mx-[0.25rem] h-px', className)}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-light-gray data-[selected=true]:text-antracite [&_svg:not([class*='text-'])]:text-gray relative flex cursor-default items-center gap-[0.5rem] rounded-sm px-[0.5rem] py-[0.375rem] text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'text-gray ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
