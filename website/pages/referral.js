import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/router';
import { FaCopy, FaShare, FaUsers, FaMoneyBill, FaGift } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ReferralPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [referralData, setReferralData] = useState(null);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    setReferralData(userData);

    const refQuery = query(collection(db, 'referrals'), where('referrerId', '==', user.uid));
    const refSnap = await getDocs(refQuery);
    setReferrals(refSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const copyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      toast.success('Referral link copied!');
    } else {
      toast.error('No referral link generated yet. Contact support.');
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent('Check out Handloom Heritage for authentic handloom sarees! Use my referral link: ' + referralData?.referralLink);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!referralData) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Refer & Earn</h1>

      <div className="bg-gradient-to-r from-primary to-maroon rounded-2xl p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-2">Your Referral Link</h2>
        <p className="mb-4">Share this link and earn 5% commission + 500 points when friends make their first purchase!</p>
        <div className="bg-white rounded-lg p-3 flex items-center gap-3 mb-4">
          <input type="text" value={referralData.referralLink || 'No link generated'} readOnly className="flex-1 text-gray-800 bg-transparent outline-none" />
          <button onClick={copyLink} className="bg-primary text-white px-4 py-2 rounded-lg"><FaCopy /></button>
        </div>
        <button onClick={shareWhatsApp} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaShare /> Share via WhatsApp</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <FaUsers className="text-2xl text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{referralData.referralStats?.totalReferrals || 0}</p>
          <p className="text-sm text-gray-500">Total Referrals</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <FaMoneyBill className="text-2xl text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">₹{(referralData.referralStats?.totalCommissionEarned || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Commission Earned</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="p-4 text-xl font-bold border-b">Referral History</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-2 text-left">User</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Commission</th></tr>
          </thead>
          <tbody>
            {referrals.map(ref => (
              <tr key={ref.id} className="border-t">
                <td className="px-4 py-2">{ref.referredUserName || ref.referredUserId?.slice(0,8)}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${ref.status === 'successful' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{ref.status}</span></td>
                <td className="px-4 py-2">₹{(ref.commissionEarned || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}