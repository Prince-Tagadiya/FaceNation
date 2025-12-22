import React, { useEffect, useState } from 'react';
import { Shield, Activity, FileText, Bell, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

interface CaseData {
    id: string;
    status: string;
    caseId: string;
    type: string;
    description: string;
    createdAt: any;
}

const CitizenDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [caseCount, setCaseCount] = useState<number>(0);
    const [recentCases, setRecentCases] = useState<CaseData[]>([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Score - default perfect score, reduces with open cases
    const [transparencyScore, setTransparencyScore] = useState(100);

    useEffect(() => {
        if (!user) return;

        const db = getFirestore(app);

        // Fetch case count matches subjectId
        const q = query(
            collection(db, 'cases'),
            where('subjectName', '==', user.name)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCases = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CaseData[];

            // Count active cases for score calculation
            const openCases = fetchedCases.filter(c => c.status === 'Active').length;
            setCaseCount(openCases); // Only count active/open cases for the alert

            // Calculate Score: 100 - (10 per open case)
            const calculatedScore = Math.max(0, 100 - (openCases * 10));
            setTransparencyScore(calculatedScore);

            // Sort by createdAt desc
            fetchedCases.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            setRecentCases(fetchedCases.slice(0, 3));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const getStatusText = (score: number) => {
        if (score >= 90) return 'SECURE';
        if (score >= 70) return 'MODERATE';
        return 'AT RISK';
    };

    const getStatusColor = (score: number) => {
        if (score >= 90) return 'text-primary';
        if (score >= 70) return 'text-yellow-400';
        return 'text-red-500';
    };

    const getBarColor = (score: number) => {
        if (score >= 90) return 'bg-primary';
        if (score >= 70) return 'bg-yellow-400';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Styled Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Shield className="text-primary" size={18} />
                        </div>
                        <span className="text-xs font-mono text-primary uppercase tracking-[0.2em] font-bold">Registry Terminal</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Citizen Dashboard</h1>
                    <p className="text-gray-400 font-medium">Identity synchronization established. Welcome back, {user?.name?.split(' ')[0]}.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex flex-col items-end">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Infrastructure</span>
                        <div className="flex items-center gap-2">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            </div>
                            <span className="text-xs font-bold text-green-400 font-mono tracking-tighter">NODE-04: ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Identity Metrics Card */}
                <div className="lg:col-span-2 relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-purple-500/20 to-primary/30 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition-opacity"></div>

                    <div className="relative bg-[#080808]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-10 overflow-hidden min-h-[400px]">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-12 text-primary opacity-[0.03] pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                            <Shield size={240} strokeWidth={0.5} />
                        </div>
                        <div className="absolute inset-0 opacity-[0.15]"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        <div className="relative z-10 space-y-12">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="text-sm font-black uppercase text-gray-500 tracking-[0.3em] font-mono">Core Trust Compliance</h2>
                                    <p className="text-[10px] text-primary/60 font-mono">REAL-TIME BIOMETRIC TELEMETRY</p>
                                </div>
                                {!loading && caseCount > 0 && (
                                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                        <AlertCircle size={16} className="text-red-500" />
                                        <span className="text-[10px] font-black text-red-500 tracking-widest uppercase">{caseCount} Active Threat{caseCount > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase text-gray-600 font-mono tracking-widest font-bold">Transparency Metric</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-7xl font-black tracking-tighter transition-colors duration-1000 ${getStatusColor(transparencyScore)}`}>
                                            {transparencyScore}
                                        </span>
                                        <span className="text-2xl font-mono text-gray-500 font-bold opacity-30">/100</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-widest uppercase
                                            ${transparencyScore >= 90 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                transparencyScore >= 70 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {getStatusText(transparencyScore)}
                                        </div>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-2">
                                    <div className="group/item cursor-default">
                                        <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest mb-2">Sync Signature</p>
                                        <p className="text-xl font-mono text-white tracking-tighter font-bold">0x{user?.uid?.slice(0, 10).toUpperCase() || 'IDENTITY-LOCKED'}</p>
                                    </div>
                                    <div className="group/item cursor-default">
                                        <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest mb-2">Cycle Expiry</p>
                                        <p className="text-xl font-mono text-white tracking-tighter font-bold">T-MINUS 184 DAYS</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">Database Projection</span>
                                    <span className="text-[10px] font-mono text-gray-500 font-bold">{transparencyScore}% COMPLIANT</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full p-0.5 overflow-hidden border border-white/5 shadow-inner">
                                    <div
                                        className={`h-full ${getBarColor(transparencyScore)} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,240,255,0.4)] relative overflow-hidden`}
                                        style={{ width: `${transparencyScore}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                                <p className="mt-4 text-[10px] text-gray-600 font-medium leading-relaxed max-w-lg">
                                    Your transparency score is calculated based on active cases, surveillance compliance, and biometric consistency.
                                    <span className="text-primary/60 ml-1">Learn more about the Identity Act.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications / Intelligence Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-purple-500/20 to-primary/10 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative bg-[#080808]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col h-full overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-purple-500 opacity-[0.03] rotate-12">
                            <Bell size={120} strokeWidth={1} />
                        </div>

                        <h2 className="text-xs font-black mb-8 flex items-center gap-3 uppercase tracking-[0.3em] text-gray-500 relative z-10">
                            <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                            Intelligence Logs
                        </h2>

                        <div className="flex-1 space-y-4 relative z-10">
                            {recentCases.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-30 py-20">
                                    <Shield size={48} strokeWidth={1} />
                                    <p className="text-[10px] font-mono tracking-[0.3em] uppercase">No Logs Recorded</p>
                                </div>
                            ) : (
                                recentCases.map((c, idx) => (
                                    <div
                                        key={c.id}
                                        className="relative group/memo"
                                        style={{ animationDelay: `${idx * 150}ms` }}
                                        onClick={() => navigate('/citizen/cases')}
                                    >
                                        <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-transparent rounded-2xl opacity-0 group-hover/memo:opacity-100 transition-opacity"></div>
                                        <div className="relative p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/10 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-tighter block">#{c.caseId || c.id.slice(0, 4)}</span>
                                                    <h4 className="text-xs font-bold text-white tracking-tight">{c.type}</h4>
                                                </div>
                                                <div className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border
                                                    ${c.status === 'Active' ? 'text-red-400 border-red-500/30 bg-red-500/5' : 'text-green-400 border-green-500/30 bg-green-500/5'}`}>
                                                    {c.status.toUpperCase()}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 line-clamp-1 font-medium">{c.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/citizen/cases')}
                            className="mt-8 py-3.5 text-[10px] font-black font-mono text-center text-gray-400 hover:text-white border border-white/10 rounded-[1rem] hover:bg-white/5 hover:border-primary/30 transition-all uppercase tracking-[0.2em] relative z-10 bg-black/20"
                        >
                            Review Central Dossier
                        </button>
                    </div>
                </div>
            </div>

            {/* Futuristic Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: FileText, label: "View Profile", desc: "Digital Identity Data", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", shadow: "shadow-blue-500/5", path: "/citizen/profile" },
                    { icon: Activity, label: "Status Report", desc: "Surveillance Active", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", shadow: "shadow-green-500/5", path: "/citizen/status" },
                    { icon: Clock, label: "My Cases", desc: "Judicial Record Sync", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", shadow: "shadow-orange-500/5", path: "/citizen/cases" },
                    { icon: Shield, label: "Security Pack", desc: "Encryption Control", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", shadow: "shadow-red-500/5", path: "/citizen/requests" },
                ].map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(action.path)}
                        className="group relative p-6 bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] hover:border-white/20 transition-all duration-300 text-left overflow-hidden shadow-2xl"
                    >
                        {/* Action Card Inner Decor */}
                        <div className={`absolute -right-4 -bottom-4 ${action.color} opacity-[0.03] group-hover:scale-125 transition-transform duration-700`}>
                            <action.icon size={110} strokeWidth={1} />
                        </div>

                        <div className={`w-12 h-12 ${action.bg} ${action.border} rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-lg ${action.shadow}`}>
                            <action.icon className={`${action.color}`} size={22} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-black text-sm text-white mb-1 group-hover:text-primary transition-colors">{action.label}</h3>
                            <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">{action.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Technical Footer */}
            <div className="flex flex-col items-center gap-4 pt-10">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <p className="text-[9px] font-mono text-gray-700 uppercase tracking-[0.5em]">System Core Synchronized // End of Dashboard</p>
            </div>
        </div>
    );
};

export default CitizenDashboard;
