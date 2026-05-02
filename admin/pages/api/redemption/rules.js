export default function handler(req, res) {
  res.status(200).json({
    pointsValue: 1,
    voucherSize: 500,
    slab: 2500,
    examples: [
      { purchase: '₹2,500-₹4,999', vouchers: 1, discount: '₹500 off' },
      { purchase: '₹5,000-₹7,499', vouchers: 2, discount: '₹1,000 off' },
      { purchase: '₹7,500-₹9,999', vouchers: 3, discount: '₹1,500 off' },
    ]
  });
}