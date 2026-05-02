import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, pointsToRedeem, orderAmount } = req.body;

  try {
    if (pointsToRedeem % 500 !== 0) return res.status(400).json({ error: 'Must be in multiples of 500' });

    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data();
    const available = data?.referralStats?.availablePoints || 0;
    if (pointsToRedeem > available) return res.status(400).json({ error: 'Insufficient points' });

    const vouchers = pointsToRedeem / 500;
    const maxVouchers = Math.floor(orderAmount / 2500);
    if (vouchers > maxVouchers) return res.status(400).json({ error: `Max vouchers for this amount: ${maxVouchers}` });

    const discount = vouchers * 500;
    const newPoints = available - pointsToRedeem;

    // Update user points
    await updateDoc(doc(db, 'users', userId), {
      'referralStats.availablePoints': newPoints,
    });

    // Log redemption
    await addDoc(collection(db, 'redemptions'), {
      userId,
      pointsRedeemed: pointsToRedeem,
      vouchers,
      discountAmount: discount,
      purchaseAmount: orderAmount,
      status: 'completed',
      createdAt: new Date(),
    });

    res.status(200).json({ success: true, discount, remainingPoints: newPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}