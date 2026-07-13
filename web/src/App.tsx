import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Shelters from './components/Shelters';
import Capacity from './components/Capacity';
import Emergency from './components/Emergency';
import QRLogs from './components/QRLogs';
import Families from './components/Families';
import Unregistered from './components/Unregistered';
import Resources from './components/Resources';
import Notifications from './components/Notifications';
import Comments from './components/Comments';
import Donations from './components/Donations';
import Invite from './components/Invite';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string | string[] }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const roles = (Array.isArray(role) ? role : [role]).map(r => r.toLowerCase());
    const userRole = user?.role?.toLowerCase();
    
    if (userRole && !roles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  
  if (role === 'super_admin') return <Navigate to="/admin" replace />;
  if (role === 'admin') return <Navigate to="/dashboard" replace />;
  
  // Default for staff or any auth user without a specific role to prevent loops
  return <Navigate to="/staff" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      {/* Dynamic Dashboard Redirect based on Role */}
      <Route path="/" element={<DashboardRedirect />} />

      <Route path="/admin" element={
        <ProtectedRoute role="super_admin">
          <Layout>
            <div className="p-8"><Dashboard /></div>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute role="admin">
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/staff" element={
        <ProtectedRoute role="staff">
          <Layout>
            <div className="p-8"><Dashboard /></div>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/shelters" element={
        <ProtectedRoute>
          <Layout>
            <Shelters />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/capacity" element={
        <ProtectedRoute>
          <Layout>
            <Capacity />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/emergency" element={
        <ProtectedRoute role={['admin', 'super_admin']}>
          <Layout>
            <Emergency />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/qr-logs" element={
        <ProtectedRoute>
          <Layout>
            <QRLogs />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/families" element={
        <ProtectedRoute role={['admin', 'super_admin']}>
          <Layout>
            <Families />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/unregistered" element={
        <ProtectedRoute>
          <Layout>
            <Unregistered />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/resources" element={
        <ProtectedRoute>
          <Layout>
            <Resources />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute role={['admin', 'super_admin']}>
          <Layout>
            <Notifications />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/comments" element={
        <ProtectedRoute role={['admin', 'super_admin']}>
          <Layout>
            <Comments />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/donations" element={
        <ProtectedRoute role={['admin', 'super_admin']}>
          <Layout>
            <Donations />
          </Layout>
        </ProtectedRoute>
      } />
      <Route 
        path="/invite" 
        element={
          <ProtectedRoute role="super_admin">
            <Layout>
              <Invite />
            </Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  );
}
