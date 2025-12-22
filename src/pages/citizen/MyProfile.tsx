import React from 'react';
import { User, Mail, MapPin, Fingerprint, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MyProfile: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header / Navigation Label */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <User className="text-primary" size={18} />
                    </div>
                    <span className="text-xs font-mono text-primary uppercase tracking-[0.2em] font-bold">Dossier Access</span>
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">System Identity</h1>
            </div>

            <div className="relative group">
                {/* Background Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-[2rem] blur opacity-20 transition-opacity"></div>

                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden">
                    {/* Premium Banner */}
                    <div className="h-48 bg-[#0a0a0a] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'radial-gradient(#00f0ff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                        <div className="absolute top-0 right-0 p-8">
                            <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                <span className="text-[10px] font-mono font-black text-green-500 tracking-widest uppercase">Verified Identity</span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Overlay */}
                    <div className="px-10 pb-12 relative">
                        <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-16">
                            <div className="relative group/avatar">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-purple-500 rounded-3xl blur opacity-40 group-hover/avatar:opacity-60 transition-opacity"></div>
                                <div className="relative w-32 h-32 rounded-3xl bg-black border-4 border-black overflow-hidden flex items-center justify-center shadow-2xl">
                                    <div className="w-full h-full bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center text-4xl font-black text-white/90">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2 mb-2">
                                <h2 className="text-4xl font-black text-white tracking-tighter">{user?.name}</h2>
                                <div className="flex flex-wrap gap-3">
                                    <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                                        {user?.role}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                        ACCESS: LEVEL 4
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Dossier Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                            {/* Primary Intel */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="p-1 bg-white/[0.02] border border-white/5 rounded-3xl">
                                    <div className="bg-black/40 backdrop-blur-md rounded-[1.4rem] p-8 space-y-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Core Biometrics</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                            <div className="group/item">
                                                <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest mb-2 group-hover/item:text-primary transition-colors">Digital Envelope</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                                        <Mail size={18} />
                                                    </div>
                                                    <p className="text-sm text-white font-medium">{user?.email}</p>
                                                </div>
                                            </div>

                                            <div className="group/item">
                                                <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest mb-2 group-hover/item:text-primary transition-colors">Citizen Identifier</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                                        <Fingerprint size={18} />
                                                    </div>
                                                    <p className="text-sm text-white font-mono tracking-tighter opacity-80">{user?.uid}</p>
                                                </div>
                                            </div>

                                            <div className="group/item">
                                                <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest mb-2 group-hover/item:text-primary transition-colors">Registration Epoch</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <p className="text-sm text-white font-medium">DEC-22-2024</p>
                                                </div>
                                            </div>

                                            <div className="group/item">
                                                <p className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest mb-2 group-hover/item:text-primary transition-colors">Jurisdiction</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <p className="text-sm text-white font-medium">Sector 4, FaceNation</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Sidebar Stats */}
                            <div className="space-y-6">
                                <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl relative overflow-hidden group/privacy shadow-[0_0_20px_rgba(0,240,255,0.03)]">
                                    <div className="absolute -top-4 -right-4 text-primary opacity-[0.03] group-hover/privacy:scale-110 transition-transform duration-700">
                                        <Fingerprint size={120} />
                                    </div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Encryption Status</h4>
                                        </div>
                                        <p className="text-2xl font-black text-white mb-2">MAXIMUM</p>
                                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                            Identity protected under Act 2045. Full isolation protocol active.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-mono font-black text-gray-500">TRUST SCORE</span>
                                            <span className="text-[10px] font-mono font-black text-green-500">98.4%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[98.4%] bg-gradient-to-r from-green-500 to-primary"></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-mono text-gray-600">
                                            <span>MIN: 60%</span>
                                            <span>SYNCED</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
                                    <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">End of Metadata</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
