import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/components/LandingPage';
import QuickTakeoffPage from '@/components/QuickTakeoffPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="devco-ui-theme">
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quick-takeoff" element={<QuickTakeoffPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;

