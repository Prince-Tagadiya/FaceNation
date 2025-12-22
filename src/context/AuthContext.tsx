import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';

// Role Definitions
export type UserRole =
  | 'System Admin'
  | 'Investigating Officer'
  | 'Control Room Operator'
  | 'Citizen';

interface UserData {
  uid: string;
  email: string | null;
  role: UserRole;
  name: string;
}

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
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: data.role as UserRole,
              name: data.name || 'User',
            });
          } else {
            console.error("User document not found.");
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
      name: 'Demo Admin'
    });
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loginWithDemo }}>
      {children}
    </AuthContext.Provider>
  );
};
