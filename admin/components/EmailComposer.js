import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function EmailComposer({ customer, onClose }) {
  const [email, setEmail] = useState({ to: customer?.email || '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.to || !email.subject || !email.message) return toast.error('Fill all fields');
    setSending(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email),
      });
      if (res.ok) {
        toast.success('Email sent');
        onClose?.();
      } else throw new Error('Failed');
    } catch { toast.error('Failed'); }
    setSending(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Compose Email</h2>
      <input value={email.to} onChange={e => setEmail({...email, to: e.target.value})} className="w-full border p-2 rounded" placeholder="To" />
      <input value={email.subject} onChange={e => setEmail({...email, subject: e.target.value})} className="w-full border p-2 rounded" placeholder="Subject" />
      <textarea rows="6" value={email.message} onChange={e => setEmail({...email, message: e.target.value})} className="w-full border p-2 rounded" placeholder="Message" />
      <button onClick={handleSend} disabled={sending} className="bg-primary text-white px-6 py-2 rounded flex items-center gap-2">
        <FaPaperPlane /> {sending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}