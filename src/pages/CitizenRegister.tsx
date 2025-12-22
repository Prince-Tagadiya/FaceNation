import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Fingerprint } from 'lucide-react';

const CitizenRegister: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const auth = getAuth(app);
    const db = getFirestore(app);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create User Document with Role
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: 'Citizen',
        active: true,
        createdAt: serverTimestamp(),
      });

      // Redirect handled by AuthContext or direct navigation
      navigate('/citizen/dashboard');
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
            setError('Email is already registered.');
        } else {
            setError('Registration failed. Please try again.');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
       <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl">
        <div className="flex flex-col items-center mb-6">
            <Fingerprint className="w-12 h-12 text-primary mb-2" />
            <h1 className="text-2xl font-bold tracking-widest uppercase">Citizen Registry</h1>
            <p className="text-gray-400 text-xs">Public Identity Enrollment</p>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm font-mono">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4 font-mono">
            <div>
                <label className="block text-xs text-gray-400 mb-1">FULL NAME</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded p-3 focus:border-primary outline-none text-sm"
                    placeholder="JOHN DOE"
                />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">EMAIL ADDRESS</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded p-3 focus:border-primary outline-none text-sm"
                    placeholder="citizen@facenation.gov"
                />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">PASSWORD</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded p-3 focus:border-primary outline-none text-sm"
                    placeholder="••••••••"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-black font-bold py-3.5 rounded mt-4 hover:bg-primary/90 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ENROLL IDENTITY'}
            </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
            Already enrolled? <Link to="/login" className="text-primary hover:underline">Access Portal</Link>
        </div>
       </div>
    </div>
  );
};

export default CitizenRegister;
