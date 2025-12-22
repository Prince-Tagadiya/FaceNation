import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './officer/Sidebar';
import DashboardOverview from './officer/DashboardOverview';
import CitizenSearch from './officer/CitizenSearch';
import CaseManagement from './officer/CaseManagement';
import ScanDemo from './officer/ScanDemo';
import AlertsPanel from './officer/AlertsPanel';
import OfficerProfile from './officer/OfficerProfile';

const OfficerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'search':
                return <CitizenSearch />;
            case 'cases':
                return <CaseManagement />;
            case 'scan':
                return <ScanDemo />;
            case 'alerts':
                return <AlertsPanel />;
            case 'profile':
                return <OfficerProfile />;
            default:
                return <div className="text-gray-500">Select a module</div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
            
            <main className="ml-64 p-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{activeTab.replace('-', ' ').toUpperCase()}</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            SYSTEM ID: {user?.uid} // {new Date().toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                         <div className="text-xs text-green-500 border border-green-500/30 px-2 py-1 rounded bg-green-500/5">
                            SYSTEM ONLINE
                         </div>
                    </div>
                </header>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 min-h-[600px]">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default OfficerDashboard;
