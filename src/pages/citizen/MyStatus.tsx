import React, { useEffect, useState } from 'react';
import { Activity, Bell, CheckCircle, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '../../lib/firebase';

interface CaseData {
    id: string;
    caseNumber: string;
    caseType: string;
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
        // Query cases where subjectId matches the logged-in user's UID
        const q = query(
            collection(db, 'cases'),
            where('subjectId', '==', user.uid)
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

    // Mock data for memos
    const memos = [
        {
            id: 1,
            title: "Surveillance System Update",
            content: "The central monitoring system will undergo maintenance on 2024-12-25. No action required.",
            date: "2024-12-22",
            type: "info",
            read: false
        },
        {
            id: 2,
            title: "Identity Verification Confirm",
            content: "Your recent identity verification request has been vetted and approved by Officer ID #8822.",
            date: "2024-12-20",
            type: "success",
            read: true
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Status</h1>
                    <p className="text-gray-400">Personal memos and government notifications.</p>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    <span className="text-xs font-mono text-gray-300">LIVE FEED</span>
                </div>
            </div>

            {/* Case Status Section (Read-Only) */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Activity size={100} />
                </div>
                <h2 className="text-sm uppercase text-gray-500 font-mono tracking-widest mb-4">Active Investigation Status</h2>

                {loading ? (
                    <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-white/10"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-48 bg-white/10 rounded"></div>
                            <div className="h-3 w-64 bg-white/10 rounded"></div>
                        </div>
                    </div>
                ) : cases.length === 0 ? (
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">No Active Cases</h3>
                            <p className="text-gray-400 text-sm max-w-lg mt-1">
                                Your record is currently clear. No ongoing surveillance orders or judicial inquiries are linked to your identity profile.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center animate-pulse">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white text-red-400">Active Investigation Detected</h3>
                                <p className="text-gray-400 text-sm max-w-lg mt-1">
                                    The following case files are linked to your identity. Please review them.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {cases.map((c) => (
                                <div key={c.id} className="p-4 bg-black/20 border border-red-500/20 rounded-lg flex flex-col md:flex-row gap-4">
                                    <div className="min-w-[120px]">
                                        <p className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Case Number</p>
                                        <p className="text-white font-mono font-bold">{c.caseNumber}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Description</p>
                                        <p className="text-gray-300 text-sm">{c.description}</p>
                                    </div>
                                    <div className="min-w-[100px] text-right">
                                        <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/20 uppercase tracking-wider font-bold">
                                            {c.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Bell className="text-primary" size={20} /> System Memos
                </h2>
                {memos.map((memo) => (
                    <div key={memo.id} className={`bg-white/5 border ${memo.read ? 'border-white/5 opacity-70 hover:opacity-100' : 'border-primary/30 bg-primary/5'} rounded-xl p-6 transition-all`}>
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 p-2 rounded-lg 
                                ${memo.type === 'info' ? 'bg-blue-500/10 text-blue-400' :
                                    memo.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                        'bg-yellow-500/10 text-yellow-400'}`}>
                                {memo.type === 'info' ? <Bell size={20} /> :
                                    memo.type === 'success' ? <CheckCircle size={20} /> :
                                        <AlertTriangle size={20} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold text-lg ${memo.read ? 'text-gray-300' : 'text-white'}`}>{memo.title}</h3>
                                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                                        <Clock size={12} /> {memo.date}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{memo.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                <p className="text-gray-500 text-sm">End of memos.</p>
            </div>
        </div>
    );
};

export default MyStatus;
