import React from 'react';
import { Clock, Shield, Eye, FileSpreadsheet } from 'lucide-react';

const History: React.FC = () => {
    // Mock access logs
    const accessLogs = [
        {
            id: 1,
            date: '2024-12-22 14:30:00',
            agency: 'Traffic Control',
            purpose: 'Routine Traffic Stop',
            accessedData: 'Face ID, License Plate',
            status: 'Authorized'
        },
        {
            id: 2,
            date: '2024-12-20 09:15:00',
            agency: 'Central Database',
            purpose: 'Periodic Data Integrity Check',
            accessedData: 'Metadata',
            status: 'System Auto-Audit'
        },
        {
            id: 3,
            date: '2024-12-15 18:45:00',
            agency: 'Airport Security',
            purpose: 'Gate Access Verification',
            accessedData: 'Face ID, Flight Record',
            status: 'Authorized'
        }
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Access History</h1>
                    <p className="text-gray-400">Summary of when and why your identity was accessed.</p>
                </div>

                <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                    <FileSpreadsheet className="text-gray-400" size={20} />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20">
                                <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Agency/System</th>
                                <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Data Accessed</th>
                                <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {accessLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-sm text-gray-300 flex items-center gap-2">
                                        <Clock size={14} className="text-primary/50" />
                                        {log.date}
                                    </td>
                                    <td className="p-4 text-sm text-white font-medium">{log.agency}</td>
                                    <td className="p-4 text-sm text-gray-400">{log.purpose}</td>
                                    <td className="p-4 text-xs font-mono text-primary/80">{log.accessedData}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                            <Shield size={10} /> {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-white/10 bg-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        End of last 30 days history. Older logs are archived.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default History;
