import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Case, Alert } from '../../types';
import { FileText, Bell, Activity, Clock } from 'lucide-react';

interface DashboardOverviewProps {
    setActiveTab: (tab: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveTab }) => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [stats, setStats] = useState({
        activeCases: 0,
        totalCases: 0,
        newAlerts: 0,
        totalAlerts: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        // Listen for Cases
        const casesQuery = query(collection(db, 'cases'), where('assignedOfficerId', '==', user.uid));
        const unsubCases = onSnapshot(casesQuery, (snapshot) => {
            const cases = snapshot.docs.map(doc => doc.data() as Case);
            setStats(prev => ({
                ...prev,
                activeCases: cases.filter(c => c.status === 'Active').length,
                totalCases: cases.length
            }));
        });

        // Listen for Alerts
        const alertsQuery = query(collection(db, 'alerts'), where('officerId', '==', user.uid));
        const unsubAlerts = onSnapshot(alertsQuery, (snapshot) => {
            const alerts = snapshot.docs.map(doc => doc.data() as Alert);
            setStats(prev => ({
                ...prev,
                newAlerts: alerts.filter(a => a.status === 'New').length,
                totalAlerts: alerts.length
            }));
        });

        return () => {
            unsubCases();
            unsubAlerts();
        };
    }, [user, db]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111] border border-white/5 p-6 rounded-lg hover:border-blue-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                            <FileText size={24} />
                        </div>
                        <span className="text-2xl font-bold text-white">{stats.activeCases}</span>
                    </div>
                    <div className="text-gray-400 text-sm">Active Cases</div>
                    <div className="text-[10px] text-gray-600 mt-1">TOTAL ASSIGNED: {stats.totalCases}</div>
                </div>

                <div className="bg-[#111] border border-white/5 p-6 rounded-lg hover:border-red-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                            <Bell size={24} />
                        </div>
                        <span className="text-2xl font-bold text-white">{stats.newAlerts}</span>
                    </div>
                    <div className="text-gray-400 text-sm">Pending Alerts</div>
                    <div className="text-[10px] text-gray-600 mt-1">TOTAL ALERTS: {stats.totalAlerts}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-lg p-6">
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-green-500" />
                        RECENT ACTIVITY FEED
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded border-l-2 border-blue-500 text-sm">
                            <span className="text-blue-400 font-bold block mb-1">SYSTEM INIT</span>
                            <span className="text-gray-400">Dashboard initialized for Officer {user?.name}. Real-time streams active.</span>
                        </div>
                         {/* Placeholder for dynamic activity if we implement a log collection later */}
                         <div className="text-center text-gray-600 text-xs py-8 italic">
                            Awaiting new system events...
                         </div>
                    </div>
                </div>

                 <div className="bg-[#111] border border-white/5 rounded-lg p-6">
                     <h3 className="text-lg font-bold mb-6">QUICK ACTIONS</h3>
                     <div className="space-y-3">
                         <button 
                             onClick={() => setActiveTab('cases')}
                             className="w-full p-3 bg-white/5 hover:bg-white/10 rounded text-left text-sm text-gray-300 transition-colors"
                         >
                            + Draft New Report
                         </button>
                         <button 
                             onClick={() => setActiveTab('scan')}
                             className="w-full p-3 bg-white/5 hover:bg-white/10 rounded text-left text-sm text-gray-300 transition-colors"
                         >
                            Scan Citizen
                         </button>
                         <button 
                             onClick={() => setActiveTab('search')}
                             className="w-full p-3 bg-white/5 hover:bg-white/10 rounded text-left text-sm text-gray-300 transition-colors"
                         >
                            Search Citizens
                         </button>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
