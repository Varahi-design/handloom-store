export const runtime = 'edge';

import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { to, message } = req.body;
  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}