import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { UserRole } from './types';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Setup from './pages/Setup';
import CitizenRegister from './pages/CitizenRegister';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import ControlDashboard from './pages/ControlDashboard';
import ResetDatabase from './pages/ResetDatabase';

// Citizen Pages
import CitizenLayout from './components/CitizenLayout';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyProfile from './pages/citizen/MyProfile';
import MyStatus from './pages/citizen/MyStatus';
import Requests from './pages/citizen/Requests';
import History from './pages/citizen/History';

// Protected Route Component with Role Check
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen w-full bg-black text-white flex items-center justify-center font-mono text-xs">VERIFYING IDENTITY TOKEN...</div>;

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
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

            {/* Citizen Routes */}
            <Route path="/citizen" element={
                <ProtectedRoute allowedRoles={['Citizen']}>
                    <CitizenLayout />
                </ProtectedRoute>
            }>
                <Route path="dashboard" element={<CitizenDashboard />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="status" element={<MyStatus />} />
                <Route path="history" element={<History />} />
                <Route path="requests" element={<Requests />} />
                <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <Router>
        <AuthProvider>
            <ToastProvider>
                <AppRoutes />
            </ToastProvider>
        </AuthProvider>
    </Router>
  );
};

export default App;