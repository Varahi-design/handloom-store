import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { seedProducts } from '../lib/products';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setProducts(seedProducts);
        }
      } catch (e) {
        setProducts(seedProducts);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-primary mb-2">Handloom Heritage</h1>
        <p className="text-gray-600">Exquisite handloom sarees & fabrics</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}