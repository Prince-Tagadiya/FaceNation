import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { app } from '../../lib/firebase';

const Requests: React.FC = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        category: 'Clarification',
        subject: '',
        description: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

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
                status: 'Pending', // Pending, Reviewed, Resolved
                createdAt: serverTimestamp(),
                read: false
            });

            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting request:", error);
            // Optionally set an error state here to show to user
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto min-h-[50vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <Send className="text-green-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Request Submitted</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    Your request has been securely transmitted to the relevant department. You will receive a memo in your status feed once reviewed.
                </p>
                <button
                    onClick={() => { setSubmitted(false); setFormData({ category: 'Clarification', subject: '', description: '' }); }}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                >
                    Submit Another Request
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Submit Request</h1>
            <p className="text-gray-400 mb-8">Official channel for government inquiries and clarifications.</p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-8 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                    <AlertCircle className="text-yellow-500 shrink-0" size={24} />
                    <div className="text-sm">
                        <p className="text-yellow-200 font-bold mb-1">Submission Guidelines</p>
                        <ul className="text-yellow-500/80 list-disc pl-4 space-y-1">
                            <li>Requests are subject to automated audit.</li>
                            <li>Do not include sensitive personal keys in the description.</li>
                            <li><strong>Strictly Prohibited:</strong> No file uploads, no external links, no search queries.</li>
                        </ul>
                    </div>
                </div>

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
                            placeholder="Brief summary of your request"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-500 font-mono tracking-widest">Detailed Description</label>
                        <textarea
                            required
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-primary/50 outline-none transition-colors placeholder:text-gray-700 resize-none"
                            placeholder="Please provide specific details..."
                        />
                    </div>

                    <div className="pt-4">
                        <button disabled={loading} type="submit" className="w-full bg-primary text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                            <Send size={18} /> {loading ? 'Transmitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Requests;
