import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, FileText, Activity, Send, LogOut, Shield, Clock } from 'lucide-react';

const CitizenLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return null;

    const navItems = [
        { path: '/citizen/dashboard', icon: Shield, label: 'Dashboard' },
        { path: '/citizen/profile', icon: User, label: 'My Profile' },
        { path: '/citizen/status', icon: Activity, label: 'My Status' },
        { path: '/citizen/cases', icon: FileText, label: 'My Cases' },
        { path: '/citizen/requests', icon: Send, label: 'Requests' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-64 fixed h-full bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <Shield className="w-8 h-8" />
                        <span className="text-xl font-bold tracking-tight">FaceNation</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono tracking-widest pl-1">CITIZEN PORTAL</p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                                ${isActive
                                    ? 'bg-primary/10 text-primary shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.3)] border border-primary/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }
                            `}
                        >
                            <item.icon size={18} />
                            <span className="text-sm font-medium tracking-wide">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                            {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate text-white">{user.name}</p>
                            <p className="text-[10px] text-gray-500 truncate font-mono">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                    >
                        <LogOut size={14} /> Disconnect
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
                {/* Background ambient lighting */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="p-8 max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CitizenLayout;
