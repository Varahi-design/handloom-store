export const runtime = 'edge';

import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { referralCode, newUserId, newUserName } = req.body;

  try {
    // Find referrer
    const referrerQuery = query(collection(db, 'users'), where('referralCode', '==', referralCode));
    const referrerSnap = await getDocs(referrerQuery);
    if (referrerSnap.empty) return res.status(400).json({ error: 'Invalid referral code' });
    const referrerDoc = referrerSnap.docs[0];
    const referrerId = referrerDoc.id;

    if (referrerId === newUserId) return res.status(400).json({ error: 'Self referral' });

    // Check already referred
    const existing = await getDocs(query(collection(db, 'referrals'), where('referredUserId', '==', newUserId)));
    if (!existing.empty) return res.status(400).json({ error: 'Already referred' });

    // Create referral
    await addDoc(collection(db, 'referrals'), {
      referrerId,
      referredUserId: newUserId,
      referredUserName: newUserName || '',
      referralCode,
      status: 'pending',
      createdAt: new Date(),
    });

    // Update referrer stats
    await updateDoc(doc(db, 'users', referrerId), {
      'referralStats.totalReferrals': increment(1)
    });

    // Generate welcome discount for referred user
    const couponCode = 'WELCOME' + Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'coupons'), {
      code: couponCode,
      discountType: 'percentage',
      discountValue: 10,
      minPurchase: 500,
      maxDiscount: 1000,
      usageLimit: 1,
      usedCount: 0,
      isActive: true,
      userId: newUserId,
    });

    return res.status(200).json({ success: true, discountCode: couponCode });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}