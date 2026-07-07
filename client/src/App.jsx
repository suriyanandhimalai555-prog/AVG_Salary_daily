import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/SalaryUpdate'
import DashboardLayout from './layouts/DashboardLayout'
import OnboardBranch from './pages/OnboardBranch'
import OnboardUser from './pages/OnboardUser'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Your routes */}
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/admin/salary-update" replace />} />
            <Route path="salary-update" element={<Dashboard />} />
            <Route path="onboard-branch" element={<OnboardBranch />} />
            <Route path="onboard-user" element={<OnboardUser />} />
          </Route>
        
        {/* Catch-all route for 404s */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App