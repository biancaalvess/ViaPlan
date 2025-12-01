import React, { createContext, useContext, useState } from 'react';
import { cn } from  '../../utils/utils';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(
  undefined
);

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  children,
  open,
  onOpenChange,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  return (
    <DropdownMenuContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      <div className='relative'>{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(DropdownMenuContext);

  return (
    <button
      className={cn('outline-none', className)}
      onClick={() => context?.setOpen(!context.open)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = useContext(DropdownMenuContext);

  if (!context?.open) return null;

  return (
    <>
      <div
        className='fixed inset-0 z-40'
        onClick={() => context.setOpen(false)}
      />
      <div
        className={cn(
          'absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50',
          className
        )}
        {...props}
      >
        <div className='py-1'>{children}</div>
      </div>
    </>
  );
}

export function DropdownMenuItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer',
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <input
        type='checkbox'
        checked={checked}
        onChange={() => onCheckedChange?.(!checked)}
        className='mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
      />
      {children}
    </div>
  );
}
