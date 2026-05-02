import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { seedProducts } from '../../lib/products';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
        else {
          const found = seedProducts.find(p => p.id === id) || seedProducts[0];
          setProduct(found);
        }
      } catch {
        setProduct(seedProducts[0]);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="text-center py-20">Loading...</div>;

  const images = product.images?.length > 0 ? product.images : ['/placeholder.jpg'];
  const discountedPrice = product.discountPercentage > 0
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6">
        <FaArrowLeft /> Back to Collection
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          <div className="rounded-xl overflow-hidden mb-4">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-96 object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

          <div className="mb-4">
            {discountedPrice ? (
              <div className="space-y-1">
                <p className="text-xl text-gray-500 line-through">₹{product.price.toLocaleString()}</p>
                <p className="text-3xl font-bold text-green-600">₹{discountedPrice.toLocaleString()}</p>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  {product.discountPercentage}% off
                </span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-primary">₹{product.price.toLocaleString()}</p>
            )}
          </div>

          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="space-y-2 mb-6">
            <p><strong>Fabric:</strong> {product.fabric}</p>
            <p><strong>Color:</strong> {product.color}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Status:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}</p>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}