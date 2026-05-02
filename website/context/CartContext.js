import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    toast.error('Item removed');
  };

  const updateQuantity = (productId, qty) => {
    if (qty < 1) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item));
  };

  const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      getCartTotal, getCartCount, isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);