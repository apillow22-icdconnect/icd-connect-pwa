import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import Messages from './components/messages/Messages';
import Schedules from './components/schedules/Schedules';
import Training from './components/training/Training';
import Tests from './components/tests/Tests';
import Leaderboard from './components/leaderboard/Leaderboard';
import SalesTracker from './components/sales/SalesTracker';
import Profile from './components/Profile';
import UserManagement from './components/admin/UserManagement';
import StarsManagement from './components/stars/StarsManagement';
import StarsView from './components/stars/StarsView';
import TenantManagement from './components/admin/TenantManagement';
import Navigation from './components/Navigation';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();

  if (tenantLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/training" element={<Training />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/sales-tracker" element={<SalesTracker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/stars" element={<StarsView />} />
          <Route path="/stars-management" element={<StarsManagement />} />
          <Route path="/tenant-management" element={<TenantManagement />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
};

const App = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    serviceWorkerRegistration.register({
      onUpdate: registration => {
        const waitingServiceWorker = registration.waiting;
        if (waitingServiceWorker) {
          waitingServiceWorker.addEventListener("statechange", event => {
            if (event.target.state === "activated") {
              window.location.reload();
            }
          });
          waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
        }
      }
    });
  }, []);

  return (
    <AuthProvider>
      <TenantProvider>
        <AppContent />
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
