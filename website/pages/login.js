import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function Login() {
  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const { loginWithEmail, sendOTP, verifyOTP, user } = useAuth();
  const router = useRouter();

  if (user) { router.push('/profile'); return null; }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    await loginWithEmail(email, password);
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
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Customer Login</h1>
      <div className="flex border-b mb-4">
        <button onClick={() => setTab('email')} className={`flex-1 py-2 ${tab==='email'?'border-b-2 border-primary font-bold':''}`}>Email</button>
        <button onClick={() => setTab('phone')} className={`flex-1 py-2 ${tab==='phone'?'border-b-2 border-primary font-bold':''}`}>Phone</button>
      </div>

      {tab === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" required />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded" required />
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-full">Login</button>
        </form>
      ) : (
        <div>
          {!verificationId ? (
            <div className="space-y-4">
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91..." className="w-full border p-2 rounded" />
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
      <p className="mt-4 text-center">Don't have an account? <Link href="/signup" className="text-primary">Sign Up</Link></p>
    </div>
  );
}