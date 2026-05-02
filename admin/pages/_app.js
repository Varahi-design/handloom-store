import { AdminProvider } from '../context/AdminContext';
import AdminLayout from '../components/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import '../styles/admin.css';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <AdminProvider>
      <Toaster position="top-right" />
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        </ProtectedRoute>
      )}
    </AdminProvider>
  );
}
export default MyApp;