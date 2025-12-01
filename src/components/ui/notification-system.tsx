import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const context = useContext(NotificationContext);
  if (!context) return null;

  const { notifications, removeNotification } = context;

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={cn(
            'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
            {
              'border-l-4 border-green-500': notification.type === 'success',
              'border-l-4 border-red-500': notification.type === 'error',
              'border-l-4 border-yellow-500': notification.type === 'warning',
              'border-l-4 border-blue-500': notification.type === 'info',
            }
          )}
        >
          <div className='p-4'>
            <div className='flex items-start'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>
                  {notification.title}
                </p>
                <p className='mt-1 text-sm text-gray-500'>
                  {notification.message}
                </p>
              </div>
              <button
                className='ml-4 flex-shrink-0 flex'
                onClick={() => removeNotification(notification.id)}
              >
                <span className='text-gray-400 hover:text-gray-600'>✕</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}
