import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/SalaryUpdate'
import DashboardLayout from './layouts/DashboardLayout'
import OnboardBranch from './pages/OnboardBranch'
import BranchData from './pages/BranchData'

// ----------------------------------------------------------------------
// AUTHENTICATION GUARDS (MIDDLEWARE)
// ----------------------------------------------------------------------

// 1. Protect routes from unauthenticated guests
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // Saved during login response

  if (!token) {
    // No token? Kick them out to the login page immediately
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Logged in but trying to access an unauthorized route? Redirect based on their role
    return userRole === 'admin' 
      ? <Navigate to="/admin/salary-update" replace /> 
      : <Navigate to="/user/dashboard" replace />; // Fallback path for standard users
  }

  return children;
};

// 2. Prevent already logged-in users from going back to the login page manually
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (token) {
    // If already logged in, bounce them straight to their respective workspace
    return userRole === 'admin' 
      ? <Navigate to="/admin/salary-update" replace /> 
      : <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

// ----------------------------------------------------------------------
// MAIN APPLICATION LAYOUT & ROUTING MATRIX
// ----------------------------------------------------------------------
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirector */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public Route (Restricted if already authenticated) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* ADMIN EXCLUSIVE PROTECTED ROUTE TREE */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Automatic redirection from /admin straight to /admin/salary-update */}
          <Route index element={<Navigate to="/admin/salary-update" replace />} />
          <Route path="salary-update" element={<Dashboard />} />
          <Route path="onboard-branch" element={<OnboardBranch />} />
          <Route path="branch-data" element={<BranchData />} />
        </Route>

        {/* STANDARD USER PROTECTED ROUTE PLACEHOLDER */}
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <div className="p-8 text-slate-800 font-bold">Standard User Area Placeholder</div>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all fallback route for broken URLs / 404 handling */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App