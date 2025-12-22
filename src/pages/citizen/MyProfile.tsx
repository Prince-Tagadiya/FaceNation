import React from 'react';
import { User, Mail, MapPin, Fingerprint, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MyProfile: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-purple-600/20 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-full bg-black border-4 border-black flex items-center justify-center relative z-10">
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                            <p className="text-gray-400 font-mono text-sm">{user?.role}</p>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-mono uppercase tracking-wider">
                            Verified Citizen
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="space-y-6">
                            <h3 className="text-sm uppercase text-gray-500 font-bold tracking-widest border-b border-white/10 pb-2">Personal Information</h3>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-500 font-mono">Email Address</p>
                                    <p className="text-sm text-white">{user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                                    <Fingerprint size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-500 font-mono">Citizen ID</p>
                                    <p className="text-sm text-white font-mono">{user?.uid}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-500 font-mono">Date of Registration</p>
                                    <p className="text-sm text-white">December 22, 2024</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm uppercase text-gray-500 font-bold tracking-widest border-b border-white/10 pb-2">Location & Privacy</h3>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-500 font-mono">Registered Region</p>
                                    <p className="text-sm text-white">Sector 4, FaceNation Capital</p>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mt-4">
                                <p className="text-primary text-xs font-bold mb-1">Privacy Level: HIGH</p>
                                <p className="text-gray-400 text-xs text-justify">
                                    Your profile is currently protected under the Citizen Privacy Act. Only authorized Investigating Officers with a warrant can access your full activity logs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
