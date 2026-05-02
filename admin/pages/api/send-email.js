import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { to, subject, message } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text: message,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}