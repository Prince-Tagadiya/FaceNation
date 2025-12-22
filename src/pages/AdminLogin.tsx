import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';
import { app } from '../lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth(app);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // Strict Role Check for Admin
            const userDoc = await getDoc(doc(getFirestore(app), 'users', uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.active === false) {
                    throw new Error('Account Deactivated');
                }
                if (userData.role !== 'System Admin') {
                    throw new Error('Insufficient Clearance');
                }
                // Success
                navigate('/admin');
            } else {
                throw new Error('User profile not found');
            }
        } catch (err: any) {
            console.error(err);
            await auth.signOut();
            setError(`Security Alert: ${err.message || 'Authentication Failed'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-black pointer-events-none" />
            <div className="absolute w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-lg relative z-10 shadow-2xl shadow-blue-900/20">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 bg-slate-800 rounded mb-4 border border-slate-700">
                        <ShieldAlert className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-[0.2em] uppercase font-mono text-center">Admin Console</h1>
                    <p className="text-slate-500 text-[10px] mt-2 font-mono tracking-widest uppercase">Authorized Access Only</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-xs font-mono leading-relaxed uppercase">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono ml-1">Secure ID</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            placeholder="admin@facenation.gov"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono ml-1">Passphrase</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            placeholder="••••••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-xs"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Establish Connection'}
                    </button>

                    <div className="text-center mt-6">
                        <a href="/login" className="text-[10px] text-slate-600 hover:text-slate-400 font-mono uppercase tracking-wider transition-colors">
                            Return to Standard Access
                        </a>
                    </div>
                </form>
            </div>

            <div className="absolute bottom-4 text-[10px] text-slate-700 font-mono">
                ERR_CONNECTION_SECURE_V4.2
            </div>
        </div>
    );
};

export default AdminLogin;
