import React, { useEffect, useState } from 'react';
import { FileText, Shield, AlertCircle, Clock, CheckCircle, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '../../lib/firebase';

interface CaseData {
    id: string;
    caseId: string;
    type: string;
    status: string;
    description: string;
    createdAt: any;
    severity?: 'Low' | 'Medium' | 'High';
}

const Cases: React.FC = () => {
    const { user } = useAuth();
    const [cases, setCases] = useState<CaseData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const db = getFirestore(app);

        // Sync data from firestore cases collection and compare subject name and citizen name
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

    const handleExport = () => {
        if (cases.length === 0) return;

        // Define CSV Headers
        const headers = ["Case Number", "Date", "Type", "Status", "Description"];

        // Map Data to CSV Rows
        const rows = cases.map(c => [
            c.caseId || c.id,
            c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'N/A',
            c.type,
            c.status,
            `"${c.description.replace(/"/g, '""')}"` // Escape quotes in description
        ]);

        // Combine Headers and Rows
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `my_cases_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Shield className="text-orange-400" size={18} />
                        </div>
                        <span className="text-xs font-mono text-orange-400 uppercase tracking-[0.2em] font-bold">Judicial Records</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">My Cases</h1>
                    <p className="text-gray-400 font-medium">Legal records, investigations, and judicial matters linked to your identity profile.</p>
                </div>

                <button
                    onClick={handleExport}
                    disabled={cases.length === 0}
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all text-xs font-bold tracking-widest disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95 shadow-lg"
                >
                    <Download className="text-gray-400 group-hover:text-primary transition-all group-hover:-translate-y-0.5" size={18} />
                    <span className="text-gray-300 group-hover:text-white uppercase">Export Intelligence Pack</span>
                </button>
            </div>

            {/* Content Section */}
            <div className="relative">
                {loading ? (
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-20 flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110"></div>
                            <Clock className="animate-spin text-primary relative z-10" size={48} strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-mono uppercase tracking-[0.5em] text-primary font-bold animate-pulse">Syncing Criminal Database</p>
                            <p className="text-gray-600 text-[10px] mt-2 font-mono">ENCRYPTED TUNNEL: ESTABLISHED</p>
                        </div>
                    </div>
                ) : cases.length === 0 ? (
                    <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-primary/20 rounded-[2rem] blur opacity-10 transition-opacity"></div>
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-16 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20 shadow-[inset_0_0_30px_rgba(34,197,94,0.05)]">
                                <CheckCircle className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" size={48} strokeWidth={1} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-3">No Active Liabilities</h3>
                            <p className="text-gray-400 max-w-md leading-relaxed">
                                Your digital identifier is not associated with any active legal proceedings or classified investigations.
                            </p>
                            <div className="mt-8 flex gap-3 text-[10px] font-mono">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-500">SYSTEM: NOMINAL</span>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-500">QUERY: 100% MATCH</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {cases.map((c, index) => (
                            <div
                                key={c.id}
                                className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm bg-gradient-to-r ${c.status === 'Active' ? 'from-red-500/20 to-orange-500/20' : 'from-primary/20 to-purple-500/20'}`}></div>

                                <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 text-white opacity-[0.02] pointer-events-none transition-transform duration-700 group-hover:scale-110">
                                        <FileText size={180} strokeWidth={1} />
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-8">
                                        {/* Reference Section */}
                                        <div className="lg:w-64 space-y-4">
                                            <div className="flex items-center justify-between lg:block space-y-1">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Case Sequence</span>
                                                <p className="text-2xl font-mono font-black text-white tracking-tighter group-hover:text-primary transition-colors">
                                                    #{c.caseId || c.id.slice(0, 8).toUpperCase()}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-300 font-mono uppercase tracking-wider">
                                                    <Clock size={12} className="text-gray-500" />
                                                    {c.createdAt?.seconds
                                                        ? new Date(c.createdAt.seconds * 1000).toLocaleDateString()
                                                        : 'UNKNOWN'}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] text-primary font-bold uppercase tracking-wider">
                                                    <Shield size={12} />
                                                    {c.type}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Intel Section */}
                                        <div className="flex-1 space-y-3">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2">
                                                <div className="w-1 h-3 bg-white/20"></div> Detailed Intelligence Brief
                                            </span>
                                            <p className="text-gray-300 text-sm leading-relaxed font-medium">
                                                {c.description}
                                            </p>
                                        </div>

                                        {/* Status Section */}
                                        <div className="lg:w-40 flex flex-col justify-center items-end border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                                            <div className={`flex items-center gap-2 mb-2 px-4 py-2 rounded-2xl border transition-all duration-300
                                                ${c.status === 'Active'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                    : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
                                                {c.status === 'Active' ? <AlertCircle size={14} className="animate-pulse" /> : <CheckCircle size={14} />}
                                                <span className="text-xs font-black uppercase tracking-[0.2em]">{c.status}</span>
                                            </div>
                                            <span className="text-[9px] font-mono text-gray-600 uppercase">Archive ID: {c.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Accent */}
            <div className="flex flex-col items-center gap-4 pt-4">
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <p className="text-[9px] font-mono text-gray-700 uppercase tracking-[0.6em]">End of Dossier Records</p>
            </div>
        </div>
    );
};

export default Cases;
