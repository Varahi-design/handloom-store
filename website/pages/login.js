import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.push('/profile');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Customer Login</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Password" required />
        <button type="submit" className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-opacity-90">Login</button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Don't have an account? <Link href="/signup" className="text-primary font-semibold">Sign Up</Link>
      </p>
    </div>
  );
}