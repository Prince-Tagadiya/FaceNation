import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ToastAlert {
    id: number;
    message: string;
    type: 'critical' | 'warning' | 'info';
}

const LiveAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<ToastAlert[]>([]);

    useEffect(() => {
        // Simulate incoming alerts randomly
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const types: ToastAlert['type'][] = ['critical', 'warning', 'info'];
                const messages = [
                    "Face match detected at Sector 7",
                    "Suspicious activity reported",
                    "Camera 04 signal unstable",
                    "Unauthorized access attempt",
                    "Vehicle identified: LICENSE-404"
                ];

                const newAlert: ToastAlert = {
                    id: Date.now(),
                    type: types[Math.floor(Math.random() * types.length)],
                    message: messages[Math.floor(Math.random() * messages.length)]
                };

                addAlert(newAlert);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const addAlert = (alert: ToastAlert) => {
        setAlerts(prev => [alert, ...prev].slice(0, 5)); // Keep max 5
        // Auto remove
        setTimeout(() => {
            removeAlert(alert.id);
        }, 6000);
    };

    const removeAlert = (id: number) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="fixed top-24 right-6 z-40 flex flex-col gap-3 w-80 pointer-events-none">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`pointer-events-auto p-4 rounded bg-black/80 backdrop-blur-md border border-l-4 shadow-xl flex items-start justify-between animate-in slide-in-from-right duration-300 ${alert.type === 'critical' ? 'border-red-500 border-l-red-500' :
                            alert.type === 'warning' ? 'border-orange-500 border-l-orange-500' :
                                'border-blue-500 border-l-blue-500'
                        }`}
                >
                    <div className="flex gap-3">
                        <AlertTriangle size={18} className={`${alert.type === 'critical' ? 'text-red-500' :
                                alert.type === 'warning' ? 'text-orange-500' :
                                    'text-blue-500'
                            }`} />
                        <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${alert.type === 'critical' ? 'text-red-500' :
                                    alert.type === 'warning' ? 'text-orange-500' :
                                        'text-blue-500'
                                }`}>
                                {alert.type} ALERT
                            </h4>
                            <p className="text-white text-xs font-mono">{alert.message}</p>
                        </div>
                    </div>
                    <button onClick={() => removeAlert(alert.id)} className="text-gray-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default LiveAlerts;
