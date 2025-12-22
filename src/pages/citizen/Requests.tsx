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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Submission Form */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Submit Request</h1>
                <p className="text-gray-400 mb-8">Official channel for government inquiries.</p>

                {submitted ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Send className="text-green-500" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Request Submitted</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Your request has been queued. Check the history panel for updates.
                        </p>
                        <button
                            onClick={() => { setSubmitted(false); setFormData({ category: 'Clarification', subject: '', description: '' }); }}
                            className="text-primary text-sm hover:underline"
                        >
                            Submit Another Request
                        </button>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-gray-500 font-mono tracking-widest">Request Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-primary/50 outline-none transition-colors"
                                >
                                    <option>Clarification</option>
                                    <option>Data Correction</option>
                                    <option>Privacy Conflict</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase text-gray-500 font-mono tracking-widest">Subject</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-primary/50 outline-none transition-colors placeholder:text-gray-700"
                                    placeholder="Brief summary..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase text-gray-500 font-mono tracking-widest">Detailed Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-primary/50 outline-none transition-colors placeholder:text-gray-700 resize-none"
                                    placeholder="Provide details..."
                                />
                            </div>

                            <button disabled={loading} type="submit" className="w-full bg-primary text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                                <Send size={18} /> {loading ? 'Transmitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Right Column: History */}
            <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Clock size={20} className="text-gray-400" /> Request History
                </h2>
                <p className="text-gray-400 mb-8 text-sm">Track the status of your previous inquiries.</p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 overflow-y-auto max-h-[600px] space-y-4 custom-scrollbar">
                    {loadingHistory ? (
                        <div className="text-center text-gray-500 py-10 text-xs font-mono uppercase">Loading History...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            <FileText className="mx-auto mb-2 opacity-20" size={48} />
                            <p className="text-sm">No requests found.</p>
                        </div>
                    ) : (
                        history.map((req) => (
                            <div key={req.id} className="bg-black/20 border border-white/5 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-gray-500">
                                        {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${req.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            req.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        }`}>
                                        {req.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-white text-sm mb-1">{req.subject}</h3>
                                <p className="text-xs text-gray-400 mb-2">{req.category}</p>
                                <p className="text-xs text-slate-500 line-clamp-2 group-hover:line-clamp-none transition-all">
                                    {req.description}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Requests;
