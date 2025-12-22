import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { UserData } from '../types';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { },
  logout: async () => { },
  loginWithDemo: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (isDemo) return;

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
                active: data.active ?? true,
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
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, isDemo]);

  const login = async (email: string, password: string) => {
    // This is primarily handled in components directly via Firebase SDK
    // but included here for interface consistency if needed.
  };

  const logout = async () => {
    if (isDemo) {
      setUser(null);
      setIsDemo(false);
      // Force reload to clear any sticking states
      window.location.href = '/';
      return;
    }
    await signOut(auth);
    setUser(null);
  };

  const loginWithDemo = () => {
    setIsDemo(true);
    setUser({
      uid: 'demo-admin-123',
      email: 'admin@facenation.demo',
      role: 'System Admin',
      name: 'Demo Admin',
      active: true,
      createdAt: new Date().toISOString()
    });
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loginWithDemo }}>
      {children}
    </AuthContext.Provider>
  );
};
