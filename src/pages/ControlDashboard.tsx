import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Radio, Map, MessageSquare, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';

interface RequestItem {
    id: string;
    citizenName: string;
    category: string;
    subject: string;
    request: string;
    status: 'Pending' | 'Reviewed' | 'Resolved';
    createdAt: Timestamp;
    email: string;
    description: string;
}

const ControlDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState<RequestItem[]>([]);

    useEffect(() => {
        const db = getFirestore(app);
        const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RequestItem[];
            setRequests(reqs);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: 'Reviewed' | 'Resolved') => {
        const db = getFirestore(app);
        await updateDoc(doc(db, 'requests', id), {
            status: newStatus
        });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-mono">
            <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-widest text-[#00ccff]">CONTROL ROOM</h1>
                    <p className="text-xs text-gray-500 mt-1">OPERATOR: {user?.name.toUpperCase()} // ID: {user?.uid.slice(0, 8)}</p>
                </div>
                <button onClick={logout} className="text-red-500 text-xs hover:underline uppercase tracking-widest">
                    Sign Out
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ccff]/50 transition-all cursor-pointer group">
                    <Radio className="w-8 h-8 text-[#00ccff] mb-4 group-hover:animate-pulse" />
                    <h3 className="text-lg font-bold mb-2">Broadcast</h3>
                    <p className="text-xs text-gray-400">Emergency wide-band transmission.</p>
                </div>
            </div>

            <div className="border-t border-white/10 pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="text-[#00ccff]" />
                    <h2 className="text-xl font-bold tracking-tight">Incoming Citizen Inquiries</h2>
                    <span className="px-2 py-0.5 bg-[#00ccff]/20 text-[#00ccff] text-[10px] rounded-full animate-pulse">
                        LIVE LINK
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-gray-500 text-xs">
                            NO PENDING TRANSMISSIONS
                        </div>
                    ) : (
                        requests.map((req) => (
                            <div key={req.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                                {req.status === 'Pending' && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
                                )}
                                {req.status === 'Reviewed' && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                )}
                                {req.status === 'Resolved' && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                                )}

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] uppercase text-gray-500 tracking-widest block mb-1">
                                                ID: {req.id} • CITIZEN: {req.citizenName}
                                            </span>
                                            <h3 className="text-lg font-bold text-white">{req.subject}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border 
                                                ${req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    req.status === 'Reviewed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-black/30 p-3 rounded border border-white/5 max-w-3xl">
                                        <p className="text-sm text-gray-300 leading-relaxed font-sans">{req.description}</p>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                            <Clock size={10} />
                                            {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleString() : 'Processing...'}
                                        </span>
                                        <span className="text-[10px] text-gray-600">
                                            CATEGORY: {req.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 justify-center border-l border-white/5 pl-6 min-w-[140px]">
                                    <button
                                        onClick={() => handleUpdateStatus(req.id, 'Reviewed')}
                                        className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 px-3 rounded border border-blue-500/20 transition-colors text-left flex items-center gap-2"
                                    >
                                        <Activity size={12} /> MARK REVIEWED
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(req.id, 'Resolved')}
                                        className="text-[10px] bg-green-500/10 hover:bg-green-500/20 text-green-400 py-2 px-3 rounded border border-green-500/20 transition-colors text-left flex items-center gap-2"
                                    >
                                        <CheckCircle size={12} /> MARK RESOLVED
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ControlDashboard;
