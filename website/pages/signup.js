import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const { signup, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.push('/profile');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(email, password, name, referralCode);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-4">
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Full Name" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Password" required />
        <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Referral Code (optional)" />
        <button type="submit" className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-opacity-90">Sign Up</button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Already have an account? <Link href="/login" className="text-primary font-semibold">Login</Link>
      </p>
    </div>
  );
}