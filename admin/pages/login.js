import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('asheeshgawde@gmail.com');
  const [password, setPassword] = useState('Kanak@2007');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-primary mb-4">Admin Login</h1>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded mb-3" placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded mb-4" placeholder="Password" />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded">Sign In</button>
      </form>
    </div>
  );
}