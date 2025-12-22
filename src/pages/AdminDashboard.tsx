import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { initializeApp, deleteApp, getApp, getApps } from 'firebase/app';
import { app, firebaseConfig } from '../lib/firebase';
import { UserRole, UserData } from '../types';
import { useAuth } from '../context/AuthContext';
import { Loader2, UserPlus, ShieldAlert, Users, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('Investigating Officer');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [usersList, setUsersList] = useState<UserData[]>([]);

    useEffect(() => {
        const db = getFirestore(app);
        // Real-time listener for users list
        const q = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users: UserData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                users.push({
                    uid: doc.id,
                    email: data.email,
                    role: data.role,
                    name: data.name,
                    active: data.active,
                    createdAt: data.createdAt?.toDate?.().toString() || new Date().toISOString(), // Handle standard timestamp
                    createdBy: data.createdBy
                });
            });
            setUsersList(users);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Use a secondary app to avoid logging out the admin
        const secondaryAppName = "SecondaryApp-" + new Date().getTime();
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);
        const db = getFirestore(app); // Write to main DB

        try {
             const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
             const newUser = userCredential.user;
             
             await setDoc(doc(db, 'users', newUser.uid), {
                 name,
                 email,
                 role,
                 active: true,
                 createdAt: serverTimestamp(),
                 createdBy: user?.uid
             });
             
             setMessage(`Success: Created ${role} "${name}"`);
             setName('');
             setEmail('');
             setPassword('');
             // Clean up secondary app
             await deleteApp(secondaryApp);

        } catch (err: any) {
             console.error(err);
             setMessage(`Error: ${err.message}`);
             // Ensure cleanup on error
             try { await deleteApp(secondaryApp); } catch(e) {}
        } finally {
             setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-mono">
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-red-500 tracking-widest">SYSTEM ADMIN</h1>
                    <p className="text-gray-500 text-sm mt-1">COMMAND CENTER // {user?.name.toUpperCase()}</p>
                </div>
                <button onClick={logout} className="bg-white/10 px-6 py-2 rounded hover:bg-white/20 transition-all text-sm">
                    TERMINATE SESSION
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section>
                    <div className="flex items-center gap-3 mb-6 text-xl text-primary">
                        <UserPlus />
                        <h2>PERSONNEL ONBOARDING</h2>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                        {message && (
                            <div className={`p-3 rounded mb-4 text-xs ${message.startsWith('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">FULL NAME</label>
                                <input 
                                    value={name} onChange={e => setName(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-3 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">OFFICIAL EMAIL</label>
                                <input 
                                    type="email"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-3 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">ASSIGNED ROLE</label>
                                <select 
                                    value={role} onChange={e => setRole(e.target.value as UserRole)}
                                    className="w-full bg-black border border-white/20 p-3 rounded text-white"
                                >
                                    <option value="Investigating Officer">Investigating Officer</option>
                                    <option value="Control Room Operator">Control Room Operator</option>
                                    <option value="Citizen">Citizen</option>
                                    <option value="System Admin">System Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">TEMP PASSWORD</label>
                                <input 
                                    type="password"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-3 rounded"
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded mt-4 flex justify-center items-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                                GENERATE CREDENTIALS
                            </button>
                        </form>
                    </div>
                </section>

                <section>
                     <div className="flex items-center gap-3 mb-6 text-xl text-gray-400">
                        <Users />
                        <h2>PERSONNEL ROSTER</h2>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="p-4">Name / Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {usersList.map((u) => (
                                    <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase border ${
                                                u.role === 'System Admin' ? 'border-red-500/50 text-red-500' :
                                                u.role === 'Investigating Officer' ? 'border-green-500/50 text-green-500' :
                                                u.role === 'Control Room Operator' ? 'border-blue-500/50 text-blue-500' :
                                                'border-gray-500 text-gray-400'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {u.active ? 
                                                <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : 
                                                <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                            }
                                        </td>
                                    </tr>
                                ))}
                                {usersList.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-gray-500">
                                            No personnel records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
