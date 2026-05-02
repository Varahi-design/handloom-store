import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) {
        const data = snap.data();
        setOrder({ id: snap.id, ...data });
        setNewStatus(data.status || 'pending');
      } else {
        toast.error('Order not found');
        router.push('/orders');
      }
    } catch (error) {
      toast.error('Failed to load order');
      router.push('/orders');
    }
    setLoading(false);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return;
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary"
      >
        <FaArrowLeft /> Back to Orders
      </button>

      <h1 className="text-3xl font-bold text-gray-800">Order #{order.id.slice(0, 8)}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.image || item.images?.[0] || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
            <div className="flex items-center gap-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={newStatus === order.status}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave /> Update
              </button>
            </div>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <div className="space-y-2">
              <p><span className="text-gray-500">Name:</span> {order.customerName || 'N/A'}</p>
              <p><span className="text-gray-500">Email:</span> {order.customerEmail || 'N/A'}</p>
              <p><span className="text-gray-500">Phone:</span> {order.customerPhone || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <p className="text-gray-700">{order.shippingAddress || 'Not provided'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Payment Method</span>
                <span>{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-semibold mb-1">Notes</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}