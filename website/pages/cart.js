import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty. <Link href="/products" className="text-primary underline">Continue shopping</Link></p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow">
              <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-primary font-bold">₹{item.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500">Remove</button>
                </div>
              </div>
              <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <div className="text-right text-2xl font-bold mt-4">Total: ₹{getCartTotal().toLocaleString()}</div>
          <div className="text-right">
            <Link href="/checkout" className="inline-block bg-primary text-white px-8 py-3 rounded-full">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}