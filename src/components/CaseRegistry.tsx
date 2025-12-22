import React, { useState, useEffect } from 'react';
import { X, Search, FileText, User, Calendar, Filter, Loader } from 'lucide-react';
import { Case, CaseStatus, CaseType } from '../types';
import { getFirestore, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { app } from '../lib/firebase';

interface CaseRegistryProps {
    onClose: () => void;
}

const CaseRegistry: React.FC<CaseRegistryProps> = ({ onClose }) => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | CaseStatus>('All');
    const [typeFilter, setTypeFilter] = useState<'All' | CaseType>('All');

    // Fetch Real Data from Firestore
    useEffect(() => {
        const db = getFirestore(app);
        // Fetch all cases, ordered by lastUpdated descending
        // Note: You might need a composite index for this query if it gets complex, 
        // but for now simple collection fetching + client sort is fine for small datasets,
        // or just fetch all and sort client side.
        const q = query(collection(db, 'cases'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCases = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            } as Case));

            // Client-side sort to ensure correct order even if server index is missing
            fetchedCases.sort((a, b) => {
                const dateA = (a.lastUpdated as any)?.toDate?.() || new Date(a.lastUpdated || 0);
                const dateB = (b.lastUpdated as any)?.toDate?.() || new Date(b.lastUpdated || 0);
                return dateB.getTime() - dateA.getTime();
            });

            setCases(fetchedCases);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching cases:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredCases = cases.filter(c => {
        const matchesSearch = (c.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.uid || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesType = typeFilter === 'All' || c.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const formatDate = (dateVal: any) => {
        if (!dateVal) return 'N/A';
        if (dateVal.toDate) return dateVal.toDate().toLocaleDateString();
        return new Date(dateVal).toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <FileText className="text-purple-500 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-white">CASE REGISTRY</h1>
                        <p className="text-xs text-gray-500 font-mono">CENTRAL DATABASE // LIVE REPOSITORY</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block">
                    <X className="text-white w-6 h-6" />
                </button>
                <button onClick={onClose} className="md:hidden p-2 text-white">
                    <X size={24} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 flex items-center gap-2">
                    <Search className="text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Name or Case ID..."
                        className="bg-transparent border-none outline-none text-white py-3 flex-1 text-sm font-mono w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm font-mono outline-none flex-1 md:flex-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <select
                        className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm font-mono outline-none flex-1 md:flex-none"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                    >
                        <option value="All">All Types</option>
                        <option value="Missing Person">Missing Person</option>
                        <option value="High-Value Suspect">High-Value Suspect</option>
                        <option value="Criminal Record">Criminal Record</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-lg bg-white/5 overflow-hidden flex-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader className="animate-spin text-purple-500" size={32} />
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="grid grid-cols-12 bg-black/50 p-4 border-b border-white/10 text-xs text-gray-400 font-mono uppercase tracking-widest font-bold hidden md:grid">
                            <div className="col-span-2">Case ID</div>
                            <div className="col-span-3">Citizen Name</div>
                            <div className="col-span-3">Type</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Last Updated</div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar p-2 md:p-0">
                            {filteredCases.length > 0 ? (
                                filteredCases.map((c) => (
                                    <div key={c.uid} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center text-sm group gap-2 md:gap-0 bg-white/5 md:bg-transparent rounded mb-2 md:mb-0 border md:border-none border-white/10">
                                        <div className="col-span-2 font-mono text-purple-400 flex justify-between md:block">
                                            <span className="md:hidden text-gray-500 text-xs">ID:</span>
                                            {c.uid}
                                        </div>
                                        <div className="col-span-3 font-bold text-white flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-700 md:flex items-center justify-center text-[10px] text-gray-300 hidden">
                                                <User size={12} />
                                            </div>
                                            {c.subjectName}
                                        </div>
                                        <div className="col-span-3 text-gray-300 font-mono text-xs flex justify-between md:block">
                                            <span className="md:hidden text-gray-500 text-xs">TYPE:</span>
                                            {c.type}
                                        </div>
                                        <div className="col-span-2 flex justify-between md:block">
                                            <span className="md:hidden text-gray-500 text-xs">STATUS:</span>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${c.status === 'Active'
                                                    ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-right text-gray-500 font-mono text-xs flex items-center justify-between md:justify-end gap-2">
                                            <span className="md:hidden text-gray-500 text-xs">UPDATED:</span>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="hidden md:block" />
                                                {formatDate(c.lastUpdated)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500 font-mono">
                                    NO RECORDS FOUND MATCHING QUERY
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="mt-4 text-right text-xs text-gray-600 font-mono">
                TOTAL RECORDS: {loading ? '...' : cases.length} // FILTERED: {loading ? '...' : filteredCases.length}
            </div>
        </div>
    );
};

export default CaseRegistry;
