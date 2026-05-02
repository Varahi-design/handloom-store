import { useState } from 'react';
import { FaSms } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function SMSComposer({ customer, onClose }) {
  const [sms, setSms] = useState({ to: customer?.phone || '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!sms.to || !sms.message) return toast.error('Fill phone and message');
    setSending(true);
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sms),
      });
      if (res.ok) {
        toast.success('SMS sent');
        onClose?.();
      } else throw new Error('Failed');
    } catch { toast.error('Failed'); }
    setSending(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Send SMS</h2>
      <input value={sms.to} onChange={e => setSms({...sms, to: e.target.value})} className="w-full border p-2 rounded" placeholder="Phone number (+91...)" />
      <textarea rows="3" value={sms.message} onChange={e => setSms({...sms, message: e.target.value})} className="w-full border p-2 rounded" placeholder="Message" />
      <button onClick={handleSend} disabled={sending} className="bg-primary text-white px-6 py-2 rounded flex items-center gap-2">
        <FaSms /> {sending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}