import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Topnav from './components/Topnav'
import Landing from './pages/Landing'
import Login from './pages/Login'
import FarmerPortal from './pages/FarmerPortal'
import OfficerDashboard from './pages/OfficerDashboard'
import AdminAnalytics from './pages/AdminAnalytics'
import ApplyScheme from './pages/ApplyScheme'
import Subsidies from './pages/Subsidies'
import Insurance from './pages/Insurance'
import Grievance from './pages/Grievance'
import LanguageSelector from './components/LanguageSelector'
import LiveTime from './components/LiveTime'

// Role-based route guard
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

// App layout wrapper (with sidebar + topnav)
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topnav onMenuToggle={() => setSidebarOpen(s => !s)} />
        <div className="page-body">{children}</div>
      </div>
    </div>
  )
}

// Root redirector after login
function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Landing />
  const routes = { farmer: '/farmer', officer: '/officer', admin: '/admin' }
  return <Navigate to={routes[user.role] || '/farmer'} replace />
}

export default function App() {
  return (
    <>
      <LanguageSelector />
      <LiveTime />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
          success: { style: { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' } },
          error:   { style: { background: '#fff1f2', color: '#991b1b', border: '1px solid #fecaca' } },
          loading: { style: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/schemes" element={<ApplyScheme />} />
        <Route path="/subsidies" element={<Subsidies />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/grievance" element={<Grievance />} />

        {/* Farmer Portal */}
        <Route path="/farmer" element={
          <ProtectedRoute roles={['farmer', 'admin']}>
            <AppLayout><FarmerPortal /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Officer Dashboard */}
        <Route path="/officer" element={
          <ProtectedRoute roles={['officer', 'admin']}>
            <AppLayout><OfficerDashboard /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Admin Analytics */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><AdminAnalytics /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
