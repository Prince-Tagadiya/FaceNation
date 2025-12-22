import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Radio, Map, MessageSquare, Clock, AlertTriangle, CheckCircle, Bell, FileText } from 'lucide-react';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';
import LiveFeed from '../components/LiveFeed';
import AlertView from '../components/AlertView';
import LiveAlerts from '../components/LiveAlerts';
import GeoMap from '../components/GeoMap';
import CaseRegistry from '../components/CaseRegistry';
import { MOCK_ALERTS } from '../constants';
import { DashboardAlert } from '../types';

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
    const [showLiveFeed, setShowLiveFeed] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [showGeoMap, setShowGeoMap] = useState(false);
    const [showCaseRegistry, setShowCaseRegistry] = useState(false);
    const [focusedAlertId, setFocusedAlertId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Reviewed' | 'Resolved'>('All');
    const [dashboardAlerts, setDashboardAlerts] = useState<DashboardAlert[]>(MOCK_ALERTS);

    // Fetch Requests Logic
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

    const handleLocateAlert = (alertId: string) => {
        setShowAlerts(false);
        setFocusedAlertId(alertId);
        setShowGeoMap(true);
    };

    const filteredRequests = requests.filter(req => filterStatus === 'All' || req.status === filterStatus);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-mono relative">
            <LiveAlerts />

            {showLiveFeed && (
                <div className="fixed inset-0 z-50">
                    <React.Suspense fallback={<div className="text-white p-4">Loading Feed...</div>}>
                        {/* @ts-ignore */}
                        <LiveFeed onClose={() => setShowLiveFeed(false)} />
                    </React.Suspense>
                </div>
            )}

            {showAlerts && (
                /* @ts-ignore */
                <AlertView
                    onClose={() => setShowAlerts(false)}
                    onLocate={handleLocateAlert}
                    alerts={dashboardAlerts}
                    onUpdateAlerts={setDashboardAlerts}
                />
            )}

            {showGeoMap && (
                <div className="fixed inset-0 z-50">
                    <React.Suspense fallback={<div className="text-white p-4">Loading Map...</div>}>
                        {/* @ts-ignore */}
                        <GeoMap
                            onClose={() => {
                                setShowGeoMap(false);
                                setFocusedAlertId(null);
                            }}
                            initialFocusId={focusedAlertId}
                            alerts={dashboardAlerts}
                        />
                    </React.Suspense>
                </div>
            )}

            {showCaseRegistry && (
                <CaseRegistry onClose={() => setShowCaseRegistry(false)} />
            )}

            <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-widest text-[#00ccff]">CONTROL ROOM</h1>
                    <p className="text-xs text-gray-500 mt-1">OPERATOR: {user?.name.toUpperCase()} // ID: {user?.uid.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setShowAlerts(true)}
                        className="relative text-gray-400 hover:text-white transition-colors"
                    >
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </button>
                    <button onClick={logout} className="text-red-500 text-xs hover:underline uppercase tracking-widest">
                        Sign Out
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <div
                    onClick={() => setShowLiveFeed(true)}
                    className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ccff]/50 transition-all cursor-pointer group"
                >
                    <Activity className="w-8 h-8 text-[#00ccff] mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold mb-2">Live Feeds</h3>
                    <p className="text-xs text-gray-400">Monitor real-time surveillance network streams.</p>
                </div>
                <div
                    onClick={() => setShowGeoMap(true)}
                    className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ccff]/50 transition-all cursor-pointer group"
                >
                    <Map className="w-8 h-8 text-[#00ccff] mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold mb-2">Geo-Location</h3>
                    <p className="text-xs text-gray-400">Track active units and alert zones.</p>
                </div>
                <div
                    onClick={() => setShowAlerts(true)}
                    className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ccff]/50 transition-all cursor-pointer group"
                >
                    <AlertTriangle className="w-8 h-8 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold mb-2">Active Alerts</h3>
                    <p className="text-xs text-gray-400">Review and acknowledge system notifications.</p>
                </div>
                <div
                    onClick={() => setShowCaseRegistry(true)}
                    className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-[#00ccff]/50 transition-all cursor-pointer group"
                >
                    <FileText className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold mb-2">Case Registry</h3>
                    <p className="text-xs text-gray-400">Browse all citizen cases and records.</p>
                </div>
            </div>

            <div className="border-t border-white/10 pt-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="text-[#00ccff]" />
                        <h2 className="text-xl font-bold tracking-tight">Incoming Citizen Inquiries</h2>
                        <span className="px-2 py-0.5 bg-[#00ccff]/20 text-[#00ccff] text-[10px] rounded-full animate-pulse">
                            LIVE LINK
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {['All', 'Pending', 'Reviewed', 'Resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded border transition-all ${filterStatus === status
                                    ? 'bg-[#00ccff]/10 text-[#00ccff] border-[#00ccff]/50 shadow-[0_0_10px_rgba(0,204,255,0.2)]'
                                    : 'bg-white/5 text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-gray-500 text-xs text-gray-400">
                            NO {filterStatus !== 'All' ? filterStatus.toUpperCase() : ''} TRANSMISSIONS FOUND
                        </div>
                    ) : (
                        filteredRequests.map((req) => (
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
