import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/utils';

interface HeaderProps {
  className?: string;
  title?: string;
  children?: React.ReactNode;
}

export function Header({ className, title, children }: HeaderProps) {
  return (
    <header className={cn('bg-white border-b border-gray-200', className)}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center'>
            <Link to='/' className='text-2xl font-bold text-blue-600 mr-8'>
              ViaPlan
            </Link>
            {title && (
              <h1 className='text-xl font-semibold text-gray-900'>{title}</h1>
            )}
          </div>

          <div className='flex items-center space-x-4'>
            {children}

            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-medium'>U</span>
              </div>
              <span className='text-sm text-gray-700'>Usuário</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
