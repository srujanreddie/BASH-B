/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './src/pages/Home';
import AdminLogin from './src/pages/AdminLogin';
import Dashboard from './src/pages/Dashboard';

/**
 * Root Application Router:
 * - Public mobile-first read-only view at '/'
 * - Hidden admin gateway at '/admin-login'
 * - Secure admin dashboard at '/dashboard'
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
