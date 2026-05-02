import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'orders'));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const changeStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status });
    toast.success('Status updated');
    // refresh
    setOrders(prev => prev.map(o => o.id === id ? {...o, status} : o));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-2">{o.id.slice(0,8)}</td>
                <td>{o.customerName}</td>
                <td>₹{o.totalAmount?.toLocaleString()}</td>
                <td>{o.status}</td>
                <td>
                  <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)} className="border p-1">
                    <option>pending</option><option>confirmed</option><option>shipped</option><option>delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}