import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FaUsers, FaMoneyBill, FaGift, FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ReferralPage() {
  const [stats, setStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    totalCommission: 0,
    totalPoints: 0,
  });
  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch referrals
      const refSnap = await getDocs(collection(db, 'referrals'));
      const refList = refSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      }));

      // Calculate stats
      const totalReferrals = refList.length;
      const successful = refList.filter(r => r.status === 'successful');
      const totalCommission = successful.reduce((sum, r) => sum + (r.commissionEarned || 0), 0);
      const totalPoints = successful.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);

      setReferrals(refList.slice(0, 50)); // recent 50
      setStats({
        totalReferrals,
        successfulReferrals: successful.length,
        totalCommission,
        totalPoints,
      });

      // Leaderboard (top 10 referrers by successful referrals)
      const usersSnap = await getDocs(
        query(
          collection(db, 'users'),
          orderBy('referralStats.successfulReferrals', 'desc'),
          limit(10)
        )
      );
      const leaders = usersSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName || doc.data().email || 'Anonymous',
        referrals: doc.data().referralStats?.successfulReferrals || 0,
        commission: doc.data().referralStats?.totalCommissionEarned || 0,
        points: doc.data().referralStats?.availablePoints || 0,
      }));
      setLeaderboard(leaders);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load referral data');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Referral Program</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Referrals</p>
              <p className="text-2xl font-bold">{stats.totalReferrals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <FaTrophy className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Successful</p>
              <p className="text-2xl font-bold">{stats.successfulReferrals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaMoneyBill className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Commission</p>
              <p className="text-2xl font-bold">₹{stats.totalCommission.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaGift className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Points Awarded</p>
              <p className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Referrals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {referrals.map(ref => (
                <tr key={ref.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{ref.referrerName || ref.referrerId?.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ref.referredUserName || ref.referredUserId?.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ref.status === 'successful' ? 'bg-green-100 text-green-800' :
                      ref.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {ref.commissionEarned ? `₹${ref.commissionEarned.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">{ref.pointsAwarded || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Top Referrers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Successful Referrals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {index < 3 ? (
                      <span className={index === 0 ? 'text-yellow-500 text-xl' : index === 1 ? 'text-gray-400 text-xl' : 'text-orange-600 text-xl'}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="text-gray-500">#{index + 1}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm">{user.referrals}</td>
                  <td className="px-6 py-4 text-sm font-medium">₹{user.commission.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{user.points.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}