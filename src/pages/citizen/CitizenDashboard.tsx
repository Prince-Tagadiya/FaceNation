import React, { useEffect, useState } from 'react';
import { Shield, Activity, FileText, Bell, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

interface CaseData {
    id: string;
    status: string;
}

const CitizenDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [caseCount, setCaseCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const db = getFirestore(app);

        // Fetch case count matches subjectId
        const q = query(
            collection(db, 'cases'),
            where('subjectId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCaseCount(snapshot.size);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Citizen Dashboard</h1>
                    <p className="text-gray-400">Welcome back, {user?.name}. Your privacy shield is active.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-mono text-primary uppercase tracking-widest mb-1">System Status</p>
                    <div className="flex items-center gap-2 justify-end">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-green-400">Operational</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Identity Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield size={120} />
                    </div>

                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Shield className="text-primary" size={20} /> Digital Identity Status
                        </h2>
                        {!loading && caseCount > 0 && (
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                                <AlertCircle size={12} /> {caseCount} ACTIVE CASE{caseCount > 1 ? 'S' : ''} DETECTED
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-mono tracking-widest mb-1">Transparency Score</p>
                            <p className="text-4xl font-bold text-white">98<span className="text-lg text-gray-500">/100</span></p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-mono tracking-widest mb-1">Last Verification</p>
                            <p className="text-xl font-mono text-white">2024-12-22</p>
                            <p className="text-xs text-gray-500">Authorized by GovPortal</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[98%] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                            </div>
                            <span className="text-xs font-mono text-primary">SECURE</span>
                        </div>
                    </div>
                </div>

                {/* Notifications / Memo Preview */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Bell className="text-purple-400" size={20} /> Recent Memos
                    </h2>

                    <div className="flex-1 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-white">System Update</span>
                                    <span className="text-[10px] text-gray-500 font-mono">10:4{i} AM</span>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2">The transparency layer has been updated to version 2.4.{i}. Please review your settings.</p>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 py-2 text-xs font-mono text-center text-gray-400 hover:text-white border border-white/10 rounded hover:bg-white/5 transition-all">
                        VIEW ALL MEMOS
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: FileText, label: "View Profile", desc: "Manage personal data", color: "text-blue-400", path: "/citizen/profile" },
                    { icon: Activity, label: "Status Report", desc: "Check active monitors", color: "text-green-400", path: "/citizen/status" },
                    { icon: Clock, label: "My Cases", desc: "View legal records", color: "text-orange-400", path: "/citizen/cases" },
                    { icon: Shield, label: "Privacy Settings", desc: "Adjust visibility", color: "text-red-400", path: "/citizen/settings" },
                ].map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(action.path)}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
                    >
                        <action.icon className={`${action.color} mb-3 group-hover:scale-110 transition-transform`} size={24} />
                        <h3 className="font-bold text-sm text-white mb-1">{action.label}</h3>
                        <p className="text-xs text-gray-500">{action.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CitizenDashboard;
