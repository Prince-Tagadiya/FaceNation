import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Camera, Scan, AlertCircle, CheckCircle, X, Loader2, User } from 'lucide-react';

interface MatchResult {
    citizenId: string;
    citizenName: string;
    citizenEmail: string;
    confidence: number;
    distance: number;
    faceRef: string;
}

const FaceScannerDemo: React.FC = () => {
    const { user } = useAuth();
    const db = getFirestore(app);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [noMatch, setNoMatch] = useState(false);
    const [error, setError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');

    // Load face-api.js models
    useEffect(() => {
        const loadModels = async () => {
            try {
                setLoadingMessage('Loading AI models from local...');
                const LOCAL_MODEL_URL = '/models'; 
                
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL),
                ]);
                
                setModelsLoaded(true);
                setLoadingMessage('');
            } catch (err) {
                console.warn('Local model load failed, trying CDN...', err);
                setLoadingMessage('Local models not found. Fetching from CDN...');
                
                try {
                    // Fallback to CDN
                    const CDN_MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                    await Promise.all([
                        faceapi.nets.tinyFaceDetector.loadFromUri(CDN_MODEL_URL),
                        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_MODEL_URL),
                        faceapi.nets.faceRecognitionNet.loadFromUri(CDN_MODEL_URL),
                    ]);
                    setModelsLoaded(true);
                    setLoadingMessage('');
                } catch (cdnErr) {
                    console.error('Error loading models from CDN:', cdnErr);
                    setError(`Failed to load AI models: ${(cdnErr as Error).message}`);
                }
            }
        };
        
        loadModels();
    }, []);

    // Start webcam
    const startCamera = async () => {
        try {
            console.log('Requesting camera access...');
            setError('');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            
            console.log('Camera access granted, stream:', stream.id);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Important: Explicitly play the video
                await videoRef.current.play();
                setCameraActive(true);
                console.log('Video stream started');
            } else {
                console.error('Video reference is null');
                setError('Internal error: Video element not initialized');
            }
        } catch (err: any) {
            console.error('Error accessing camera:', err);
            
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera device found on your system.');
            } else {
                setError(`Camera error: ${err.message || 'Unknown error'}`);
            }
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

    // Scan face and compare
    const scanFace = async () => {
        if (!videoRef.current || !modelsLoaded || !user) return;
        
        setScanning(true);
        setMatchResult(null);
        setNoMatch(false);
        setError('');
        setLoadingMessage('Detecting face...');

        try {
            // Detect face in webcam
            const detection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                setError('No face detected. Please position your face in the camera.');
                setScanning(false);
                setLoadingMessage('');
                return;
            }

            setLoadingMessage('Face detected! Comparing with database...');

            // Get all citizens with face images
            const citizensQuery = query(
                collection(db, 'users'),
                where('role', '==', 'Citizen'),
                where('faceRef', '!=', null)
            );
            
            const snapshot = await getDocs(citizensQuery);
            
            if (snapshot.empty) {
                setNoMatch(true);
                setScanning(false);
                setLoadingMessage('');
                return;
            }

            let bestMatch: MatchResult | null = null;
            let bestDistance = 1.0; // Lower is better, threshold typically 0.6

            // Compare with each citizen's face
            for (const doc of snapshot.docs) {
                const citizenData = doc.data();
                const faceRef = citizenData.faceRef;
                
                if (!faceRef) continue;

                try {
                    // Load reference image
                    const img = await faceapi.fetchImage(faceRef);
                    const referenceDetection = await faceapi
                        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!referenceDetection) continue;

                    // Calculate Euclidean distance
                    const distance = faceapi.euclideanDistance(
                        detection.descriptor,
                        referenceDetection.descriptor
                    );

                    // Lower distance = better match
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestMatch = {
                            citizenId: doc.id,
                            citizenName: citizenData.name,
                            citizenEmail: citizenData.email,
                            distance: distance,
                            confidence: Math.round((1 - distance) * 100),
                            faceRef: faceRef
                        };
                    }
                } catch (imgError) {
                    console.log(`Failed to load face for ${citizenData.name}:`, imgError);
                }
            }

            // Match threshold: 0.6 (standard for face-api.js)
            if (bestMatch && bestMatch.distance < 0.6) {
                setMatchResult(bestMatch);
                
                // Create alert for the match
                await createMatchAlert(bestMatch);
            } else {
                setNoMatch(true);
            }

        } catch (err) {
            console.error('Scan error:', err);
            setError('An error occurred during face scanning. Please try again.');
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
                details: `Face match detected via Officer Scan - Confidence: ${match.confidence}%`
            };

            const safeAlertData = sanitizeForFirestore(alertData);
            await addDoc(collection(db, 'alerts'), safeAlertData);
        } catch (err) {
            console.error('Error creating alert:', err);
        }
    };

    const resetScan = () => {
        setMatchResult(null);
        setNoMatch(false);
        setError('');
    };

    return (
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Camera className="text-blue-500" />
                    FACE SCAN & VERIFICATION
                </h2>
                <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    DEMO MODULE - Workflow validation only, not production biometric system
                </p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Webcam Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase">Live Camera Feed</h3>
                    
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                        {!modelsLoaded ? (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                <div className="text-center">
                                    <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                                    <p className="text-xs">{loadingMessage}</p>
                                </div>
                            </div>
                        ) : !cameraActive ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                    onClick={startCamera}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Camera size={20} />
                                    Start Camera
                                </button>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="absolute inset-0" />
                                
                                {scanning && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <Loader2 className="animate-spin mx-auto mb-2" size={48} />
                                            <p className="text-sm">{loadingMessage}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Camera Controls */}
                    {cameraActive && (
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={scanFace}
                                disabled={scanning || !modelsLoaded}
                                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                            >
                                <Scan size={18} />
                                {scanning ? 'Scanning...' : 'Scan Face'}
                            </button>
                            <button
                                onClick={stopCamera}
                                className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase">Scan Results</h3>
                    
                    {!matchResult && !noMatch && !error && (
                        <div className="h-full flex items-center justify-center text-slate-600">
                            <div className="text-center">
                                <User size={48} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Awaiting scan...</p>
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
                            <h4 className="text-xl font-bold text-gray-400 mb-2">NO MATCH FOUND</h4>
                            <p className="text-xs text-gray-600">No matching citizen profile in database</p>
                            <button
                                onClick={resetScan}
                                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    )}

                    {matchResult && (
                        <div className="bg-red-950/20 border-2 border-red-500/50 rounded-lg p-6 animate-in zoom-in duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center animate-pulse">
                                    <AlertCircle size={24} className="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-red-500">POSITIVE MATCH</h4>
                                    <p className="text-xs text-red-400">Citizen identified in database</p>
                                </div>
                            </div>

                            {/* Display Matched Reference Image */}
                            <div className="mb-4 flex justify-center">
                                <div className="relative group">
                                    <img 
                                        src={matchResult.faceRef ? `${matchResult.faceRef}?t=${Date.now()}` : ''}
                                        alt="Matched Record" 
                                        className="w-32 h-32 rounded-lg object-cover border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                    />
                                    <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 rounded-b-lg">
                                        DATABASE RECORD
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 bg-slate-950/50 rounded p-4 text-sm font-mono">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">CITIZEN NAME:</span>
                                    <span className="text-white font-bold">{matchResult.citizenName}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">EMAIL:</span>
                                    <span className="text-slate-300 text-xs">{matchResult.citizenEmail}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">CONFIDENCE:</span>
                                    <span className="text-green-400 font-bold">{matchResult.confidence}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">DISTANCE:</span>
                                    <span className="text-blue-400">{matchResult.distance.toFixed(3)}</span>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-red-400/70 border-t border-red-500/20 pt-3">
                                <CheckCircle size={12} className="inline mr-1" />
                                Alert automatically created and dispatched to dashboard
                            </div>

                            <button
                                onClick={resetScan}
                                className="w-full mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                            >
                                Reset Scanner
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Technical Info */}
            <div className="mt-6 bg-slate-950/50 border border-slate-800 rounded p-4">
                <p className="text-[10px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-500">TECHNICAL NOTE:</strong> This module uses face-api.js for client-side face detection and comparison.
                    All processing occurs in the browser. No webcam images or face descriptors are uploaded or stored.
                    Match threshold: 0.6 Euclidean distance. Lower values indicate better matches.
                </p>
            </div>
        </div>
    );
};

export default FaceScannerDemo;
