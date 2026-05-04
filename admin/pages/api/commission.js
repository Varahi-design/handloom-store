export const runtime = 'edge';

import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, orderAmount, orderId } = req.body;

  try {
    // Find pending referral for this user
    const refQuery = query(collection(db, 'referrals'), where('referredUserId', '==', userId), where('status', '==', 'pending'));
    const refSnap = await getDocs(refQuery);
    if (refSnap.empty) return res.status(200).json({ success: false, message: 'No referral' });
    const referralDoc = refSnap.docs[0];
    const referral = referralDoc.data();
    const referrerId = referral.referrerId;

    // Calculate 5% commission (no limit)
    const commission = Math.round(orderAmount * 0.05);
    const points = 500; // fixed points

    // Update referral
    await updateDoc(doc(db, 'referrals', referralDoc.id), {
      status: 'successful',
      firstPurchaseAmount: orderAmount,
      commissionEarned: commission,
      pointsAwarded: points,
      orderId,
    });

    // Update referrer stats
    const referrerRef = doc(db, 'users', referrerId);
    await updateDoc(referrerRef, {
      'referralStats.successfulReferrals': increment(1),
      'referralStats.totalCommissionEarned': increment(commission),
      'referralStats.totalPointsEarned': increment(points),
      'referralStats.availablePoints': increment(points),
    });

    // Add points history
    await addDoc(collection(db, 'pointsHistory'), {
      userId: referrerId,
      points,
      type: 'referral',
      description: `Referral commission for ${referral.referredUserName || 'user'}`,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, commission, points });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}