import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link href="/products/add" className="bg-primary text-white px-4 py-2 rounded-lg">
          + Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Discount</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  <img src={p.images?.[0] || '/placeholder.jpg'} alt="" className="w-12 h-12 object-cover rounded" />
                </td>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2">{p.category}</td>
                <td className="px-4 py-2">₹{p.price?.toLocaleString()}</td>
                <td className="px-4 py-2">{p.discountPercentage || 0}%</td>
                <td className="px-4 py-2 flex gap-3">
                  <Link href={`/products/edit/${p.id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}