import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Setup from './pages/Setup';
import CitizenRegister from './pages/CitizenRegister';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import ControlDashboard from './pages/ControlDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import ResetDatabase from './pages/ResetDatabase';
import { UserRole } from './types';

// Protected Route Component with Role Check
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-full bg-black text-white flex items-center justify-center font-mono text-xs">VERIFYING IDENTITY TOKEN...</div>;
  
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
     // Unauthorized access attempt - redirect to their actual authorized dashboard or home
     // Ideally, we could have a "403 Unauthorized" page, but for now redirecting to their role root is safer
     // or just back to home.
     return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<CitizenRegister />} />
            <Route path="/setup" element={<Setup />} />

            {/* Role Based Routes */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['System Admin']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />

            <Route path="/reset" element={
                <ProtectedRoute allowedRoles={['System Admin']}>
                    <ResetDatabase />
                </ProtectedRoute>
            } />
            
            <Route path="/officer" element={
                <ProtectedRoute allowedRoles={['Investigating Officer']}>
                    <OfficerDashboard />
                </ProtectedRoute>
            } />

            <Route path="/control" element={
                <ProtectedRoute allowedRoles={['Control Room Operator']}>
                    <ControlDashboard />
                </ProtectedRoute>
            } />

            <Route path="/citizen" element={
                <ProtectedRoute allowedRoles={['Citizen']}>
                    <CitizenDashboard />
                </ProtectedRoute>
            } />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <Router>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </Router>
  );
};

export default App;