import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './services/database';

// Pages
import PublicLayout from './components/PublicLayout';
import BookingPage from './pages/public/BookingPage';
import ConfirmationPage from './pages/public/ConfirmationPage';
import ManagePage from './pages/public/ManagePage';
import SuccessPage from './pages/public/SuccessPage';

import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import AgendaConfigPage from './pages/admin/AgendaConfigPage';
import PatientsPage from './pages/admin/PatientsPage';

const App: React.FC = () => {
  // Simulate background job
  useEffect(() => {
    const interval = setInterval(() => {
      db.checkExpiredAppointments();
    }, 60000); // Check every minute
    
    // Initial check
    db.checkExpiredAppointments();

    return () => clearInterval(interval);
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<BookingPage />} />
          <Route path="/confirm/:token" element={<ConfirmationPage />} />
          <Route path="/manage/:token" element={<ManagePage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
           <Route path="dashboard" element={<DashboardPage />} />
           <Route path="agenda" element={<AgendaConfigPage />} />
           <Route path="patients" element={<PatientsPage />} />
           <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
