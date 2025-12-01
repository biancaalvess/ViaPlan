import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Select({
  className,
  children,
  value,
  onValueChange,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={selectRef}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              currentValue: value,
            });
          }
          if (child.type === SelectContent) {
            return React.cloneElement(child, {
              isOpen,
              onSelect: handleSelect,
            });
          }
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({
  className,
  children,
  onClick,
  isOpen,
  currentValue,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean;
  currentValue?: string;
}) {
  return (
    <button
      type='button'
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectValue) {
          return React.cloneElement(child, {
            value: currentValue,
          });
        }
        return child;
      })}
      <ChevronDown
        className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
      />
    </button>
  );
}

export function SelectContent({
  className,
  children,
  isOpen,
  onSelect,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  isOpen?: boolean;
  onSelect?: (value: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute top-full left-0 z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md mt-1',
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, {
            onClick: () => onSelect?.(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectItem({
  className,
  children,
  value,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 hover:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectValue({
  placeholder,
  value,
}: {
  placeholder?: string;
  value?: string;
}) {
  return (
    <span className='text-gray-900'>
      {value || placeholder || 'Select an option'}
    </span>
  );
}
