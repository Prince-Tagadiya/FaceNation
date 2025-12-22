import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Case } from '../../types';
import { FileText, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

const CaseManagement: React.FC = () => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [cases, setCases] = useState<Case[]>([]);
    const [filter, setFilter] = useState<'All' | 'Active' | 'Closed'>('All');

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'cases'), 
            where('assignedOfficerId', '==', user.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCases = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Case));
            // Client-side sort by lastUpdated desc (or timestamp) since compound keys might be needed for server sort
            fetchedCases.sort((a, b) => {
                const dateA = (a.lastUpdated as any)?.toDate ? (a.lastUpdated as any).toDate() : new Date(a.lastUpdated || 0);
                const dateB = (b.lastUpdated as any)?.toDate ? (b.lastUpdated as any).toDate() : new Date(b.lastUpdated || 0);
                return dateB.getTime() - dateA.getTime();
            });
            setCases(fetchedCases);
        });
        return () => unsubscribe();
    }, [user, db]);

    const toggleStatus = async (caseId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
            await updateDoc(doc(db, 'cases', caseId), {
                status: newStatus,
                lastUpdated: serverTimestamp()
            });
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const filteredCases = cases.filter(c => filter === 'All' || c.status === filter);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setFilter('All')} 
                        className={`text-sm px-3 py-1 rounded border ${filter === 'All' ? 'bg-white/10 border-white/30 text-white' : 'border-transparent text-gray-500'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('Active')} 
                        className={`text-sm px-3 py-1 rounded border ${filter === 'Active' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'border-transparent text-gray-500'}`}
                    >
                        Active
                    </button>
                     <button 
                        onClick={() => setFilter('Closed')} 
                        className={`text-sm px-3 py-1 rounded border ${filter === 'Closed' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'border-transparent text-gray-500'}`}
                    >
                        Closed
                    </button>
                 </div>
                 <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Filter size={12} />
                    FILTER VIEW
                 </div>
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto">
                {filteredCases.map((c) => (
                    <div key={c.uid} className="bg-[#111] border border-white/5 p-4 rounded-lg hover:border-white/10 transition-colors flex justify-between items-center">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded bg-white/5 ${c.status === 'Active' ? 'text-red-500' : 'text-green-500'}`}>
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    {c.subjectName}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        c.type === 'Missing Person' ? 'border-yellow-500/30 text-yellow-500' : 'border-purple-500/30 text-purple-500'
                                    }`}>
                                        {c.type.toUpperCase()}
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-[400px]">{c.description}</p>
                                <div className="text-[10px] text-gray-600 mt-2 font-mono flex items-center gap-3">
                                    <span>ID: {c.uid}</span>
                                    <span>UPDATED: {(c.lastUpdated as any)?.toDate ? (c.lastUpdated as any).toDate().toLocaleString() : 'N/A'}</span>
                                    {c.status === 'Active' && 
                                        <span className="text-red-500/50 flex items-center gap-1">
                                            <Clock size={10} /> ACTIVE
                                        </span>
                                    }
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => toggleStatus(c.uid, c.status)}
                            className={`px-4 py-2 rounded text-xs font-bold border transition-all ${
                                c.status === 'Active' 
                                ? 'border-green-500/30 text-green-500 hover:bg-green-500/10' 
                                : 'border-gray-500/30 text-gray-500 hover:bg-white/5'
                            }`}
                        >
                            {c.status === 'Active' ? 'MARK CLOSED' : 'REOPEN CASE'}
                        </button>
                    </div>
                ))}

                {filteredCases.length === 0 && (
                    <div className="text-center text-gray-600 py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                        No case files found matching criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaseManagement;
