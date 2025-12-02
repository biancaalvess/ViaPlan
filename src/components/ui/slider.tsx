import React from 'react';
import { cn } from '../../utils/utils';

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
}

export function Slider({
  className,
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  return (
    <div
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
    >
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value[0] || 0}
        onChange={handleChange}
        className='slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
        {...props}
      />
    </div>
  );
}
