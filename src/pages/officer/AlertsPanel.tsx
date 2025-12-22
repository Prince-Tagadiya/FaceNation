import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../types';
import { Bell, Check, Clock } from 'lucide-react';

const AlertsPanel: React.FC = () => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'alerts'), 
            where('officerId', '==', user.uid),
            orderBy('timestamp', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAlerts = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Alert));
            setAlerts(fetchedAlerts);
        });
        return () => unsubscribe();
    }, [user, db]);

    const acknowledgeAlert = async (alertId: string) => {
        try {
            await updateDoc(doc(db, 'alerts', alertId), {
                status: 'Acknowledged'
            });
        } catch (err) {
            console.error("Error acknowledging alert:", err);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Bell className="text-red-500" /> PRIORITY ALERTS
            </h2>

            <div className="space-y-4 overflow-y-auto">
                {alerts.map(alert => (
                    <div key={alert.uid} className={`border p-4 rounded-lg flex justify-between items-center transition-all ${
                        alert.status === 'New' 
                        ? 'bg-red-500/10 border-red-500/50 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-500 opacity-60 hover:opacity-100'
                    }`}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    alert.confidence > 90 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                                }`}>
                                    {alert.confidence}% MATCH
                                </span>
                                <span className="text-xs font-mono">ID: {alert.uid.slice(0, 8)}</span>
                            </div>
                            <p className="text-sm font-bold mb-1">Potential Subject Identification</p>
                            <div className="text-[10px] flex items-center gap-3 opacity-70">
                                <span className="flex items-center gap-1"><Clock size={10} /> {(alert.timestamp as any)?.toDate ? (alert.timestamp as any).toDate().toLocaleString() : 'N/A'}</span>
                                <span>CASE REF: {alert.caseId.slice(0, 8)}</span>
                            </div>
                        </div>

                        {alert.status === 'New' ? (
                            <button 
                                onClick={() => acknowledgeAlert(alert.uid)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-2"
                            >
                                <Check size={14} /> ACKNOWLEDGE
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-green-500 text-xs font-bold px-4 py-2 border border-green-500/30 rounded bg-green-500/5">
                                <Check size={14} /> REVIEWED
                            </div>
                        )}
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center text-gray-600 py-12">
                        No alerts in feed. System monitoring active.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
