import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier
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
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let userData = userDoc.exists() ? userDoc.data() : {};
        if (!userDoc.exists()) {
          userData = {
            email: firebaseUser.email || '',
            phoneNumber: firebaseUser.phoneNumber || '',
            displayName: firebaseUser.displayName || '',
            referralCode: '',
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

  const loginWithEmail = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success('Logged in');
  };

  const signupWithEmail = async (email, password, name, referralCode = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
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
    if (referralCode) await processReferral(referralCode, cred.user.uid, name);
    toast.success('Account created');
  };

  const sendOTP = async (phoneNumber, recaptchaVerifier) => {
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
    return verificationId;
  };

  const verifyOTP = async (verificationId, otp) => {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const result = await signInWithCredential(auth, credential);
    // Create user doc if not exists
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        phoneNumber: result.user.phoneNumber,
        displayName: '',
        referralStats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          totalCommissionEarned: 0,
          totalPointsEarned: 0,
          availablePoints: 0,
        },
      });
    }
    toast.success('Logged in with OTP');
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, signupWithEmail, sendOTP, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

async function processReferral(code, newUserId, newUserName) {
  try {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://handloomproject.netlify.app';
    const res = await fetch(`${adminUrl}/api/referral/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: code, newUserId, newUserName }),
    });
    const data = await res.json();
    if (data.success) toast.success('Referral applied! You get 10% off your first purchase.');
    else toast.error(data.error || 'Invalid referral code');
  } catch (error) {
    console.error('Referral processing failed:', error);
  }
}