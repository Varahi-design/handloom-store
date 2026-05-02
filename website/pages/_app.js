import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Toaster position="top-center" />
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

export default MyApp;