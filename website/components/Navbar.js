import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes, FaGift } from 'react-icons/fa';
import { useState } from 'react';

export default function Navbar() {
  const { getCartCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-display font-bold text-primary">
            Handloom Heritage ✦
          </Link>
          <div className="hidden md:flex space-x-6 text-gray-700 font-semibold">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/products" className="hover:text-primary">Collection</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsCartOpen(true)} className="relative text-gray-700 hover:text-primary">
              <FaShoppingCart className="text-xl" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-3 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="text-gray-700 hover:text-primary flex items-center gap-1">
                  <FaUser className="text-xl" />
                  <span className="hidden md:inline text-sm">{user.displayName || 'User'}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                    <Link href="/referral" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <FaGift className="inline mr-2" />Refer & Earn
                    </Link>
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                      <FaSignOutAlt className="inline mr-2" />Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link href="/login" className="text-gray-700 hover:text-primary font-semibold">Login</Link>
                <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-full font-semibold hover:bg-opacity-90">Sign Up</Link>
              </div>
            )}

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-1">Home</Link>
            <Link href="/products" className="block py-1">Collection</Link>
            <Link href="/about" className="block py-1">About</Link>
            {!user && (
              <>
                <Link href="/login" className="block py-1">Login</Link>
                <Link href="/signup" className="block py-1">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}