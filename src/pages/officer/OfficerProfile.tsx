import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Key, Mail } from 'lucide-react';

const OfficerProfile: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto flex items-center justify-center text-gray-400 mb-4 border-2 border-green-500/50">
                    <User size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold tracking-wider mt-2 inline-block">
                    {user?.role.toUpperCase()}
                </span>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-lg p-6 space-y-6">
                 <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-4 border-b border-white/5 pb-2">CREDENTIALS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded flex items-center gap-3">
                            <Mail className="text-blue-500" size={20} />
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">Official Email</div>
                                <div className="text-sm">{user?.email}</div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded flex items-center gap-3">
                            <Key className="text-yellow-500" size={20} />
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">System UID</div>
                                <div className="font-mono text-xs">{user?.uid}</div>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-4 border-b border-white/5 pb-2">SECURITY CLEARANCE</h3>
                    <div className="bg-green-900/10 border border-green-500/20 p-4 rounded flex items-start gap-4">
                        <Shield className="text-green-500 shrink-0" size={24} />
                        <div>
                            <div className="font-bold text-green-400 text-sm">LEVEL 4 ACCESS GRANTED</div>
                            <p className="text-xs text-gray-400 mt-1">
                                Authorized for creating case files, accessing citizen registry, and utilizing biometric surveillance tools.
                            </p>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default OfficerProfile;
