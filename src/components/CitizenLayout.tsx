import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, FileText, Activity, Send, LogOut, Shield, Menu, X } from 'lucide-react';

const CitizenLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return null;

    const navItems = [
        { path: '/citizen/dashboard', icon: Shield, label: 'Dashboard' },
        { path: '/citizen/profile', icon: User, label: 'Profile' },
        { path: '/citizen/status', icon: Activity, label: 'Status' },
        { path: '/citizen/cases', icon: FileText, label: 'Cases' },
        { path: '/citizen/requests', icon: Send, label: 'Inquiries' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-primary/30">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 fixed h-full bg-black/40 backdrop-blur-xl border-r border-white/5 flex-col z-50">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 text-primary mb-1 cursor-pointer" onClick={() => navigate('/citizen/dashboard')}>
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg flex-shrink-0">
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

            {/* Mobile Top Header */}
            <header className="md:hidden fixed top-0 w-full z-[60] bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary" onClick={() => navigate('/citizen/dashboard')}>
                    <Shield className="w-6 h-6" />
                    <span className="text-lg font-bold tracking-tighter uppercase tracking-[0.1em]">FaceNation</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold text-white" onClick={() => navigate('/citizen/profile')}>
                        {user.name.charAt(0)}
                    </div>
                    <button onClick={handleLogout} className="text-red-400 p-1">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full z-[60] bg-black/80 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all duration-300 relative
                            ${isActive ? 'text-primary' : 'text-gray-500'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={isActive ? 22 : 20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                    {item.label === 'Dashboard' ? 'Home' : item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 w-8 h-1 bg-primary rounded-full blur-[1px] shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen relative overflow-hidden pt-20 md:pt-0 pb-20 md:pb-0">
                {/* Background ambient lighting */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/5 rounded-full blur-[80px] md:blur-[120px]" />
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CitizenLayout;
