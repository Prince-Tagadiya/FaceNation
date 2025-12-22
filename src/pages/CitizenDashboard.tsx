import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, FileText } from 'lucide-react';

const CitizenDashboard: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6">
             <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
                 <div>
                    <h1 className="text-2xl font-bold tracking-widest text-[#aaaaaa]">CITIZEN PORTAL</h1>
                    <p className="text-xs text-gray-500 mt-1">IDENTITY: {user?.name.toUpperCase()}</p>
                 </div>
                 <button onClick={logout} className="text-red-500 text-xs hover:underline uppercase tracking-widest">
                    Sign Out
                 </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/5 p-8 rounded-lg border border-white/10 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">My Profile</h3>
                    <p className="text-sm text-gray-400">Manage your personal data and privacy settings.</p>
                </div>
                 <div className="bg-white/5 p-8 rounded-lg border border-white/10 text-center">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Compliance Status</h3>
                    <p className="text-sm text-gray-400">View your current standing and notifications.</p>
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
