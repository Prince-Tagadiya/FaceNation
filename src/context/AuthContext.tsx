import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { UserData } from '../types';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // STRICT SECURITY CHECK: User must be active
            if (data.active === false) {
              console.error("Access Denied: Account is inactive.");
              await signOut(auth);
              setUser(null);
            } else {
               setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: data.role,
                name: data.name || 'User',
                active: data.active ?? true, // Default to true if missing for legacy/seed reasons
                createdAt: data.createdAt,
                createdBy: data.createdBy
              });
            }
          } else {
            console.error("Access Denied: User profile not found.");
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Don't sign out on network error, but don't set user either - just leave as null (loading state finished)
          // Or maybe safer to set null.
          setUser(null); 
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
