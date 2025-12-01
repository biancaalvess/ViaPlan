import React from 'react';
import { cn } from '../../utils/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  className,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <input
      type='checkbox'
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:text-white',
        className
      )}
      {...props}
      onChange={handleChange}
    />
  );
}
