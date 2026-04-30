import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import LandingPage from '../pages/LandingPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<div>Customers Page (WIP)</div>} />
      <Route path="/churn-analysis" element={<div>Churn Analysis Page (WIP)</div>} />
      <Route path="/retention" element={<div>Retention Page (WIP)</div>} />
      <Route path="/campaigns" element={<div>Campaigns Page (WIP)</div>} />
      <Route path="/settings" element={<div>Settings Page (WIP)</div>} />
      <Route path="*" element={<div>404 - Not Found</div>} />
    </Routes>
  );
};

export default AppRouter;