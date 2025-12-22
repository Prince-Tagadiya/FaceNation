import React, { useEffect, useState } from 'react';
import { FileText, Shield, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '../../lib/firebase';

interface CaseData {
    id: string;
    caseNumber: string;
    caseType: string;
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

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Cases</h1>
                    <p className="text-gray-400">Legal records, investigations, and judicial matters linked to your identity.</p>
                </div>
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                    <FileText className="text-gray-400" size={20} />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
                        <Clock className="animate-spin text-primary" size={32} />
                        <p className="text-xs font-mono uppercase tracking-widest">Retrieving Legal Records...</p>
                    </div>
                ) : cases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="text-green-500" size={32} />
                        </div>
                        <p className="text-lg font-bold text-white">No Record Found</p>
                        <p className="text-sm">You have no active or archived cases.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/20">
                                    <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Case Number</th>
                                    <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Severity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {cases.map((c) => (
                                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-sm text-white font-medium">
                                            {c.caseNumber}
                                            <p className="text-xs text-gray-500 truncate max-w-[200px] mt-1 pr-4">{c.description}</p>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400 font-mono">
                                            {c.createdAt?.seconds
                                                ? new Date(c.createdAt.seconds * 1000).toLocaleDateString()
                                                : 'N/A'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            <span className="inline-flex items-center gap-2">
                                                <Shield size={12} className="text-gray-500" />
                                                {c.caseType}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize
                                                ${c.status === 'Open' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                                                    c.status === 'Closed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                {c.status === 'Open' ? <AlertCircle size={10} /> : <CheckCircle size={10} />}
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`h-1.5 w-4 rounded-full ${i === 1 ? 'bg-green-500' :
                                                        i === 2 && (c.severity === 'Medium' || c.severity === 'High') ? 'bg-yellow-500' :
                                                            i === 3 && c.severity === 'High' ? 'bg-red-500' :
                                                                'bg-white/10'
                                                        }`} />
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cases;
