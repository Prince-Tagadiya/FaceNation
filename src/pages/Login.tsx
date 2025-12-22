import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { app } from '../lib/firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);
  const { loginWithDemo } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Auto Role Detection & Redirection
      const userDoc = await getDoc(doc(getFirestore(app), 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.active === false) {
          setError('Access Denied: Account has been deactivated.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        const role = userData.role;

        switch (role) {
          case 'System Admin':
            navigate('/admin');
            break;
          case 'Investigating Officer':
            navigate('/officer');
            break;
          case 'Control Room Operator':
            navigate('/control');
            break;
          case 'Citizen':
            navigate('/citizen');
            break;
          default:
            setError('Access Denied: Invalid Role Configuration.');
            await auth.signOut();
        }
      } else {
        setError('Access Denied: No user profile found.');
        await auth.signOut();
      }

    } catch (err: any) {
      console.error(err);
      setError(`Access Denied: ${err.message || 'Invalid credentials or insufficient permissions.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError('');
    const db = getFirestore(app);
    try {
      const uniqueId = Math.floor(Math.random() * 10000);
      const emailToCreate = `admin_${uniqueId}@facenation.gov`;
      const passwordToCreate = "password123";

      const userCredential = await createUserWithEmailAndPassword(auth, emailToCreate, passwordToCreate);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: emailToCreate,
        name: `Admin ${uniqueId}`,
        role: "System Admin",
        createdAt: new Date()
      });

      setEmail(emailToCreate);
      setPassword(passwordToCreate);
      setError(`Created & Filled: ${emailToCreate}`);
    } catch (err: any) {
      console.error(err);
      setError(`Creation Failed: ${err.message}`);
    } finally {
      if (!error) setLoading(false); // Only unset loading if we didn't error (if we navigated, component unmounts mostly)
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020205] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-primary/10 rounded-full border border-primary/20 mb-4 animate-pulse">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase font-mono">System Access</h1>
          <p className="text-gray-400 text-xs mt-2 font-mono tracking-widest">RESTRICTED PERSONNEL ONLY</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-400 text-xs font-mono leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono ml-1">Identity ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
              placeholder="officer@facenation.gov"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono ml-1">Access Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authenticate'}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-[9px] text-gray-500 uppercase tracking-widest font-mono">Development Access</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              loginWithDemo();
              navigate('/dashboard');
            }}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white/10 flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-[10px] font-mono"
          >
            Initialize Demo Protocol (Bypass)
          </button>

          <button
            type="button"
            onClick={handleCreateAdmin}
            className="w-full mt-2 bg-transparent hover:bg-white/5 text-gray-500 hover:text-gray-300 font-mono text-[9px] py-2 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <UserPlus className="w-3 h-3" />
            Create Admin (dev_admin@facenation.gov)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
