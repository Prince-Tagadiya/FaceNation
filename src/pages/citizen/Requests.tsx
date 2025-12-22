import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, Clock, FileText } from 'lucide-react';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { app } from '../../lib/firebase';

interface RequestData {
    id: string;
    category: string;
    subject: string;
    description: string;
    status: 'Pending' | 'Reviewed' | 'Resolved' | 'Rejected';
    createdAt: any;
}

const Requests: React.FC = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        category: 'Clarification',
        subject: '',
        description: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // History State
    const [history, setHistory] = useState<RequestData[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Fetch History
    useEffect(() => {
        if (!user) return;
        const db = getFirestore(app);
        const q = query(collection(db, 'requests'), where('uid', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RequestData[];
            fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setHistory(fetched);
            setLoadingHistory(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const db = getFirestore(app);
            await addDoc(collection(db, 'requests'), {
                uid: user.uid,
                citizenName: user.name,
                email: user.email,
                category: formData.category,
                subject: formData.subject,
                description: formData.description,
                status: 'Pending',
                createdAt: serverTimestamp(),
                read: false
            });

            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting request:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Styled Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Send className="text-primary" size={18} />
                    </div>
                    <span className="text-xs font-mono text-primary uppercase tracking-[0.2em] font-bold">Communications Link</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Inquiry Protocol</h1>
                <p className="text-gray-400 font-medium text-sm md:text-base">Official encrypted channel for government data synchronization and clarification.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column: Submission Form */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-[2rem] blur opacity-10 transition-opacity"></div>

                    <div className="relative bg-[#080808]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10">
                        {submitted ? (
                            <div className="py-12 text-center space-y-6">
                                <div className="relative inline-block">
                                    <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                        <Send className="text-green-500" size={32} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Transmission Successful</h2>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                        Your inquiry has been encrypted and queued for review by the Central Oversight Committee.
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setSubmitted(false); setFormData({ category: 'Clarification', subject: '', description: '' }); }}
                                    className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black font-mono text-primary uppercase tracking-[0.2em] hover:bg-primary/5 hover:border-primary/30 transition-all"
                                >
                                    Initiate New Inquiry
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">New Inquiry Dispatch</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase text-gray-600 font-mono tracking-widest font-black">Designation</label>
                                        <div className="relative group/select">
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer group-hover/select:bg-black/60"
                                            >
                                                <option>Clarification</option>
                                                <option>Data Correction</option>
                                                <option>Privacy Conflict</option>
                                                <option>Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                                <AlertCircle size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase text-gray-600 font-mono tracking-widest font-black">Subject Header</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-800"
                                            placeholder="CRYPTO-HEADER SUMMARY"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase text-gray-600 font-mono tracking-widest font-black">Intelligence Detail</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-800 resize-none"
                                            placeholder="PROVIDE FULL DISCLOSURE DATA..."
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full group/btn relative overflow-hidden bg-primary py-4 rounded-2xl transition-all hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                                    <div className="relative flex items-center justify-center gap-3 text-black font-black uppercase tracking-[0.2em] text-xs">
                                        <Send size={18} />
                                        {loading ? 'Transmitting Data...' : 'Dispatch Inquiry'}
                                    </div>
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-gray-500" />
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Dispatch History</h2>
                        </div>
                        <span className="text-[10px] font-mono text-gray-700 tracking-widest uppercase">{history.length} RECORDS FOUND</span>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-2 flex-1 overflow-hidden flex flex-col min-h-[500px]">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {loadingHistory ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-mono tracking-[0.3em] uppercase">Syncing Records</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-6 py-20 opacity-20">
                                    <FileText size={64} strokeWidth={1} />
                                    <p className="text-xs font-mono tracking-[0.3em] uppercase">No Archived Communications</p>
                                </div>
                            ) : (
                                history.map((req, idx) => (
                                    <div
                                        key={req.id}
                                        className="relative group/item"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-transparent rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                        <div className="relative p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="px-2.5 py-1 bg-black/40 rounded-lg border border-white/5">
                                                    <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-widest">
                                                        {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'REAL-TIME'}
                                                    </span>
                                                </div>
                                                <div className={`text-[9px] font-black tracking-[0.15em] px-3 py-1 rounded-full border shadow-sm uppercase
                                                    ${req.status === 'Resolved' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                                                        req.status === 'Rejected' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                                            'text-yellow-400 border-yellow-500/30 bg-yellow-400/10'}`}>
                                                    {req.status}
                                                </div>
                                            </div>

                                            <div className="space-y-1 mb-4">
                                                <p className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest">{req.category}</p>
                                                <h3 className="font-black text-white text-base tracking-tight">{req.subject}</h3>
                                            </div>

                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 group-hover/item:line-clamp-none transition-all font-medium">
                                                {req.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Requests;
