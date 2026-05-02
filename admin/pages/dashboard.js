import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0 });

  useEffect(() => {
    (async () => {
      const prodSnap = await getDocs(collection(db, 'products'));
      const ordSnap = await getDocs(collection(db, 'orders'));
      const custSnap = await getDocs(collection(db, 'users'));
      setStats({
        products: prodSnap.size,
        orders: ordSnap.size,
        customers: custSnap.size,
      });
    })();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Products</p><p className="text-3xl font-bold">{stats.products}</p></div>
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Orders</p><p className="text-3xl font-bold">{stats.orders}</p></div>
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Customers</p><p className="text-3xl font-bold">{stats.customers}</p></div>
      </div>
    </div>
  );
}