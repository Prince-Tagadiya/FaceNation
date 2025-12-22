import React, { useEffect, useState } from 'react';
import { Activity, Bell, CheckCircle, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '../../lib/firebase';

interface CaseData {
    id: string;
    caseId: string;
    type: string;
    status: string;
    description: string;
    subjectName: string;
    createdAt: any;
}

const MyStatus: React.FC = () => {
    const { user } = useAuth();
    const [cases, setCases] = useState<CaseData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const db = getFirestore(app);
        // Query cases where subjectName matches the logged-in user's Name
        const q = query(
            collection(db, 'cases'),
            where('subjectName', '==', user.name)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCases: CaseData[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CaseData[];
            setCases(fetchedCases);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // State for memos to allow marking as read
    const [memos, setMemos] = useState([
        {
            id: 1,
            title: "Biometric Accuracy Optimization",
            content: `Citizen ${user?.name || 'User'}, to maintain 99.9% recognition accuracy, we recommend updating your reference biometric scan every 6 months. Your next update is due in 14 days.`,
            date: "2024-12-22",
            type: "info",
            read: false
        },
        {
            id: 2,
            title: "District Access Level Upgraded",
            content: `Congratulations ${user?.name || 'User'}. Based on your current Transparency Score, you have been granted 'Level 2' priority access to the Central Transit Network.`,
            date: "2024-12-21",
            type: "success",
            read: false
        },
        {
            id: 3,
            title: "Security Checkpoint Verification",
            content: `Successful identity verification for ${user?.name || 'account'} detected at 'North-Gate Terminal'. If this was not you, please report a biometric spoofing attempt immediately.`,
            date: "2024-12-20",
            type: "warning",
            read: true
        },
        {
            id: 4,
            title: "Data Integrity Report Ready",
            content: `Your monthly identity usage report is now available. 84 government nodes successfully verified the identity of ${user?.name || 'system profile'} this month with 0 security variances.`,
            date: "2024-12-19",
            type: "success",
            read: true
        }
    ]);

    const handleMarkAsRead = (id: number) => {
        setMemos(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Activity className="text-primary" size={18} />
                        </div>
                        <span className="text-xs font-mono text-primary uppercase tracking-[0.2em] font-bold">Identity Protocol</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">My Status</h1>
                    <p className="text-gray-400 mt-2 font-medium text-sm md:text-base">Personal memos and government surveillance notifications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3 group hover:border-primary/50 transition-all cursor-crosshair">
                        <div className="relative">
                            <span className="absolute inset-0 bg-primary/50 blur-sm rounded-full animate-ping"></span>
                            <span className="relative block w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 group-hover:text-primary transition-colors">CRYPTO-FEED: ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Case Status Section (Read-Only) */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-white opacity-[0.03] pointer-events-none">
                        <Activity size={160} strokeWidth={1} />
                    </div>

                    <div className="flex items-center justify-between mb-8 cursor-default">
                        <h2 className="text-[10px] uppercase text-gray-500 font-mono tracking-[0.3em] font-bold">Investigation Lifecycle Repository</h2>
                        <div className="h-px bg-white/10 flex-1 mx-6 hidden md:block"></div>
                        <span className="text-[10px] font-mono text-gray-600">SEC-HASH: 0x82f..{user?.uid?.slice(-4)}</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-6 animate-pulse">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-1/3 bg-white/10 rounded-lg"></div>
                                <div className="h-3 w-2/3 bg-white/5 rounded-lg"></div>
                            </div>
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                                <div className="relative w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]">
                                    <CheckCircle size={48} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-white mb-2">Compliance Rating: Optimal</h3>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                                    Identity scan complete. No active warrants, surveillance bookmarks, or judicial inquiries detected in the
                                    <span className="text-primary font-mono ml-1">Central Compliance Ledger</span>. Your digital fingerprint matches all standard behavior models.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                                    <span className="text-[10px] font-mono px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">CLEARANCE: LEVEL ULTRA</span>
                                    <span className="text-[10px] font-mono px-3 py-1 bg-white/5 text-gray-500 rounded-full border border-white/10">RISK: 0.04%</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                <div className="flex-shrink-0 relative">
                                    <div className="absolute inset-0 bg-red-500/30 blur-lg rounded-full animate-pulse"></div>
                                    <div className="relative w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/40 flex items-center justify-center">
                                        <AlertCircle size={28} className="text-red-500" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-red-400 tracking-tight">Priority Investigation Protocol</h3>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        Automatic lockdown of certain privileges may apply until these cases are resolved.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {cases.map((c) => (
                                    <div key={c.id} className="group/case p-5 bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-2xl hover:border-red-500/30 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="md:w-48 flex-shrink-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Ref No.</span>
                                                </div>
                                                <p className="text-lg font-mono font-bold text-white tracking-tighter mb-1">{c.caseId || c.id.slice(0, 8)}</p>
                                                <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[10px] text-primary inline-block font-mono uppercase">
                                                    {c.type}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2 font-bold">Intelligence Brief</span>
                                                <p className="text-gray-300 text-sm leading-relaxed">{c.description}</p>
                                            </div>

                                            <div className="md:w-32 flex flex-col justify-between items-end">
                                                <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] border shadow-sm
                                                    ${c.status === 'Active'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-red-500/10'
                                                        : 'bg-green-500/10 text-green-500 border-green-500/30 shadow-green-500/10'
                                                    }`}>
                                                    {c.status}
                                                </div>
                                                <span className="text-[9px] font-mono text-gray-600 mt-2">TIMESTAMP: {(c.createdAt as any)?.seconds || Date.now()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        System Memos
                    </h2>
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{memos.length} Records Found</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {memos.map((memo) => (
                        <div
                            key={memo.id}
                            onClick={() => !memo.read && handleMarkAsRead(memo.id)}
                            className={`group relative bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 cursor-pointer ${!memo.read ? 'shadow-[0_0_20px_rgba(0,240,255,0.05)]' : 'opacity-80'}`}
                        >
                            {!memo.read && (
                                <div className="absolute -top-1 -right-1">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start gap-6">
                                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110
                                    ${memo.type === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                        memo.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}>
                                    {memo.type === 'info' ? <Bell size={24} /> :
                                        memo.type === 'success' ? <CheckCircle size={24} /> :
                                            <AlertTriangle size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-3">
                                        <h3 className={`font-bold text-lg tracking-tight truncate ${!memo.read ? 'text-white' : 'text-gray-400'}`}>
                                            {memo.title}
                                        </h3>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded">
                                                <Clock size={12} className="text-primary" /> {memo.date}
                                            </span>
                                            {!memo.read && (
                                                <span className="text-[10px] font-bold text-primary border border-primary/30 px-2 py-0.5 rounded uppercase tracking-tighter bg-primary/5">New</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                        {memo.content}
                                    </p>
                                    {!memo.read && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(memo.id);
                                                }}
                                                className="text-[10px] font-mono text-primary hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                <CheckCircle size={10} /> MARK AS READ
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-12 pb-8 flex flex-col items-center gap-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <p className="text-gray-600 text-[10px] font-mono uppercase tracking-[0.4em]">End of Cryptographic Log</p>
            </div>
        </div>
    );
};

export default MyStatus;
