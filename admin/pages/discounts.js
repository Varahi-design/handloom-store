import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState(10);

  const fetch = async () => {
    const snap = await getDocs(collection(db, 'discounts'));
    setDiscounts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetch(); }, []);

  const create = async () => {
    if (!code) return;
    await addDoc(collection(db, 'discounts'), { code, percent, active: true });
    toast.success('Discount created');
    fetch();
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'discounts', id));
    fetch();
    toast.success('Deleted');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Discounts</h2>
      <div className="flex gap-2 mb-4">
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Coupon code" className="border p-2" />
        <input type="number" value={percent} onChange={e => setPercent(e.target.value)} className="border p-2 w-20" />
        <button onClick={create} className="bg-primary text-white px-4 py-2 rounded">Create</button>
      </div>
      <ul>
        {discounts.map(d => (
          <li key={d.id} className="flex justify-between py-1">
            <span>{d.code} - {d.percent}% off</span>
            <button onClick={() => remove(d.id)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}