import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, FolderOpen, FileText } from 'lucide-react';

const OfficerDashboard: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6">
            <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
                 <div>
                    <h1 className="text-2xl font-bold tracking-widest text-[#00ff88]">INVESTIGATION UNIT</h1>
                    <p className="text-xs text-gray-500 mt-1">OFFICER: {user?.name.toUpperCase()}</p>
                 </div>
                 <button onClick={logout} className="text-red-500 text-xs hover:underline uppercase tracking-widest">
                    Sign Out
                 </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ff88]/50 transition-all cursor-pointer group">
                    <Search className="w-8 h-8 text-[#00ff88] mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold mb-2">Subject Search</h3>
                    <p className="text-xs text-gray-400">Query national identity database by biometric parameters.</p>
                </div>
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ff88]/50 transition-all cursor-pointer group">
                    <FolderOpen className="w-8 h-8 text-[#00ff88] mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold mb-2">Case Files</h3>
                    <p className="text-xs text-gray-400">Access active investigation dossiers and reports.</p>
                </div>
            </div>
        </div>
    );
};

export default OfficerDashboard;
