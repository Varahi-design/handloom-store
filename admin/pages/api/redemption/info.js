import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { userId, amount } = req.query;

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data() || {};
    const availablePoints = data?.referralStats?.availablePoints || 0;
    const purchaseAmount = parseFloat(amount) || 0;
    const voucherPoints = 500;
    const slab = 2500;

    const maxVouchers = Math.floor(purchaseAmount / slab);
    const maxRedeemablePoints = maxVouchers * voucherPoints;
    const canRedeem = Math.min(availablePoints, maxRedeemablePoints);
    const vouchers = Math.floor(canRedeem / voucherPoints);

    res.status(200).json({
      availablePoints,
      eligibleVouchers: maxVouchers,
      canRedeemPoints: canRedeem,
      vouchers: vouchers,
      discount: vouchers * 500,
      slabAmount: slab,
      voucherValue: 500,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}