import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';

const Setup: React.FC = () => {
  const [status, setStatus] = useState('Idle');
  
  const initAdmin = async () => {
    setStatus('Processing...');
    const auth = getAuth(app);
    const db = getFirestore(app);
    const email = 'admin@facenation.gov';
    const password = 'SecureAdmin2025!';

    try {
      let uid;
      try {
        // Try creating
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        setStatus('User Created. Setting Role...');
      } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
           // Try logging in
           setStatus('User exists. Logging in to update role...');
           const userCredential = await signInWithEmailAndPassword(auth, email, password);
           uid = userCredential.user.uid;
        } else {
            throw e;
        }
      }

      if (uid) {
         await setDoc(doc(db, 'users', uid), {
            email,
            name: 'System Commander',
            role: 'System Admin',
            createdAt: new Date().toISOString()
         });
         setStatus(`SUCCESS! Admin Ready.\nEmail: ${email}\nPass: ${password}`);
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono">
      <h1 className="text-2xl mb-4">System Bootstrap</h1>
      <button 
        onClick={initAdmin}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded text-white font-bold"
      >
        INITIALIZE ADMIN
      </button>
      <pre className="mt-8 p-4 bg-gray-900 rounded border border-gray-700 whitespace-pre-wrap max-w-lg">
        {status}
      </pre>
    </div>
  );
};

export default Setup;
