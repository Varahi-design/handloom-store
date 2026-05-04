import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/router';
import { FaUpload, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    discountPercentage: 0,
    category: 'Silk Sarees',
    fabric: '',
    color: '',
    inStock: true,
    images: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Open Cloudinary Upload Widget (client-side)
  const handleImageUpload = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      toast.error('Cloudinary cloud name not configured');
      return;
    }

    // @ts-ignore – Cloudinary global script included in _app.js
    const widget = cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: 'handloom_upload',
        multiple: true,
        folder: 'handloom-products',
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          setProduct(prev => ({
            ...prev,
            images: [...prev.images, result.info.secure_url],
          }));
          toast.success('Image uploaded');
        }
        if (error) {
          toast.error('Upload failed');
        }
      }
    );
    widget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...product,
        price: parseFloat(product.price),
        discountPercentage: parseFloat(product.discountPercentage) || 0,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'products'), productData);
      toast.success('Product added');
      router.push('/products');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Add Product</h2>
        <button onClick={() => router.back()}><FaTimes /></button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <input name="name" value={product.name} onChange={handleChange} className="border p-2 rounded" placeholder="Product name" required />
          <select name="category" value={product.category} onChange={handleChange} className="border p-2 rounded">
            <option>Silk Sarees</option><option>Cotton Sarees</option><option>Fabrics</option><option>Dupattas</option><option>Accessories</option>
          </select>
          <input name="price" type="number" value={product.price} onChange={handleChange} className="border p-2 rounded" placeholder="Price" required />
          <input name="discountPercentage" type="number" value={product.discountPercentage} onChange={handleChange} className="border p-2 rounded" placeholder="Discount %" min="0" max="100" step="0.1" />
          <input name="fabric" value={product.fabric} onChange={handleChange} className="border p-2 rounded" placeholder="Fabric" />
          <input name="color" value={product.color} onChange={handleChange} className="border p-2 rounded" placeholder="Color" />
        </div>
        <textarea name="description" value={product.description} onChange={handleChange} rows="3" className="border p-2 rounded w-full" placeholder="Description" required />

        {/* Image upload button – replaces old file input */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Images</label>
          <button type="button" onClick={handleImageUpload} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <FaUpload /> Upload Images
          </button>

          {product.images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {product.images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="Preview" className="w-16 h-16 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() =>
                      setProduct(prev => ({
                        ...prev,
                        images: prev.images.filter((_, index) => index !== i),
                      }))
                    }
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="inStock" checked={product.inStock} onChange={handleChange} /> In Stock
        </label>
        <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded flex items-center gap-2">
          <FaSave /> {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}