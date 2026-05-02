import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // TEMPORARY: treat any authenticated user as super admin
        setAdmin({
          uid: user.uid,
          email: user.email,
          role: 'super_admin',
        });
        if (router.pathname === '/login') {
          router.push('/dashboard');
        }
      } else {
        setAdmin(null);
        if (router.pathname !== '/login') {
          router.push('/login');
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AdminContext.Provider value={{ admin, loading, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);