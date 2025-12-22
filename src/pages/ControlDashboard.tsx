import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Radio, Map } from 'lucide-react';

const ControlDashboard: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6">
             <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
                 <div>
                    <h1 className="text-2xl font-bold tracking-widest text-[#00ccff]">CONTROL ROOM</h1>
                    <p className="text-xs text-gray-500 mt-1">OPERATOR: {user?.name.toUpperCase()}</p>
                 </div>
                 <button onClick={logout} className="text-red-500 text-xs hover:underline uppercase tracking-widest">
                    Sign Out
                 </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ccff]/50 transition-all cursor-pointer">
                    <Activity className="w-8 h-8 text-[#00ccff] mb-4" />
                    <h3 className="text-lg font-bold mb-2">Live Feeds</h3>
                    <p className="text-xs text-gray-400">Monitor real-time surveillance network streams.</p>
                </div>
                 <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ccff]/50 transition-all cursor-pointer">
                    <Map className="w-8 h-8 text-[#00ccff] mb-4" />
                    <h3 className="text-lg font-bold mb-2">Geo-Location</h3>
                    <p className="text-xs text-gray-400">Track active units and alert zones.</p>
                </div>
            </div>
        </div>
    );
};

export default ControlDashboard;
