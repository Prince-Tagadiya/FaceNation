import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import CitizenLayout from './components/CitizenLayout';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyProfile from './pages/citizen/MyProfile';
import MyStatus from './pages/citizen/MyStatus';
import Requests from './pages/citizen/Requests';
import History from './pages/citizen/History';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen w-full bg-black text-white flex items-center justify-center font-mono text-xs">INITIALIZING SECURE CONTEXT...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            {/* Citizen Routes */}
            <Route path="/citizen" element={
                <ProtectedRoute>
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