import React, { useState, useEffect } from 'react';
import { DashboardAlert, AlertSeverity } from '../types';
import { X, AlertTriangle, CheckCircle, Clock, MapPin, Search, Bell } from 'lucide-react';

import { MOCK_OFFICERS } from '../constants';

interface AlertViewProps {
    onClose: () => void;
    onLocate: (alertId: string) => void;
    alerts: DashboardAlert[];
    onUpdateAlerts: React.Dispatch<React.SetStateAction<DashboardAlert[]>>;
}

const AlertView: React.FC<AlertViewProps> = ({ onClose, onLocate, alerts, onUpdateAlerts }) => {
    const [selectedAlert, setSelectedAlert] = useState<DashboardAlert | null>(null);
    const [filter, setFilter] = useState<AlertSeverity | 'all'>('all');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    const filteredAlerts = alerts
        .filter(a => {
            const matchesSeverity = filter === 'all' || a.severity === filter;
            const matchesStatus = showActiveOnly ? ['active', 'assigned'].includes(a.status) : true;
            return matchesSeverity && matchesStatus;
        })
        .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const isOfficerBusy = (officerName: string) => {
        return alerts.some(a =>
            a.assignedTo === officerName &&
            a.status !== 'resolved'
        );
    };

    const showActionFeedback = (msg: string) => {
        setActionMessage(msg);
        setTimeout(() => setActionMessage(null), 3000);
    };

    const getSeverityColor = (severity: AlertSeverity) => {
        switch (severity) {
            case 'critical': return 'text-red-500 border-red-500/50 bg-red-500/10';
            case 'high': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
            case 'medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
            case 'low': return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
            default: return 'text-gray-500 border-gray-500/50 bg-white/5';
        }
    };

    const handleAcknowledge = (id: string) => {
        onUpdateAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
        showActionFeedback("Alert Status: ACKNOWLEDGED");
    };

    const handleResolve = (id: string) => {
        onUpdateAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
        showActionFeedback("Alert Status: RESOLVED");
    };

    const handleAssign = (id: string) => {
        if (!selectedOfficer) return;
        const officerName = MOCK_OFFICERS.find(o => o.id === selectedOfficer)?.name;

        if (officerName && isOfficerBusy(officerName)) {
            showActionFeedback(`Error: ${officerName} is already on a task!`);
            return;
        }

        onUpdateAlerts(prev => prev.map(a => a.id === id ? {
            ...a,
            status: 'assigned',
            assignedTo: officerName
        } : a));
        showActionFeedback(`Forwarded to ${officerName}`);
        setSelectedOfficer('');
    };

    // Update selectedAlert ref whenever alerts change
    useEffect(() => {
        if (selectedAlert) {
            const updated = alerts.find(a => a.id === selectedAlert.id);
            if (updated) setSelectedAlert(updated);
        }
    }, [alerts]);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-6 animate-in fade-in duration-200">
            {/* Feedback Toast */}
            {actionMessage && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full font-bold shadow-xl z-[60] animate-in slide-in-from-top-4 fade-in">
                    {actionMessage}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/20 rounded-lg">
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-white">ALERT DASHBOARD</h1>
                        <p className="text-xs text-gray-500 font-mono">SYSTEM MONITORING UNIT // ACTIVE THREATS</p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setShowActiveOnly(!showActiveOnly)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${showActiveOnly ? 'bg-red-500/20 border-red-500 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        <Bell className={`w-4 h-4 ${showActiveOnly ? 'text-white' : 'text-red-500 animate-pulse'}`} />
                        <span className="text-white font-mono text-sm">
                            {alerts.filter(a => ['active', 'assigned'].includes(a.status)).length} ACTIVE ALERTS
                        </span>
                        {showActiveOnly && <span className="text-[10px] bg-red-500 text-white px-1 rounded ml-1">ON</span>}
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="text-white w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
                {/* Sidebar Filters */}
                <div className="col-span-3 bg-white/5 rounded-xl border border-white/10 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                    <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">Severity Filter</h3>
                    {(['all', 'critical', 'high', 'medium', 'low'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-mono uppercase transition-all flex justify-between items-center ${filter === s ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 hover:bg-white/5'}`}
                        >
                            {s}
                            {s !== 'all' && (
                                <span className={`w-2 h-2 rounded-full ${s === 'critical' ? 'bg-red-500' :
                                    s === 'high' ? 'bg-orange-500' :
                                        s === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`} />
                            )}
                        </button>
                    ))}

                    <div className="mt-8 pt-8 border-t border-white/10">
                        <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">Sort Order</h3>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setSortOrder('newest')}
                                className={`flex-1 py-2 text-xs font-mono rounded transition-all ${sortOrder === 'newest' ? 'bg-white/10 text-white shadow font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                NEWEST
                            </button>
                            <button
                                onClick={() => setSortOrder('oldest')}
                                className={`flex-1 py-2 text-xs font-mono rounded transition-all ${sortOrder === 'oldest' ? 'bg-white/10 text-white shadow font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                OLDEST
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                        <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">System Status</h3>
                        <div className="space-y-2 text-xs text-gray-500 font-mono">
                            <div className="flex justify-between"><span>DB STATUS</span> <span className="text-green-500">ONLINE</span></div>
                            <div className="flex justify-between"><span>LATENCY</span> <span className="text-green-500">24ms</span></div>
                            <div className="flex justify-between"><span>UPTIME</span> <span className="text-white">99.98%</span></div>
                        </div>
                    </div>
                </div>

                {/* Alert List */}
                <div className="col-span-5 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-white/80 font-bold">Recent Alerts</h3>
                        <div className="flex bg-white/5 rounded p-1">
                            <input placeholder="Search ID..." className="bg-transparent border-none outline-none text-xs text-white px-2 w-32 font-mono" />
                            <Search className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {filteredAlerts.map(alert => (
                            <div
                                key={alert.id}
                                onClick={() => setSelectedAlert(alert)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all hover:translate-x-1 ${selectedAlert?.id === alert.id ? 'bg-white/10 border-white/30' : 'bg-black/40 border-white/5'} ${alert.status === 'resolved' ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest font-mono ${getSeverityColor(alert.severity)}`}>
                                        {alert.severity}
                                    </span>
                                    <span className="text-gray-500 text-[10px] font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1">{alert.type}</h4>
                                <div className="flex justify-between items-end">
                                    <p className="text-gray-400 text-xs truncate max-w-[70%]">{alert.message}</p>
                                    {alert.assignedTo && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1 rounded border border-blue-500/20">Assigned</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Panel */}
                <div className="col-span-4 bg-black/60 rounded-xl border border-white/10 p-6 flex flex-col relative overflow-hidden">
                    {selectedAlert ? (
                        <>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertTriangle className="w-32 h-32" />
                            </div>

                            <div className="mb-6 relative z-10">
                                <span className={`inline-block mb-2 text-[10px] px-2 py-1 rounded border uppercase tracking-widest font-mono ${getSeverityColor(selectedAlert.severity)}`}>
                                    {selectedAlert.severity} PRIORITY
                                </span>
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedAlert.type}</h2>
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                                    <Clock size={12} /> {new Date(selectedAlert.timestamp).toLocaleString()}
                                </div>
                            </div>

                            {selectedAlert.imageUrl && (
                                <div className="w-full h-48 bg-white/5 rounded-lg mb-6 overflow-hidden border border-white/10 relative group">
                                    <img src={selectedAlert.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-xs font-mono text-white border border-white px-2 py-1">ENHANCE IMAGE</p>
                                    </div>
                                    {/* Face Tracking Box Overlay Mockup */}
                                    <div className="absolute top-8 left-1/2 w-20 h-20 border-2 border-red-500 -translate-x-1/2" />
                                </div>
                            )}

                            <div className="space-y-6 flex-1 relative z-10 overflow-y-auto pr-2">
                                <div>
                                    <label className="text-gray-500 text-[10px] uppercase tracking-widest block mb-1">Location</label>
                                    <div className="flex items-center gap-2 text-white text-sm">
                                        <MapPin size={16} className="text-primary" />
                                        {selectedAlert.location}
                                        <button
                                            onClick={() => onLocate(selectedAlert.id)}
                                            className="ml-auto text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 hover:bg-blue-500/40 transition-colors uppercase font-bold tracking-wider"
                                        >
                                            Locate on Map
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-500 text-[10px] uppercase tracking-widest block mb-1">Details</label>
                                    <p className="text-gray-300 text-sm leading-relaxed">{selectedAlert.message}</p>
                                </div>

                                <div className="bg-white/5 p-4 rounded border border-white/10">
                                    <label className="text-gray-500 text-[10px] uppercase tracking-widest block mb-2">Assignment Status</label>

                                    {selectedAlert.assignedTo ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                                                    {selectedAlert.assignedTo.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="text-white text-sm font-bold">{selectedAlert.assignedTo}</div>
                                                    <div className="text-xs text-blue-400">Response Unit Dispatched</div>
                                                </div>
                                            </div>

                                            {/* Live Tracking Extension */}
                                            <div className="mt-2 bg-black/40 p-3 rounded border border-blue-500/30">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-[10px] uppercase text-blue-400 font-bold tracking-widest flex items-center gap-2">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                        </span>
                                                        LIVE TRACKING ACTIVE
                                                    </h4>
                                                </div>
                                                <div className="space-y-2 text-xs font-mono">
                                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                                        <span className="text-gray-500">TARGET LOC:</span>
                                                        <span className="text-white">{selectedAlert.lat?.toFixed(4)}, {selectedAlert.lng?.toFixed(4)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                                        <span className="text-gray-500">OFFICER LOC:</span>
                                                        <span className="text-blue-300">
                                                            {(() => {
                                                                const officer = MOCK_OFFICERS.find(o => o.name === selectedAlert.assignedTo);
                                                                return officer ? `${officer.lat.toFixed(4)}, ${officer.lng.toFixed(4)}` : 'SIGNAL LOST';
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between pt-1">
                                                        <span className="text-gray-500">ETA:</span>
                                                        <span className="text-green-400 font-bold">~2 MINS</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-xs text-orange-400 mb-2">⚠ No officer assigned yet. Forward immediately.</p>
                                            <div className="flex gap-2">
                                                <select
                                                    value={selectedOfficer}
                                                    onChange={e => setSelectedOfficer(e.target.value)}
                                                    className="flex-1 bg-black border border-white/20 rounded text-xs text-white p-2"
                                                >
                                                    <option value="">Select Officer...</option>
                                                    {MOCK_OFFICERS.map(off => {
                                                        const isBusy = isOfficerBusy(off.name);
                                                        return (
                                                            <option key={off.id} value={off.id} disabled={isBusy} className={isBusy ? 'text-gray-500' : 'text-white'}>
                                                                {off.name} {isBusy ? '(BUSY)' : '(AVAILABLE)'}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <button
                                                    onClick={() => handleAssign(selectedAlert.id)}
                                                    className="bg-white/10 hover:bg-white/20 text-white px-3 rounded border border-white/20"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4 mt-auto flex gap-2 relative z-10">
                                <button
                                    onClick={() => handleAcknowledge(selectedAlert.id)}
                                    disabled={selectedAlert.status !== 'active'}
                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded text-xs tracking-widest font-bold disabled:opacity-50"
                                >
                                    ACKNOWLEDGE
                                </button>
                                <button
                                    onClick={() => handleResolve(selectedAlert.id)}
                                    disabled={selectedAlert.status === 'resolved'}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-black py-2 rounded text-xs tracking-widest font-bold disabled:opacity-50"
                                >
                                    RESOLVE
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <AlertTriangle className="w-16 h-16 mb-4" />
                            <p className="font-mono text-sm">SELECT AN ALERT TO VIEW DETAILS</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertView;
