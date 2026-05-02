import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { seedProducts } from '../lib/products';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchProds = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        else setAllProducts(seedProducts);
      } catch { setAllProducts(seedProducts); }
    };
    fetchProds();
  }, []);

  const filtered = category === 'All' ? allProducts : allProducts.filter(p => p.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Our Collection</h1>
      <div className="flex gap-4 mb-6">
        {['All', 'Silk Sarees', 'Cotton Sarees'].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full ${category===cat ? 'bg-primary text-white' : 'bg-white border'}`}>{cat}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}