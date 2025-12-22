import React from 'react';
import { LayoutDashboard, Users, FileText, Scan, Bell, User, LogOut } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'search', label: 'Citizen Search', icon: Users },
        { id: 'cases', label: 'Case Files', icon: FileText },
        { id: 'scan', label: 'Biometric Scan', icon: Scan },
        { id: 'alerts', label: 'Alerts', icon: Bell },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    return (
        <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-bold tracking-widest text-green-500">FACENATION</h1>
                <p className="text-[10px] text-gray-500 tracking-[0.2em] mt-1">INVESTIGATION UNIT</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                            activeTab === item.id 
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} />
                    TERMINATE SESSION
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
