import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, collection, onSnapshot, query, orderBy, limit, getDoc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { app, firebaseConfig } from '../lib/firebase';
import { UserRole, UserData, AuditLog, SystemSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { logAction } from '../lib/audit';
import {
    Loader2, UserPlus, Users, Trash2, Eye, EyeOff,
    FileText, Shield, Activity, RefreshCw, Lock, Globe,
    LayoutDashboard, Settings, UserCog, AlertCircle, Ban, CheckCircle, Save
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Tabs
    const [activeTab, setActiveTab] = useState<'overview' | 'personnel' | 'audit' | 'settings'>('overview');

    // Data State
    const [usersList, setUsersList] = useState<UserData[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [settings, setSettings] = useState<SystemSettings>({
        confidenceThreshold: 85,
        caseExpiryDays: 30,
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Form State for User Creation
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('Investigating Officer');
    const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

    // User Management State
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const filteredUsers = usersList.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    useEffect(() => {
        const db = getFirestore(app);

        // 1. Subscribe to Users
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
            const users: UserData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.role !== 'System Admin') {
                    users.push({
                        uid: doc.id,
                        email: data.email,
                        role: data.role,
                        name: data.name,
                        active: data.active,
                        createdAt: (data.createdAt as any)?.toDate?.().toISOString() || new Date().toISOString(),
                        createdBy: data.createdBy,
                        tempPassword: data.tempPassword
                    });
                }
            });
            setUsersList(users);
        });

        // 2. Subscribe to Audit Logs
        const logsQuery = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
        const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
            const logs: AuditLog[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                logs.push({
                    id: doc.id,
                    action: data.action,
                    target: data.target,
                    adminId: data.adminId,
                    adminName: data.adminName,
                    adminRole: data.adminRole, // Ensure this is captured
                    timestamp: (data.timestamp as any)?.toDate?.().toISOString() || new Date().toISOString(),
                    details: data.details
                });
            });
            setAuditLogs(logs);
        });

        // 3. Get Settings
        const fetchSettings = async () => {
            const docRef = doc(db, 'settings', 'system_config');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data() as SystemSettings);
            }
        };
        fetchSettings();

        // 4. Mock Data for Overview (Cases/Alerts - since we don't have real backend for them yet)
        return () => {
            unsubUsers();
            unsubLogs();
        };
    }, []);

    // --- ACTIONS ---

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setMessage('');

        const secondaryAppName = "SecondaryApp-" + new Date().getTime();
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);
        const db = getFirestore(app);

        try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const newUser = userCredential.user;

            await setDoc(doc(db, 'users', newUser.uid), {
                name,
                email,
                role,
                active: true,
                tempPassword: password,
                createdAt: serverTimestamp(),
                createdBy: user.uid
            });

            await logAction('CREATE_USER', `User: ${email}`, user.uid, user.name, user.role, `Role: ${role}, UID: ${newUser.uid}`);
            setMessage(`Success: Created ${role} "${name}"`);
            setName(''); setEmail(''); setPassword('');
            await deleteApp(secondaryApp);
        } catch (err: any) {
            console.error(err);
            setMessage(`Error: ${err.message}`);
            try { await deleteApp(secondaryApp); } catch (e) { }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUserStatus = async (uid: string, currentStatus: boolean, userName: string) => {
        if (!user) return;
        const action = currentStatus ? 'DISABLE' : 'ENABLE';
        if (!window.confirm(`Confirm: ${action} access for ${userName}?`)) return;

        try {
            const db = getFirestore(app);
            await updateDoc(doc(db, 'users', uid), { active: !currentStatus });
            await logAction(`${action}_USER`, `User: ${userName}`, user.uid, user.name, user.role, `UID: ${uid}`);
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };

    const handleDeleteUser = async (uid: string, targetName: string) => {
        if (!user) return;
        if (!window.confirm(`PERMANENT DELETION: ${targetName}? This cannot be undone.`)) return;

        try {
            const db = getFirestore(app);
            await deleteDoc(doc(db, 'users', uid));
            await logAction('DELETE_USER', `User: ${targetName}`, user.uid, user.name, user.role, `UID: ${uid}`);
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user record.");
        }
    };

    const handleSaveSettings = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const db = getFirestore(app);
            const newSettings = {
                ...settings,
                updatedAt: new Date().toISOString(),
                updatedBy: user.name
            };
            await setDoc(doc(db, 'settings', 'system_config'), newSettings);
            setSettings(newSettings);
            await logAction('UPDATE_SETTINGS', 'System Configuration', user.uid, user.name, user.role, `Threshold: ${settings.confidenceThreshold}%, Expiry: ${settings.caseExpiryDays}d`);
            alert("Settings Saved Successfully.");
        } catch (err) {
            console.error(err);
            alert("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (uid: string) => {
        setShowPassword(prev => ({ ...prev, [uid]: !prev[uid] }));
    };

    // Derived Counts
    const activeUsersCount = usersList.filter(u => u.active).length;
    // Mock counts for now
    const totalCases = 142;
    const activeAlerts = 3;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            {/* TOP BAR */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-900/20 border border-blue-500/30 rounded flex items-center justify-center">
                        <Shield className="text-blue-500" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white leading-none">FACENATION <span className="text-slate-500">|</span> ADMIN CONSOLE</h1>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            SECURE CONNECTION // ENCRYPTED
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                        <div className="text-xs text-slate-400 font-mono">ADMINISTRATOR</div>
                        <div className="text-sm font-bold text-white">{user?.name}</div>
                    </div>
                    <div className="h-8 w-px bg-slate-800"></div>
                    <button onClick={logout} className="bg-red-900/20 text-red-500 border border-red-900/30 hover:bg-red-900/30 px-4 py-2 rounded text-xs font-bold tracking-wider transition-all">
                        LOGOUT
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
                {/* SIDEBAR NAVIGATION */}
                <aside className="w-full lg:w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col gap-2">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <LayoutDashboard size={18} /> SYSTEM OVERVIEW
                    </button>
                    <button onClick={() => setActiveTab('personnel')} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${activeTab === 'personnel' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <UserCog size={18} /> USER MANAGEMENT
                    </button>
                    <button onClick={() => setActiveTab('audit')} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${activeTab === 'audit' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <FileText size={18} /> AUDIT LOGS
                    </button>
                    <div className="flex-1"></div>
                    <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <Settings size={18} /> SYSTEM SETTINGS
                    </button>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 p-6 overflow-y-auto bg-slate-950 relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <LayoutDashboard className="text-blue-500" /> SYSTEM STATUS
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Users size={64} />
                                    </div>
                                    <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">Active Personnel</div>
                                    <div className="text-4xl font-bold text-white">{activeUsersCount}</div>
                                    <div className="text-xs text-green-500 mt-2 flex items-center gap-1">
                                        <Activity size={12} /> Online
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FileText size={64} />
                                    </div>
                                    <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">Total Cases Processed</div>
                                    <div className="text-4xl font-bold text-white">{totalCases}</div>
                                    <div className="text-xs text-blue-500 mt-2">Archived: 104</div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <AlertCircle size={64} />
                                    </div>
                                    <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">Active Alerts</div>
                                    <div className="text-4xl font-bold text-red-500">{activeAlerts}</div>
                                    <div className="text-xs text-red-400 mt-2 animate-pulse">Immediate Attention Required</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg h-64 flex items-center justify-center text-slate-500 font-mono text-sm">
                                    [SYSTEM LOAD ANALYTICS PLACEHOLDER]
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg h-64 flex items-center justify-center text-slate-500 font-mono text-sm">
                                    [RECENT ACTIVITY MAP STREAM]
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USER MANAGEMENT TAB */}
                    {activeTab === 'personnel' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <UserCog className="text-emerald-500" /> PERSONNEL MANAGEMENT
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                {/* Create User Form */}
                                <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-6 h-fit">
                                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">
                                        Register New Agent
                                    </h3>
                                    {message && (
                                        <div className={`p-3 rounded text-xs font-mono mb-4 border ${message.startsWith('Error') ? 'bg-red-950/30 border-red-900/30 text-red-400' : 'bg-green-950/30 border-green-900/30 text-green-400'}`}>
                                            {message}
                                        </div>
                                    )}
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-slate-500 font-mono">Full Name</label>
                                            <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-slate-500 font-mono">Official Email</label>
                                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-slate-500 font-mono">Role Assignment</label>
                                            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none text-slate-300">
                                                <option value="System Admin">System Admin</option>
                                                <option value="Investigating Officer">Investigating Officer</option>
                                                <option value="Control Room Operator">Control Room Operator</option>
                                                <option value="Citizen">Citizen</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-slate-500 font-mono">Temporary Password</label>
                                            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                        <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs uppercase tracking-widest mt-2 flex justify-center items-center gap-2">
                                            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Create Credentials'}
                                        </button>
                                    </form>
                                </div>

                                {/* User List */}
                                <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col max-h-[700px]">
                                    <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Active Roster</h3>
                                    </div>

                                    {/* Filters & Search - NEW ADDITION */}
                                    <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-800 bg-slate-900/50">
                                        <div className="relative">
                                            <input
                                                placeholder="Search by name..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded pl-8 p-2 text-xs focus:border-blue-500 outline-none text-white placeholder-slate-600"
                                            />
                                            <UserCog className="absolute left-2.5 top-2 text-slate-600" size={14} />
                                        </div>
                                        <select
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            className="bg-slate-950 border border-slate-700 rounded p-2 text-xs focus:border-blue-500 outline-none text-slate-300"
                                        >
                                            <option value="All">All Roles</option>
                                            <option value="Investigating Officer">Investigating Officer</option>
                                            <option value="Control Room Operator">Control Room Operator</option>
                                            <option value="Citizen">Citizen</option>
                                        </select>
                                    </div>

                                    <div className="overflow-auto flex-1">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase sticky top-0 z-10">
                                                <tr>
                                                    <th className="p-4">Personnel</th>
                                                    <th className="p-4">Role</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 text-right">Controls</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {filteredUsers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-8 text-center text-slate-500 text-xs italic">
                                                            No matches found.
                                                        </td>
                                                    </tr>
                                                ) : filteredUsers.map((u) => (
                                                    <tr key={u.uid} className="hover:bg-slate-800/30">
                                                        <td className="p-4">
                                                            <div className="font-bold text-white">{u.name}</div>
                                                            <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                                                            {u.tempPassword && (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400 font-mono">
                                                                        {showPassword[u.uid] ? u.tempPassword : '••••••'}
                                                                    </span>
                                                                    <button onClick={() => togglePasswordVisibility(u.uid)} className="text-slate-500 hover:text-white">
                                                                        {showPassword[u.uid] ? <EyeOff size={10} /> : <Eye size={10} />}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${u.role === 'Investigating Officer' ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' :
                                                                u.role === 'Control Room Operator' ? 'bg-cyan-900/20 text-cyan-500 border-cyan-900/30' :
                                                                    'bg-slate-800 text-slate-400'
                                                                }`}>{u.role}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            {u.active ?
                                                                <span className="text-green-500 text-xs flex items-center gap-1"><CheckCircle size={12} /> Active</span> :
                                                                <span className="text-red-500 text-xs flex items-center gap-1"><Ban size={12} /> Disabled</span>
                                                            }
                                                        </td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <button
                                                                onClick={() => setSelectedUser(u)}
                                                                className="text-slate-600 hover:text-blue-500 hover:bg-blue-900/20 p-1.5 rounded transition-colors"
                                                                title="View Profile"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleUserStatus(u.uid, u.active, u.name)}
                                                                className={`p-1.5 rounded transition-colors ${u.active ? 'text-amber-500 hover:bg-amber-900/20' : 'text-green-500 hover:bg-green-900/20'}`}
                                                                title={u.active ? "Disable Access" : "Enable Access"}
                                                            >
                                                                {u.active ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u.uid, u.name)}
                                                                className="text-slate-600 hover:text-red-500 hover:bg-red-900/20 p-1.5 rounded transition-colors"
                                                                title="Delete Permanently"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* User Profile Modal */}
                            {selectedUser && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <EyeOff size={20} />
                                        </button>

                                        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 text-center border-b border-slate-800">
                                            <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center border-4 border-slate-700 mb-4 shadow-xl">
                                                <span className="text-4xl font-bold text-slate-400">{selectedUser.name.charAt(0)}</span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-white mb-1">{selectedUser.name}</h2>
                                            <p className="text-sm text-slate-400 font-mono tracking-widest uppercase">{selectedUser.role}</p>
                                        </div>

                                        <div className="p-8 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                                    <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">Status</p>
                                                    <p className={`font-bold ${selectedUser.active ? 'text-green-500' : 'text-red-500'}`}>
                                                        {selectedUser.active ? 'ACTIVE' : 'DISABLED'}
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                                    <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">User ID</p>
                                                    <p className="text-xs text-slate-300 font-mono truncate" title={selectedUser.uid}>{selectedUser.uid.slice(0, 12)}...</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                                    <span className="text-sm text-slate-400">Email Address</span>
                                                    <span className="text-sm text-white font-medium">{selectedUser.email}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                                    <span className="text-sm text-slate-400">Registration Date</span>
                                                    <span className="text-sm text-white font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                                    <span className="text-sm text-slate-400">Created By</span>
                                                    <span className="text-xs text-slate-500 font-mono">{selectedUser.createdBy || 'SYSTEM'}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    onClick={() => setSelectedUser(null)}
                                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors uppercase tracking-widest"
                                                >
                                                    Close Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AUDIT LOGS TAB */}
                    {
                        activeTab === 'audit' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <FileText className="text-amber-500" /> SYSTEM AUDIT LOGS
                                </h2>
                                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                                    <div className="max-h-[700px] overflow-auto">
                                        <table className="w-full text-left text-sm font-mono">
                                            <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase sticky top-0 z-10">
                                                <tr>
                                                    <th className="p-4 w-48">Timestamp</th>
                                                    <th className="p-4 w-32">Role</th>
                                                    <th className="p-4 w-48">Agent</th>
                                                    <th className="p-4 w-32">Action</th>
                                                    <th className="p-4">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {auditLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-slate-800/30">
                                                        <td className="p-4 text-slate-400">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-[10px] font-bold text-purple-400 bg-purple-900/10 px-2 py-0.5 rounded border border-purple-500/20">
                                                                {log.adminRole || 'System'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-slate-300">
                                                            {log.adminName}
                                                            <div className="text-[9px] text-slate-600 opacity-50">{log.adminId}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.action.includes('DELETE') ? 'text-red-500 bg-red-900/10' :
                                                                log.action.includes('CREATE') ? 'text-green-500 bg-green-900/10' :
                                                                    'text-blue-500 bg-blue-900/10'
                                                                }`}>{log.action}</span>
                                                        </td>
                                                        <td className="p-4 text-slate-400">
                                                            <div className="text-slate-200">{log.target}</div>
                                                            <div className="text-[10px] text-slate-600">{log.details}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* SETTINGS TAB */}
                    {
                        activeTab === 'settings' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Settings className="text-purple-500" /> GLOBAL CONFIGURATION
                                </h2>

                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                                    <div>
                                        <h3 className="text-white font-bold mb-4 border-b border-slate-800 pb-2">Matching Algorithms</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Face Match Confidence Threshold (%)</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="range" min="50" max="99"
                                                        value={settings.confidenceThreshold}
                                                        onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseInt(e.target.value) })}
                                                        className="flex-1 accent-purple-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <span className="text-xl font-bold text-purple-400 font-mono w-12 text-right">{settings.confidenceThreshold}%</span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">Matches below this percentage will be flagged for manual review.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-white font-bold mb-4 border-b border-slate-800 pb-2">Data Retention Policy</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Case File Expiry (Days)</label>
                                                <input
                                                    type="number"
                                                    value={settings.caseExpiryDays}
                                                    onChange={(e) => setSettings({ ...settings, caseExpiryDays: parseInt(e.target.value) })}
                                                    className="bg-slate-950 border border-slate-700 rounded p-2 text-white w-32 focus:border-purple-500 outline-none"
                                                />
                                                <p className="text-xs text-slate-600 mt-1">Closed cases will be auto-archived after this period.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                                        <div className="text-xs text-slate-500 font-mono">
                                            Last Updated: {new Date(settings.updatedAt).toLocaleDateString()} by {settings.updatedBy}
                                        </div>
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={loading}
                                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                            SAVE CONFIGURATION
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </main >
            </div >
        </div >
    );
};

export default AdminDashboard;
