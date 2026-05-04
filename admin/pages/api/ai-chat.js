export const runtime = 'edge';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt } = req.body;
  // Dummy response – replace with actual OpenAI call
  const reply = `You asked: "${prompt}". I'm still learning!`;
  res.status(200).json({ response: reply });
}