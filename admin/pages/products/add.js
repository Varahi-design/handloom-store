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
  });
  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageUrls = [];
      for (const file of imageFiles) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }

      const productData = {
        ...product,
        price: parseFloat(product.price),
        discountPercentage: parseFloat(product.discountPercentage) || 0,
        images: imageUrls,
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

        {/* Image upload */}
        <div>
          <label className="block font-medium mb-1">Images</label>
          <div className="border-dashed border-2 p-4 text-center">
            <FaUpload className="mx-auto text-2xl text-gray-400" />
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          </div>
          {imageFiles.length > 0 && (
            <div className="flex gap-2 mt-2">
              {imageFiles.map((f, i) => (
                <img key={i} src={URL.createObjectURL(f)} className="w-16 h-16 object-cover rounded" />
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