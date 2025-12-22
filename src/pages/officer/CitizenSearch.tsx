import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { UserData, Case } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Search, User, FileText, Clock, Plus, ChevronRight, X } from 'lucide-react';

const CitizenSearch: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const db = getFirestore(app);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<UserData[]>([]);
    const [selectedCitizen, setSelectedCitizen] = useState<UserData | null>(null);
    const [citizenCases, setCitizenCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Create Case Form State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCaseType, setNewCaseType] = useState('Missing Person');
    const [newCaseDesc, setNewCaseDesc] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            // MVP Search: Fetch all citizens and filter (Firestore text search is limited without external tools)
            const q = query(collection(db, 'users'), where('role', '==', 'Citizen'));
            const snapshot = await getDocs(q);
            const allCitizens = snapshot.docs.map(doc => doc.data() as UserData);
            
            const filtered = allCitizens.filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                c.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setResults(filtered);
            setSelectedCitizen(null);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCitizen = async (citizen: UserData) => {
        setSelectedCitizen(citizen);
        setLoading(true);
        try {
            const q = query(
                collection(db, 'cases'), 
                where('subjectId', '==', citizen.uid),
                orderBy('lastUpdated', 'desc')
            );
            const snapshot = await getDocs(q);
            const cases = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Case));
            setCitizenCases(cases);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePendingDuration = (createdAt: any) => {
        if (!createdAt) return 'N/A';
        // Handle Firestore Timestamp or Date string
        const start = createdAt.toDate ? createdAt.toDate() : new Date(createdAt); 
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        return `${diffDays}d ${diffHours}h`;
    };

    const handleCreateCase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCitizen || !user) return;

        try {
            await addDoc(collection(db, 'cases'), {
                type: newCaseType,
                status: 'Active',
                subjectName: selectedCitizen.name,
                subjectId: selectedCitizen.uid,
                assignedOfficerId: user.uid,
                description: newCaseDesc,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp()
            });
            setShowCreateForm(false);
            setNewCaseDesc('');
            // Refresh cases
            handleSelectCitizen(selectedCitizen);
            showToast('Case File Created Successfully', 'success');
        } catch (error: any) {
            console.error("Error creating case:", error);
            showToast(`Failed to create case: ${error.message || 'Unknown Error'}`, 'error');
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            {/* Left Panel: Search & Results */}
            <div className={`w-full md:w-1/3 bg-[#111] border border-white/5 rounded-lg flex flex-col ${selectedCitizen ? 'hidden md:flex' : ''}`}>
                <div className="p-4 border-b border-white/10">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search Citizen Name/ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-white/20 rounded pl-10 pr-4 py-2 text-sm focus:border-green-500 outline-none transition-colors"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    </form>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading && !selectedCitizen && <div className="text-center p-4 text-gray-500">Searching database...</div>}
                    {results.map(citizen => (
                        <div 
                            key={citizen.uid}
                            onClick={() => handleSelectCitizen(citizen)}
                            className={`p-3 rounded border cursor-pointer transition-all ${
                                selectedCitizen?.uid === citizen.uid 
                                ? 'bg-green-500/10 border-green-500' 
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                            }`}
                        >
                            <div className="font-bold text-sm">{citizen.name}</div>
                            <div className="text-xs text-gray-500">{citizen.email}</div>
                        </div>
                    ))}
                    {results.length === 0 && !loading && (
                        <div className="text-center p-8 text-gray-600 text-sm">
                            Enter name to search citizen registry.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Detail View */}
            <div className={`w-full md:w-2/3 bg-[#111] border border-white/5 rounded-lg flex flex-col ${!selectedCitizen ? 'hidden md:flex items-center justify-center' : ''}`}>
                {!selectedCitizen ? (
                    <div className="text-gray-600 flex flex-col items-center">
                        <User size={48} className="mb-4 opacity-20" />
                        <p>Select a citizen to view dossier</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                    {selectedCitizen.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedCitizen.name}</h2>
                                    <p className="text-xs text-gray-400 font-mono">ID: {selectedCitizen.uid}</p>
                                    <p className="text-xs text-gray-500 mt-1">{selectedCitizen.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowCreateForm(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2"
                            >
                                <Plus size={14} /> NEW CASE
                            </button>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10">
                            <div className="bg-black p-4 rounded border border-white/10 text-center">
                                <div className="text-2xl font-bold text-white">{citizenCases.length}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Total Records</div>
                            </div>
                            <div className="bg-black p-4 rounded border border-white/10 text-center">
                                <div className="text-2xl font-bold text-red-500">
                                    {citizenCases.filter(c => c.status === 'Active').length}
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase">Active Cases</div>
                            </div>
                            <div className="bg-black p-4 rounded border border-white/10 text-center">
                                <div className="text-2xl font-bold text-blue-500">
                                    {citizenCases.reduce((acc, c) => acc + (c.status === 'Active' ? 1 : 0), 0) > 0 ? "HIGH" : "LOW"}
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase">Risk Level</div>
                            </div>
                        </div>

                        {/* Case History List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                                <FileText size={16} /> CASE HISTORY
                            </h3>
                            <div className="space-y-4">
                                {citizenCases.map(c => (
                                    <div key={c.uid} className="bg-white/5 border border-white/10 rounded p-4 relative overflow-hidden">
                                        {c.status === 'Active' && (
                                            <div className="absolute top-0 right-0 p-2 bg-red-500/10 text-red-500 text-[10px] font-bold flex items-center gap-1 rounded-bl">
                                                <Clock size={10} />
                                                PENDING: {calculatePendingDuration(c.createdAt)}
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`text-xs px-2 py-0.5 rounded border ${
                                                    c.type === 'Missing Person' ? 'border-yellow-500/50 text-yellow-500' : 'border-red-500/50 text-red-500'
                                                }`}>
                                                    {c.type}
                                                </span>
                                                <h4 className="font-bold mt-2 text-sm">CASE #{c.uid.slice(0, 8).toUpperCase()}</h4>
                                            </div>
                                            {c.status === 'Closed' && <span className="text-xs text-gray-500 font-mono">CLOSED</span>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{c.description}</p>
                                        <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-600 flex justify-between">
                                            <span>Officer ID: {c.assignedOfficerId}</span>
                                            <span>Updated: {(c.lastUpdated as any)?.toDate ? (c.lastUpdated as any).toDate().toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                ))}
                                {citizenCases.length === 0 && (
                                    <div className="text-center text-sm text-gray-600 py-8">
                                        No criminal or investigation records found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create Case Modal Overlay */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/20 rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">OPEN NEW CASE FILE</h3>
                            <button onClick={() => setShowCreateForm(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreateCase} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">SUBJECT</label>
                                <input disabled value={selectedCitizen?.name} className="w-full bg-black border border-white/10 p-2 rounded text-gray-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">CLASSIFICATION</label>
                                <select 
                                    value={newCaseType} 
                                    onChange={e => setNewCaseType(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-2 rounded text-white"
                                >
                                    <option>Missing Person</option>
                                    <option>High-Value Suspect</option>
                                    <option>Criminal Record</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">BRIEFING / DETAILS</label>
                                <textarea 
                                    value={newCaseDesc}
                                    onChange={e => setNewCaseDesc(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-2 rounded h-24 text-sm"
                                    placeholder="Enter case details..."
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded mt-2">
                                SUBMIT TO DATABASE
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenSearch;
