import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaGift, FaMoneyBill, FaShoppingBag, FaHeart } from 'react-icons/fa';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchProfile();
    fetchOrders();
  }, [user]);

  const fetchProfile = async () => {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      setProfile(data);
      setWishlist(data.wishlist || []);
    }
  };

  const fetchOrders = async () => {
    const q = query(collection(db, 'orders'), where('customerId', '==', user.uid));
    const snap = await getDocs(q);
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const toggleWishlist = async (productId) => {
    const updated = wishlist.includes(productId) 
      ? arrayRemove(productId) 
      : arrayUnion(productId);
    await updateDoc(doc(db, 'users', user.uid), { wishlist: updated });
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  if (!profile) return <div className="text-center py-20">Loading...</div>;

  const points = profile.referralStats?.availablePoints || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary">My Account</h1>
      
      {/* Profile Info */}
      <div className="bg-white rounded-xl shadow p-6">
        <p><strong>Name:</strong> {profile.displayName || 'Not set'}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phoneNumber || 'Not set'}</p>
      </div>

      {/* Loyalty Points */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><FaGift className="text-primary" /> Loyalty Points</h2>
        <p className="text-3xl font-bold">{points}</p>
        <p>Vouchers: {Math.floor(points/500)} (₹{Math.floor(points/500)*500})</p>
      </div>

      {/* Referral Stats */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><FaMoneyBill className="text-green-600" /> Referrals</h2>
        <p>Successful Referrals: {profile.referralStats?.successfulReferrals || 0}</p>
        <p>Commission Earned: ₹{(profile.referralStats?.totalCommissionEarned || 0).toLocaleString()}</p>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><FaShoppingBag /> Orders</h2>
        {orders.length === 0 ? <p>No orders yet.</p> : (
          orders.map(order => (
            <div key={order.id} className="border-b py-2 flex justify-between">
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>₹{order.totalAmount?.toLocaleString()}</span>
              <span className="capitalize">{order.status}</span>
            </div>
          ))
        )}
      </div>

      {/* Wishlist */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><FaHeart className="text-red-500" /> Wishlist</h2>
        {/* We would need to fetch product details for each productId in wishlist, but for demo we'll just show product IDs */}
        {wishlist.length === 0 ? <p>No items in wishlist.</p> : (
          wishlist.map(productId => (
            <div key={productId} className="flex justify-between items-center">
              <span>{productId}</span>
              <button onClick={() => toggleWishlist(productId)} className="text-red-500">Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}