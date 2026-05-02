import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let userData = userDoc.exists() ? userDoc.data() : {};
        // If no document yet, create one with defaults
        if (!userDoc.exists()) {
          userData = {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            referralCode: '', // will be generated later
            referralStats: {
              totalReferrals: 0,
              successfulReferrals: 0,
              totalCommissionEarned: 0,
              totalPointsEarned: 0,
              availablePoints: 0,
            },
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        }
        setUser({ uid: firebaseUser.uid, ...userData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const signup = async (email, password, name, referralCode = '') => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        displayName: name,
        referralStats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          totalCommissionEarned: 0,
          totalPointsEarned: 0,
          availablePoints: 0,
        },
      });
      // If referral code provided, process it
      if (referralCode) {
        await processReferral(referralCode, cred.user.uid, name);
      }
      toast.success('Account created successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Helper to process referral (calls the admin API we already created)
async function processReferral(code, newUserId, newUserName) {
  try {
    const res = await fetch('https://handloom-store.netlify.app/api/referral/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: code, newUserId, newUserName }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Referral applied! You get 10% off your first purchase.');
    } else {
      toast.error(data.error || 'Invalid referral code');
    }
  } catch (error) {
    console.error('Referral processing failed:', error);
  }
}