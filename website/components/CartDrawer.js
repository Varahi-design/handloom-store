import { useCart } from '../context/CartContext';
import { FaTimes, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-primary">Shopping Cart</h2>
            <button onClick={() => setIsCartOpen(false)}><FaTimes /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-4 bg-cream rounded-lg p-3">
                  <img src={item.images[0]} alt={item.name} className="w-20 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-primary font-bold">₹{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FaMinus /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><FaPlus /></button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500"><FaTrash /></button>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="border-t p-6">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span>₹{getCartTotal().toLocaleString()}</span>
              </div>
              <button
  onClick={() => alert('Checkout coming soon! 🚀')}
  className="w-full bg-primary text-white py-3 rounded-full font-semibold"
>
  Proceed to Checkout
</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}