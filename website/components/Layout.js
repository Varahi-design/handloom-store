import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}