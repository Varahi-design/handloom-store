import { useAdmin } from '../context/AdminContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) router.push('/login');
  }, [admin, loading]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!admin) return null;
  return children;
}