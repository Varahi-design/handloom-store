import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file' });

    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'handloom-products' });
      res.status(200).json({ url: result.secure_url });
    } catch (e) {
      res.status(500).json({ error: 'Upload failed' });
    }
  });
}