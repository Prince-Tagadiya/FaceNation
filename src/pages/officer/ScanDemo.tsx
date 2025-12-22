import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Scan, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';

const ScanDemo: React.FC = () => {
    const { user } = useAuth();
    const db = getFirestore(app);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'match' | 'nomatch'>('idle');
    const [scanProgress, setScanProgress] = useState(0);
    const [matchDetails, setMatchDetails] = useState<any>(null);

    const triggerScan = async () => {
        if (!user || status === 'scanning') return;

        setStatus('scanning');
        setScanProgress(0);
        setMatchDetails(null);

        // Simulation Loop
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + Math.random() * 10;
            });
        }, 200);

        // Actual Logic: Find a random Active case to alert on
        try {
            const q = query(
                collection(db, 'cases'), 
                where('assignedOfficerId', '==', user.uid),
                where('status', '==', 'Active'),
                limit(10)
            );
            const snapshot = await getDocs(q);
            
            // Wait for visual simulation to finish
            await new Promise(r => setTimeout(r, 2500));
            clearInterval(interval);
            setScanProgress(100);

            if (snapshot.empty) {
                setStatus('nomatch');
            } else {
                // Pick random case
                const randomCase = snapshot.docs[Math.floor(Math.random() * snapshot.size)];
                const caseData = randomCase.data();
                const confidence = Math.floor(Math.random() * (99 - 85) + 85); // 85-99%

                // Import helper for ID generation and sanitization
                const { sanitizeForFirestore, generateAlertId } = await import('../../lib/firestoreHelpers');

                // Build alert data with ZERO undefined values
                const alertData = {
                    alertId: generateAlertId(),
                    caseId: randomCase.id || '',
                    officerId: user.uid || '',
                    confidence: confidence,
                    status: 'New',
                    timestamp: serverTimestamp(),
                    details: 'Biometric Match from public surveillance feed #CAM-04'
                };

                // ✅ SANITIZE before sending to Firestore
                const safeAlertData = sanitizeForFirestore(alertData);

                // Create Alert in Firestore
                await addDoc(collection(db, 'alerts'), safeAlertData);

                setMatchDetails({
                    name: caseData.subjectName,
                    type: caseData.type,
                    confidence
                });
                setStatus('match');
            }

        } catch (error) {
            console.error("Scan error:", error);
            setStatus('nomatch');
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Grid Animation */}
            <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-[0.02] pointer-events-none">
                {Array.from({ length: 400 }).map((_, i) => (
                    <div key={i} className="border border-green-500/50 aspect-square"></div>
                ))}
            </div>

            <div className="relative z-10 text-center w-full max-w-lg">
                <div className={`w-48 h-48 mx-auto rounded-full border-4 flex items-center justify-center mb-8 relative ${
                    status === 'scanning' ? 'border-blue-500 animate-pulse' :
                    status === 'match' ? 'border-red-500' :
                    status === 'nomatch' ? 'border-gray-500' :
                    'border-green-500/30'
                }`}>
                    {status === 'scanning' && (
                        <div className="absolute inset-0 rounded-full border-t-4 border-blue-400 animate-spin"></div>
                    )}
                    
                    {status === 'idle' && <Scan size={64} className="text-green-500/50" />}
                    {status === 'scanning' && <span className="text-3xl font-mono text-blue-400">{Math.round(scanProgress)}%</span>}
                    {status === 'match' && <ShieldAlert size={64} className="text-red-500 animate-bounce" />}
                    {status === 'nomatch' && <CheckCircle size={64} className="text-gray-500" />}
                </div>

                {status === 'idle' && (
                    <button 
                        onClick={triggerScan}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-[0_0_30px_rgba(0,255,100,0.3)] transition-all hover:scale-105 active:scale-95"
                    >
                        INITIATE BIOMETRIC SWEEP
                    </button>
                )}

                {status === 'scanning' && (
                    <div className="text-blue-400 font-mono text-sm animate-pulse">
                        Scanning database... correlating inputs...
                    </div>
                )}

                {status === 'match' && (
                    <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-lg animate-in zoom-in duration-300">
                        <h3 className="text-2xl font-bold text-red-500 mb-2">POSITIVE MATCH DETECTED</h3>
                        <div className="text-left space-y-2 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">SUBJECT:</span>
                                <span className="text-white font-bold">{matchDetails.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">CLASSIFICATION:</span>
                                <span className="text-white">{matchDetails.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">CONFIDENCE:</span>
                                <span className="text-green-400 font-bold">{matchDetails.confidence}%</span>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-red-400/70 border-t border-red-500/20 pt-2">
                            Alert automatically dispatched to dashboard.
                        </div>
                        <button onClick={() => setStatus('idle')} className="mt-4 text-sm underline text-gray-500 hover:text-white">
                            Reset Scanner
                        </button>
                    </div>
                )}

                {status === 'nomatch' && (
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-gray-400">NO ACTIVE THREATS DETECTED</h3>
                        <p className="text-gray-600 text-xs mt-2">Routine scan completed. No database correlations found.</p>
                        <button onClick={() => setStatus('idle')} className="mt-4 text-sm bg-white/10 px-4 py-2 rounded hover:bg-white/20">
                            Reset Scanner
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanDemo;
