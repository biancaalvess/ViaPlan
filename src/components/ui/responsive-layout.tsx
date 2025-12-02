import React, { useState } from 'react';
import { cn } from '../../utils/utils';
// import { Sidebar } from '../Sidebar'; // Componente não encontrado
import { Header } from './header';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ResponsiveLayout({
  children,
  title,
  className,
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='h-screen flex overflow-hidden bg-gray-100'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        >
          <div className='absolute inset-0 bg-gray-600 opacity-75' />
        </div>
      )}

      {/* Sidebar - Componente não encontrado, comentado temporariamente */}
      {/* <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar />
      </div> */}

      {/* Main content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header title={title}>
          {/* Mobile menu button */}
          <button
            className='lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className='sr-only'>Abrir menu</span>
            <svg
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
        </Header>

        <main className={cn('flex-1 overflow-auto', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
