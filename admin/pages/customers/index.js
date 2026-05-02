import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead><tr><th>Name</th><th>Email</th><th>Referral Code</th><th>Points</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.displayName || 'N/A'}</td>
                <td>{c.email}</td>
                <td>{c.referralCode || '—'}</td>
                <td>{c.referralStats?.availablePoints || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}