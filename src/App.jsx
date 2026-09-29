import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import RiskMap from './pages/RiskMap/RiskMap';
import RelocationPlanning from './pages/RelocationPlanning/RelocationPlanning';
import FloodHistory from './pages/FloodHistory/FloodHistory';
import Analytics from './pages/Analytics/Analytics';
import MLModel from './pages/MLModel/MLModel';
import About from './pages/About/About';

function ProtectedRoutes() {
  const [authenticated] = useState(
    () => sessionStorage.getItem('adminAuthenticated') === 'true'
  );

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/risk-map" element={<RiskMap />} />
        <Route path="/relocation" element={<RelocationPlanning />} />
        <Route path="/flood-history" element={<FloodHistory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ml-model" element={<MLModel />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}