import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { UserData } from '../types';
import {
    Users, Search, Upload, Camera, Loader2, CheckCircle, AlertCircle, X,
    Shield
} from 'lucide-react';

const CitizenManagement: React.FC = () => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [citizens, setCitizens] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Upload State
    const [selectedCitizen, setSelectedCitizen] = useState<UserData | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadImage, setUploadImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCitizens();
    }, []);

    const fetchCitizens = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'Citizen'));
            const snapshot = await getDocs(q);
            const citizensData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData));
            setCitizens(citizensData);
        } catch (error) {
            console.error("Error fetching citizens:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setUploadError('Please select a valid image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadImage(reader.result as string);
                setUploadError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedCitizen || !uploadImage || !user) return;

        setIsUploading(true);
        setUploadError('');

        try {
            // 1. Send to API Server (Vite Middleware) to save file
            const response = await fetch('/api/upload-face-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    citizenId: selectedCitizen.uid,
                    imageData: uploadImage,
                    adminUid: user.uid,
                    adminName: user.name || 'Admin',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to upload image');
            }

            // 2. Update Firestore with metadata
            // Use the path returned by server, or construct it.
            // Server returns { success: true, path: '/faces/...' }
            const faceRef = data.path || `/faces/${selectedCitizen.uid}.jpg`;
            
            await updateDoc(doc(db, 'users', selectedCitizen.uid), {
                faceRef: faceRef,
                faceCapturedAt: serverTimestamp(),
                faceCapturedBy: user.uid
            });

            setUploadSuccess(true);
            
            // Refresh list to show new image (with cache busting)
            await fetchCitizens();

            // Auto close after success
            setTimeout(() => {
                closeModal();
            }, 2000);

        } catch (error: any) {
            console.error("Upload error:", error);
            setUploadError(error.message || 'An error occurred during upload');
        } finally {
            setIsUploading(false);
        }
    };

    const closeModal = () => {
        setIsUploadModalOpen(false);
        setSelectedCitizen(null);
        setUploadImage(null);
        setUploadSuccess(false);
        setUploadError('');
    };

    const filteredCitizens = citizens.filter(citizen => 
        citizen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (citizen.email && citizen.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="text-blue-500" />
                        Citizen Registry
                    </h2>
                    <p className="text-slate-400 text-sm">Manage citizen profiles and biometric data</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search citizens..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
                    {filteredCitizens.map(citizen => (
                        <div key={citizen.uid} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors relative group">
                            <div className="flex flex-col items-center mb-4">
                                <div className="relative w-24 h-24 mb-3">
                                    {citizen.faceRef ? (
                                        <img 
                                            src={`${citizen.faceRef}?t=${Date.now()}`} // Cache busting 
                                            alt={citizen.name}
                                            className="w-full h-full rounded-full object-cover border-2 border-blue-500/50"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + citizen.name;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 border-dashed">
                                            <Camera className="text-slate-600" size={32} />
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => {
                                            setSelectedCitizen(citizen);
                                            setIsUploadModalOpen(true);
                                        }}
                                        className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg transition-transform transform scale-90 group-hover:scale-100"
                                        title="Update Face Image"
                                    >
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <h3 className="text-white font-bold text-center">{citizen.name}</h3>
                                <p className="text-slate-500 text-xs text-center">{citizen.email}</p>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                                <span>Status: <span className="text-green-400">Active</span></span>
                                <span>ID: {citizen.uid.substring(0, 8)}...</span>
                            </div>
                        </div>
                    ))}
                    
                    {filteredCitizens.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                            No citizens found matching your search.
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && selectedCitizen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 relative shadow-2xl">
                        <button 
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                             Update Face Entry
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">Upload a generic, front-facing photo for <span className="text-blue-400">{selectedCitizen.name}</span>.</p>

                        {!uploadImage ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-all"
                            >
                                <Upload className="text-slate-500 mb-4 group-hover:text-blue-500" size={48} />
                                <p className="text-slate-300 font-medium">Click to select image</p>
                                <p className="text-slate-500 text-xs mt-2">JPG, PNG supported (Max 5MB)</p>
                            </div>
                        ) : (
                            <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black flex justify-center">
                                <img src={uploadImage} alt="Preview" className="max-w-full h-64 object-contain" />
                                <button 
                                    onClick={() => setUploadImage(null)}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white p-1 rounded-full transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />

                        {uploadError && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs flex items-center gap-2">
                                <AlertCircle size={16} />
                                {uploadError}
                            </div>
                        )}

                        {uploadSuccess && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs flex items-center gap-2 animate-in fade-in">
                                <CheckCircle size={16} />
                                Upload successful! Database updated.
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button 
                                onClick={closeModal}
                                disabled={isUploading}
                                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpload}
                                disabled={!uploadImage || isUploading || uploadSuccess}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Processing...
                                    </>
                                ) : (
                                    'Save Image'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenManagement;
