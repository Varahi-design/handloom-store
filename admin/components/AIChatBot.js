import { useState } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! How can I help?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, AI is offline.' }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg z-50">
        {open ? <FaTimes /> : <FaRobot />}
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 w-96 h-96 bg-white rounded-xl shadow-2xl flex flex-col z-50">
          <div className="bg-primary text-white p-3 rounded-t-xl flex justify-between">
            <span>AI Assistant</span>
            <button onClick={() => setOpen(false)}><FaTimes /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m,i) => (
              <div key={i} className={`p-2 rounded-lg max-w-[80%] ${m.role==='user' ? 'bg-primary text-white ml-auto' : 'bg-gray-100'}`}>{m.content}</div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="flex-1 border rounded px-3 py-1" />
            <button onClick={send} disabled={loading} className="bg-primary text-white p-2 rounded"><FaPaperPlane /></button>
          </div>
        </div>
      )}
    </div>
  );
}