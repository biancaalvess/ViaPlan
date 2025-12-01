import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import QuickTakeoffPage from '@/components/QuickTakeoffPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="devco-ui-theme">
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/quick-takeoff" replace />} />
          <Route path="/quick-takeoff" element={<QuickTakeoffPage />} />
          <Route path="*" element={<Navigate to="/quick-takeoff" replace />} />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;

