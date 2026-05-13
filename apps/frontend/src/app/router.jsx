import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from '../pages/Dashboard/Dashboard';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminManagementDashboard from '../pages/Customers/AdminManagementDashboard';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard isAdminView={true} /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/management" 
          element={
            <ProtectedRoute>
              <PageTransition><AdminManagementDashboard /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route path="/customers" element={<PageTransition><div>Customers Page (WIP)</div></PageTransition>} />
        <Route path="/churn-analysis" element={<PageTransition><div>Churn Analysis Page (WIP)</div></PageTransition>} />
        <Route path="/retention" element={<PageTransition><div>Retention Page (WIP)</div></PageTransition>} />
        <Route path="/campaigns" element={<PageTransition><div>Campaigns Page (WIP)</div></PageTransition>} />
        <Route path="/settings" element={<PageTransition><div>Settings Page (WIP)</div></PageTransition>} />
        <Route path="*" element={<PageTransition><div>404 - Not Found</div></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;