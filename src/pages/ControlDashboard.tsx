import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Radio, Map, AlertTriangle, Bell } from 'lucide-react';
import LiveFeed from '../components/LiveFeed';
import AlertView from '../components/AlertView';
import LiveAlerts from '../components/LiveAlerts';
import GeoMap from '../components/GeoMap';

const ControlDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [showLiveFeed, setShowLiveFeed] = React.useState(false);
    const [showAlerts, setShowAlerts] = React.useState(false);
    const [showGeoMap, setShowGeoMap] = React.useState(false);
    const [focusedAlertId, setFocusedAlertId] = React.useState<string | null>(null);

    const handleLocateAlert = (alertId: string) => {
        setShowAlerts(false);
        setFocusedAlertId(alertId);
        setShowGeoMap(true);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 relative">
            <LiveAlerts />

            {showLiveFeed && (
                <div className="fixed inset-0 z-50">
                    <React.Suspense fallback={<div className="text-white p-4">Loading Feed...</div>}>
                        <LiveFeed onClose={() => setShowLiveFeed(false)} />
                    </React.Suspense>
                </div>
            )}

            {showAlerts && (
                <AlertView
                    onClose={() => setShowAlerts(false)}
                    onLocate={handleLocateAlert}
                />
            )}

            {showGeoMap && (
                <div className="fixed inset-0 z-50">
                    <React.Suspense fallback={<div className="text-white p-4">Loading Map...</div>}>
                        <GeoMap
                            onClose={() => {
                                setShowGeoMap(false);
                                setFocusedAlertId(null);
                            }}
                            initialFocusId={focusedAlertId}
                        />
                    </React.Suspense>
                </div>
            )}

            <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-widest text-[#00ccff]">CONTROL ROOM</h1>
                    <p className="text-xs text-gray-500 mt-1">OPERATOR: {user?.name.toUpperCase()}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
        </div>
    );
};

export default ControlDashboard;
