import Head from 'next/head';
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
    <>
      <Head>
        <script
          src="https://upload-widget.cloudinary.com/global/all.js"
          type="text/javascript"
        />
      </Head>
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
    </>
  );
}
export default MyApp;