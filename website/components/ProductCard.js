import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discountedPrice = product.discountPercentage > 0
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition">
      <Link href={`/product/${product.id}`}>
        <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-64 object-cover" />
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          {product.discountPercentage > 0 ? (
            <>
              <span className="text-gray-500 line-through text-sm">₹{product.price.toLocaleString()}</span>
              <span className="text-green-600 font-bold text-lg">₹{discountedPrice.toLocaleString()}</span>
              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                {product.discountPercentage}% off
              </span>
            </>
          ) : (
            <span className="text-primary font-bold text-lg">₹{product.price.toLocaleString()}</span>
          )}
        </div>
        <button onClick={() => addToCart(product)} className="mt-3 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-opacity-90">
          <FaShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
}