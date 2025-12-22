import React, { useState } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Trash2, Terminal, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogEntry {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    timestamp: string;
}

const ResetDatabase: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [progress, setProgress] = useState(0);

    const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    const handleReset = async () => {
        if (!window.confirm('CRITICAL WARNING: This will permanently delete ALL user profiles from the database (except yours). This action cannot be undone. Are you sure?')) return;

        setLoading(true);
        setLogs([]);
        addLog('Initiating System Wipe Sequence...', 'warning');
        
        try {
            const db = getFirestore(app);
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            
            const totalDocs = snapshot.size;
            addLog(`Found ${totalDocs} user records in database.`, 'info');
            
            let processed = 0;
            let deleted = 0;
            let skipped = 0;

            for (const userDoc of snapshot.docs) {
                const userData = userDoc.data();
                const userName = userData.name || 'Unknown User';
                const userId = userDoc.id;

                if (userId === user?.uid) {
                    addLog(`SKIPPED: Admin Account [${userName}] (Safety Protocol Active)`, 'success');
                    skipped++;
                } else {
                    try {
                        await deleteDoc(doc(db, 'users', userId));
                        addLog(`DELETED: ${userName} (${userId})`, 'error');
                        deleted++;
                    } catch (err: any) {
                        addLog(`FAILED to delete ${userName}: ${err.message}`, 'warning');
                    }
                }
                
                processed++;
                setProgress((processed / totalDocs) * 100);
                // Artificial delay for dramatic effect/readability of logs
                await new Promise(r => setTimeout(r, 100));
            }

            addLog('----------------------------------------', 'info');
            addLog(`OPERATION COMPLETE.`, 'success');
            addLog(`Total Records: ${totalDocs} | Deleted: ${deleted} | Preserved: ${skipped}`, 'info');

        } catch (error: any) {
            console.error(error);
            addLog(`CRITICAL ERROR: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-green-500 font-mono p-8 flex flex-col items-center">
            
            <div className="w-full max-w-4xl">
                 <button onClick={() => navigate('/admin')} className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft size={16} /> RETURN TO COMMAND CENTER
                </button>

                <div className="border border-red-900/50 bg-red-900/10 p-8 rounded-xl mb-8 flex items-start gap-6 backdrop-blur-sm">
                    <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                        <AlertTriangle size={48} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-red-500 mb-2 tracking-widest">DATABASE RESET UTILITY</h1>
                        <p className="text-red-300/80 mb-4 max-w-2xl">
                            This utility executes a hard deletion of all user profiles in the Firestore database. 
                            Authenticated sessions will be invalidated. 
                            Your current Admin Session will be preserved.
                        </p>
                        <button 
                            onClick={handleReset}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Trash2 />}
                            {loading ? 'WIPING DATABASE...' : 'INITIATE SYSTEM WIPE'}
                        </button>
                    </div>
                </div>

                <div className="bg-black border border-green-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,255,0,0.05)]">
                    <div className="bg-green-900/10 border-b border-green-500/30 p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-green-400">
                            <Terminal size={14} />
                            <span>System Output Log</span>
                        </div>
                        {loading && <div className="text-xs text-green-500">{Math.round(progress)}%</div>}
                    </div>
                    <div className="h-[400px] overflow-y-auto p-4 font-mono text-sm space-y-2 scroll-smooth">
                        {logs.length === 0 && (
                            <div className="text-gray-600 italic text-center mt-20">Waiting for command...</div>
                        )}
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-white/20 text-xs shrink-0 select-none">[{log.timestamp}]</span>
                                <span className={`break-all ${
                                    log.type === 'error' ? 'text-red-500' : 
                                    log.type === 'success' ? 'text-green-400 font-bold' : 
                                    log.type === 'warning' ? 'text-yellow-400' : 
                                    'text-blue-300'
                                }`}>
                                    {log.type === 'success' && '✓ '}
                                    {log.type === 'error' && '✕ '}
                                    {log.type === 'warning' && '⚠ '}
                                    {log.message}
                                </span>
                            </div>
                        ))}
                         {/* Auto-scroll anchor if needed, usually just rely on container overflow */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetDatabase;
