import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaGift, FaCopy, FaMoneyBill } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      setProfile(snap.data());
    }
  };

  const copyReferralLink = () => {
    if (profile?.referralLink) {
      navigator.clipboard.writeText(profile.referralLink);
      toast.success('Referral link copied!');
    }
  };

  if (!profile) return <div className="text-center py-20">Loading...</div>;

  const points = profile.referralStats?.availablePoints || 0;
  const vouchers = Math.floor(points / 500);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">My Account</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <p className="text-lg"><strong>Name:</strong> {profile.displayName || 'Not set'}</p>
        <p className="text-lg"><strong>Email:</strong> {profile.email}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><FaGift className="text-primary" /> Loyalty Points</h2>
        <p className="text-3xl font-bold text-primary">{points}</p>
        <p className="text-gray-600">Available Points (1 point = ₹1)</p>
        <p className="text-sm text-gray-500 mt-2">
          You have {vouchers} voucher{vouchers !== 1 ? 's' : ''} (₹{vouchers * 500})
        </p>
        <div className="mt-4 bg-cream rounded-lg p-3 text-sm">
          <strong>Redemption:</strong> 500 points = ₹500 off. Use 1 voucher per ₹2500 purchase.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><FaMoneyBill className="text-green-600" /> My Referrals</h2>
        <p>Successful Referrals: <strong>{profile.referralStats?.successfulReferrals || 0}</strong></p>
        <p>Total Commission Earned: <strong>₹{(profile.referralStats?.totalCommissionEarned || 0).toLocaleString()}</strong></p>
        <p>Total Points Earned: <strong>{profile.referralStats?.totalPointsEarned || 0}</strong></p>
        <Link href="/referral" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-full">View Referral Details</Link>
      </div>
    </div>
  );
}