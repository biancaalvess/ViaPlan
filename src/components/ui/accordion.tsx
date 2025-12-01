import React, { useState } from 'react';
import { cn } from '../../utils/utils';

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  );
}

export function AccordionItem({ children, className }: AccordionItemProps) {
  return (
    <div className={cn('border border-gray-200 rounded-lg', className)}>
      {children}
    </div>
  );
}

export function AccordionTrigger({ children, className, onClick }: AccordionTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-gray-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AccordionContent({ children, className, isOpen }: AccordionContentProps) {
  if (!isOpen) return null;
  
  return (
    <div className={cn('p-4 pt-0', className)}>
      {children}
    </div>
  );
}
