import React, { useState, useRef, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Camera, Scan, AlertCircle, CheckCircle, X, Loader2, User, FileText, Calendar, Phone, MapPin, Shield } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface MatchResult {
    citizenId: string;
    citizenName: string;
    citizenEmail: string;
    confidence: number;
    explanation: string;
    faceRef: string;
    distance: number;
}

const ScanDemo: React.FC = () => {
    const { user } = useAuth();
    const db = getFirestore(app);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [cameraActive, setCameraActive] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [noMatch, setNoMatch] = useState(false);
    const [error, setError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');

    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);

    // Profile Modal State
    const [showProfile, setShowProfile] = useState(false);
    const [citizenProfile, setCitizenProfile] = useState<any>(null);
    const [citizenCases, setCitizenCases] = useState<any[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // 1. Load Models & Prepare Database
    useEffect(() => {
        const loadModels = async () => {
            try {
                setLoadingMessage('Loading biometric models...');
                // Load models from public/models folder
                // Note: Switched to TinyFaceDetector as those files are present
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                setModelsLoaded(true);
                setLoadingMessage('');
                console.log("FaceAPI Models Loaded");
            } catch (err) {
                console.error("Error loading models:", err);
                setError("Failed to load biometric models. Please check your connection.");
            }
        };
        loadModels();
    }, []);

    // 2. Build Face Matcher (The "Backend" Logic)
    // Fetches all citizen faces and creates descriptors
    const buildFaceDatabase = async () => {
        setLoadingMessage('Building citizen face database (Processing one by one)...');
        try {
            const citizensQuery = query(
                collection(db, 'users'), 
                where('role', '==', 'Citizen'),
                limit(50) 
            );
            const snapshot = await getDocs(citizensQuery);
            
            const labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];

            // Iterate one by one
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (!data.faceRef) continue;

                try {
                    // Fetch image and detect face
                    const img = await faceapi.fetchImage(data.faceRef);
                    // Use TinyFaceDetectorOptions
                    const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
                    
                    if (detection) {
                        // Create labeled descriptor using ID and Name (separator for parsing later)
                        // Format: "ID###Name###Email###URL"
                        const label = `${doc.id}###${data.name}###${data.email}###${data.faceRef}`;
                        labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]));
                    }
                } catch (e) {
                    // Skip bad images
                    console.warn(`Could not process face for ${data.name}`, e);
                }
            }

            if (labeledDescriptors.length > 0) {
                // Initialize Matcher with 0.6 distance threshold
                const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
                setFaceMatcher(matcher);
                console.log(`Database built with ${labeledDescriptors.length} faces.`);
                return true;
            } else {
                setError("No valid faces found in database to compare against.");
                return false;
            }

        } catch (err: any) {
            console.error("Database build error:", err);
            setError(`Database Error: ${err.message}`);
            return false;
        }
    };


    // Start webcam
    const startCamera = async () => {
        try {
            setError('');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraActive(true);
            }
            
            // Build database in background if not ready
            if (!faceMatcher) {
                await buildFaceDatabase();
            }

        } catch (err: any) {
            console.error('Error accessing camera:', err);
            setError('Camera access denied or unavailable.');
        }
    };

    // Stop webcam
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    };

    // Scan using Local FaceAPI
    const scanFace = async () => {
        if (!videoRef.current || !faceMatcher) {
            if (!faceMatcher) setError("Biometric database not ready. Please wait.");
            return;
        }
        
        setScanning(true);
        setMatchResult(null);
        setNoMatch(false);
        setError('');
        setLoadingMessage('Scanning...');

        try {
            // Detect face in webcam feed
            const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

            if (!detection) {
                setError("No face detected in camera. Please look directly at the lens.");
                setScanning(false);
                setLoadingMessage('');
                return;
            }

            // Compare!
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

            if (bestMatch.label !== 'unknown') {
                // Parse our custom label "ID###Name###Email###URL"
                const [id, name, email, url] = bestMatch.label.split('###');
                
                const confidence = Math.round((1 - bestMatch.distance) * 100);

                const result: MatchResult = {
                    citizenId: id,
                    citizenName: name,
                    citizenEmail: email,
                    confidence: confidence, // heuristic 
                    explanation: `Biometric match confirmed. Euclidian distance: ${bestMatch.distance.toFixed(4)}`,
                    faceRef: url,
                    distance: bestMatch.distance
                };

                setMatchResult(result);
                await createMatchAlert(result);

                // Draw box
                if (canvasRef.current && videoRef.current) {
                    const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
                    const resizedDetections = faceapi.resizeResults(detection, dims);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                }

            } else {
                setNoMatch(true);
            }

        } catch (err: any) {
            console.error('Scan error:', err);
            setError(`Scan Failed: ${err.message}`);
        } finally {
            setScanning(false);
            setLoadingMessage('');
        }
    };
    // Create alert in Firestore
    const createMatchAlert = async (match: MatchResult) => {
        if (!user) return;
        try {
            const { sanitizeForFirestore, generateAlertId } = await import('../../lib/firestoreHelpers');
            const alertData = {
                alertId: generateAlertId(),
                citizenId: match.citizenId,
                citizenName: match.citizenName,
                officerId: user.uid,
                confidence: match.confidence,
                status: 'New',
                timestamp: serverTimestamp(),
                details: `Biometric Logic Hit: ${match.explanation}`
            };
            await addDoc(collection(db, 'alerts'), sanitizeForFirestore(alertData));
        } catch (err) {
            console.error('Error creating alert:', err);
        }
    };

    const resetScan = () => {
        setMatchResult(null);
        setNoMatch(false);
        setError('');
        setShowProfile(false);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleViewProfile = async () => {
            if (!matchResult) return;
            
            setLoadingProfile(true);
            setShowProfile(true);
            try {
                // 1. Fetch Full Citizen Profile
                const userDocRef = doc(db, 'users', matchResult.citizenId);
                const userSnap = await getDoc(userDocRef);
                let currentName = matchResult.citizenName;

                if (userSnap.exists()) {
                    setCitizenProfile({ id: userSnap.id, ...userSnap.data() });
                    if (userSnap.data().name) currentName = userSnap.data().name;
                }
    
                // 2. Fetch Associated Cases
                // Strategy: Query by BOTH subjectId AND subjectName to ensure we catch all records
                // Some older cases might only have the name attached
                const casesByIdQuery = query(
                    collection(db, 'cases'),
                    where('subjectId', '==', matchResult.citizenId),
                    limit(20)
                );
                
                const casesByNameQuery = query(
                    collection(db, 'cases'),
                    where('subjectName', '==', currentName),
                    limit(20)
                );
                
                const [snapId, snapName] = await Promise.all([
                    getDocs(casesByIdQuery),
                    getDocs(casesByNameQuery)
                ]);

                // Merge and Deduplicate
                const uniqueCases = new Map();
                
                snapId.docs.forEach(doc => {
                    uniqueCases.set(doc.id, { id: doc.id, ...doc.data() });
                });

                snapName.docs.forEach(doc => {
                    uniqueCases.set(doc.id, { id: doc.id, ...doc.data() });
                });

                const cases = Array.from(uniqueCases.values());
    
                // Sort in memory (Newest first)
                cases.sort((a: any, b: any) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });
    
                setCitizenCases(cases);
    
            } catch (err) {
                console.error("Error fetching details:", err);
                setCitizenCases([]); 
            } finally {
                setLoadingProfile(false);
            }
        };

    return (
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Camera className="text-blue-500" />
                    F.R.A.M.E.S (Biometric Detection)
                </h2>
                <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                    <Shield size={12} />
                    SYSTEM ONLINE - Using Neural Network (Tiny Face Detector)
                </p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Webcam Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase">Bio-Metric Feed</h3>
                    
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                        />
                         {/* Canvas for Drawing Box */}
                        <canvas 
                            ref={canvasRef} 
                            className={`absolute inset-0 pointer-events-none ${cameraActive ? 'block' : 'hidden'}`} 
                        />

                        {/* Overlays */}
                        {(scanning || !modelsLoaded || loadingMessage) && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                                <div className="text-center text-white">
                                    <Loader2 className="animate-spin mx-auto mb-2" size={48} />
                                    <p className="text-sm">{loadingMessage || 'Initializing Neural Networks...'}</p>
                                </div>
                            </div>
                        )}
                        
                        {!cameraActive && modelsLoaded && !loadingMessage ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                                <button
                                    onClick={startCamera}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Camera size={20} />
                                    Initialize Camera
                                </button>
                            </div>
                        ) : null}
                    </div>

                    {/* Camera Controls */}
                    {cameraActive && (
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={scanFace}
                                disabled={scanning || !faceMatcher}
                                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                            >
                                <Scan size={18} />
                                {scanning ? 'Comparing...' : faceMatcher ? 'Scan & Compare' : 'Building Database...'}
                            </button>
                            <button
                                onClick={stopCamera}
                                className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}
                     <div className="mt-2 text-[10px] text-slate-500 text-center">
                        Status: {faceMatcher ? `${faceMatcher.labeledDescriptors.length} Citizens Loaded` : 'Waiting for Database...'}
                     </div>
                </div>

                {/* Results Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase">Detection Results</h3>
                    
                    {!matchResult && !noMatch && !error && (
                        <div className="h-full flex items-center justify-center text-slate-600">
                            <div className="text-center">
                                <User size={48} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Ready for input...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                            <AlertCircle size={18} className="inline mr-2" />
                            {error}
                        </div>
                    )}

                    {noMatch && (
                        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-6 text-center">
                            <CheckCircle size={48} className="mx-auto mb-3 text-gray-500" />
                            <h4 className="text-xl font-bold text-gray-400 mb-2">UNKNOWN SUBJECT</h4>
                            <p className="text-xs text-gray-600">No match found in current database threshold (0.6)</p>
                            <button
                                onClick={resetScan}
                                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    )}

                    {matchResult && (
                        <div className="bg-blue-950/20 border-2 border-blue-500/50 rounded-lg p-6 animate-in zoom-in duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center animate-pulse">
                                    <CheckCircle size={24} className="text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-blue-500">IDENTITY VERIFIED</h4>
                                    <p className="text-xs text-blue-400">Match found in records</p>
                                </div>
                            </div>

                            <div className="mb-4 flex justify-center">
                                <div className="relative group">
                                    <img 
                                        src={matchResult.faceRef ? `${matchResult.faceRef}?t=${Date.now()}` : ''}
                                        alt="Matched Record" 
                                        className="w-32 h-32 rounded-lg object-cover border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                    />
                                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse pointer-events-none"></div>
                                </div>
                            </div>

                            <div className="space-y-3 bg-slate-950/50 rounded p-4 text-sm font-mono">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">NAME:</span>
                                    <span className="text-white font-bold">{matchResult.citizenName}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">EMAIL:</span>
                                    <span className="text-slate-300 text-xs">{matchResult.citizenEmail}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">MATCH SCORE:</span>
                                    <span className="text-green-400 font-bold">{matchResult.confidence}%</span>
                                </div>
                            </div>

                             <div className="mt-4 grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleViewProfile}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileText size={16} />
                                    Full Profile
                                </button>
                                <button
                                    onClick={resetScan}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                                >
                                    Next Scan
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Shield className="text-blue-500" />
                                    CITIZEN PROFILE
                                </h2>
                            </div>
                            <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingProfile ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500"><Loader2 className="animate-spin mb-4" size={48} /><p>Loading...</p></div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-black rounded-xl overflow-hidden border-2 border-slate-800 shadow-lg">
                                            <img src={matchResult?.faceRef} alt="Profile" className="w-full h-auto object-cover aspect-square"/>
                                            <div className="p-4 text-center">
                                                <h3 className="text-xl font-bold text-white">{citizenProfile?.name || matchResult?.citizenName}</h3>
                                                <p className="text-blue-400 text-sm font-mono mt-1">{citizenProfile?.aadhaar || 'ID: ' + matchResult?.citizenId.substring(0,8)}</p>
                                            </div>
                                        </div>
                                         <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center gap-3 text-slate-300"><Phone size={16} className="text-slate-500" /><span className="text-sm">{citizenProfile?.phone || 'No phone'}</span></div>
                                            <div className="flex items-center gap-3 text-slate-300"><Calendar size={16} className="text-slate-500" /><span className="text-sm">{citizenProfile?.dob || 'No DOB'}</span></div>
                                            <div className="flex items-center gap-3 text-slate-300"><MapPin size={16} className="text-slate-500" /><span className="text-sm">{citizenProfile?.address || 'No address'}</span></div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 space-y-6">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText size={20} className="text-amber-500" />Registered Cases</h3>
                                        {citizenCases.length > 0 ? (
                                            <div className="space-y-3">
                                                {citizenCases.map((incident) => (
                                                    <div key={incident.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-200">{incident.title || 'Untitled'}</h4><span className="text-xs text-slate-400">{incident.status}</span></div>
                                                        <p className="text-sm text-slate-400 line-clamp-2">{incident.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="p-8 text-center text-slate-500">No cases found</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanDemo;
