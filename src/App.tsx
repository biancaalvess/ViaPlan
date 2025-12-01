import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import QuickTakeoffPage from '@/components/QuickTakeoffPage';
import ProjectsPage from '@/components/ProjectsPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="devco-ui-theme">
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/quick-takeoff" element={<QuickTakeoffPage />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

