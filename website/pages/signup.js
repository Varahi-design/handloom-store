import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function Signup() {
  const [tab, setTab] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const { signupWithEmail, sendOTP, verifyOTP, user } = useAuth();
  const router = useRouter();

  if (user) { router.push('/profile'); return null; }

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    await signupWithEmail(email, password, name, referralCode);
  };

  const handleSendOTP = async () => {
    try {
      const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const id = await sendOTP(phone, recaptcha);
      setVerificationId(id);
      toast.success('OTP sent');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    await verifyOTP(verificationId, otp);
    // After phone verification, you could prompt for name/referral
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Create Account</h1>
      <div className="flex border-b mb-4">
        <button onClick={() => setTab('email')} className={`flex-1 py-2 ${tab==='email'?'border-b-2 border-primary font-bold':''}`}>Email</button>
        <button onClick={() => setTab('phone')} className={`flex-1 py-2 ${tab==='phone'?'border-b-2 border-primary font-bold':''}`}>Phone</button>
      </div>

      {tab === 'email' ? (
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" className="w-full border p-2 rounded" required />
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" required />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded" required />
          <input type="text" value={referralCode} onChange={e=>setReferralCode(e.target.value)} placeholder="Referral Code (optional)" className="w-full border p-2 rounded" />
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-full">Sign Up</button>
        </form>
      ) : (
        <div>
          {!verificationId ? (
            <div className="space-y-4">
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" className="w-full border p-2 rounded" />
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91..." className="w-full border p-2 rounded" />
              <input type="text" value={referralCode} onChange={e=>setReferralCode(e.target.value)} placeholder="Referral Code (optional)" className="w-full border p-2 rounded" />
              <div id="recaptcha-container"></div>
              <button onClick={handleSendOTP} className="w-full bg-primary text-white py-3 rounded-full">Send OTP</button>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter OTP" className="w-full border p-2 rounded" />
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-full">Verify OTP</button>
            </form>
          )}
        </div>
      )}
      <p className="mt-4 text-center">Already have an account? <Link href="/login" className="text-primary">Login</Link></p>
    </div>
  );
}