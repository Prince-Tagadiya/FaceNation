import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../lib/firebase';
import { Shield, UserPlus, LogOut, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user?.role === 'Citizen') {
            navigate('/citizen/dashboard');
        }
    }, [user, navigate]);

    if (user?.role === 'Citizen') return null;

    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('Investigating Officer');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.role !== 'System Admin') return;

        setLoading(true);
        setMessage('');

        // We use the primary app for Firestore (so we use the Admin's write permissions)
        const db = getFirestore(app);

        // Initialize a secondary app to create the user without logging out the admin
        let secondaryApp: any;
        try {
            // Import dynamically to avoid top-level side effects if possible, but standard import is fine too
            const { initializeApp } = await import("firebase/app");
            const { firebaseConfig } = await import("../lib/firebase");

            // precise timestamp to ensure unique app name
            const appName = `secondary-${Date.now()}`;
            secondaryApp = initializeApp(firebaseConfig, appName);
            const secondaryAuth = getAuth(secondaryApp);

            // Create Authentication User on the secondary app
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUserEmail, newUserPassword);
            const uid = userCredential.user.uid;

            // Force sign out the secondary user so the secondary app instance is clean
            await secondaryAuth.signOut();

            // Create Firestore Document using the PRIMARY auth (Admin's session)
            await setDoc(doc(db, 'users', uid), {
                email: newUserEmail,
                name: newUserName,
                role: newUserRole,
                createdAt: new Date().toISOString()
            });

            setMessage(`Success: User ${newUserName} [${newUserRole}] created.`);
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserName('');
        } catch (error: any) {
            console.error("Creation Error:", error);
            setMessage(`Error: ${error.message}`);
        } finally {
            // Cleanup secondary app
            if (secondaryApp) {
                // deleteApp is not strictly required for GC but good practice if available. 
                // however, in standard web SDK deleteApp is async. 
                // We'll just let it go out of scope or explicitly delete if imported (deleteApp requires firebase/app)
                const { deleteApp } = await import("firebase/app");
                await deleteApp(secondaryApp).catch(console.error);
            }
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return <div className="text-white p-10 font-mono">Redirecting...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a10] text-white font-sans">
            <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${user.role === 'System Admin' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-wider uppercase">{user.role} CONSOLE</h1>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest">{user.uid.slice(0, 8)}...</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-mono hover:text-red-400 transition-colors uppercase tracking-wider">
                    <LogOut size={14} /> Terminate Session
                </button>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                {user.role === 'System Admin' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <UserPlus className="text-primary" />
                                <h2 className="text-lg font-bold tracking-tight">Register New Personnel</h2>
                            </div>

                            {message && (
                                <div className={`p-4 mb-6 rounded-lg text-xs font-mono border ${message.startsWith('Success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Full Name</label>
                                        <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm focus:border-primary/50 outline-none" placeholder="Officer Name" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Role Assignment</label>
                                        <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm focus:border-primary/50 outline-none text-gray-300">
                                            <option value="System Admin">System Admin</option>
                                            <option value="Investigating Officer">Investigating Officer</option>
                                            <option value="Control Room Operator">Control Room Operator</option>
                                            <option value="Citizen">Citizen</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Email Address</label>
                                    <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm focus:border-primary/50 outline-none" placeholder="official@dept.gov" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Temporary Password</label>
                                    <input required type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm focus:border-primary/50 outline-none" placeholder="••••••••" />
                                </div>

                                <button disabled={loading} type="submit" className="w-full bg-primary text-black font-bold uppercase tracking-widest text-xs py-4 rounded hover:bg-primary/90 mt-4 transition-all">
                                    {loading ? 'Processing...' : 'Authorize & Create Account'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-50">
                            <Shield size={48} className="text-gray-600 mb-4" />
                            <h3 className="text-lg font-bold mb-2">System Audit Logs</h3>
                            <p className="text-xs text-gray-500 font-mono">Connect this panel to monitoring stream.</p>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 animate-pulse">
                            <CheckCircle size={40} className="text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Authentication Verified</h1>
                        <p className="text-gray-400 font-mono text-sm max-w-md mx-auto mb-8">
                            Welcome back, <span className="text-primary">{user.name}</span>. Your session as <span className="text-white border-b border-white/20 pb-0.5">{user.role}</span> is active and being monitored.
                        </p>
                        <div className="p-4 bg-white/5 rounded border border-white/10 text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
                            Secure Connection Established
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
