import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { FaSave, FaTimes, FaUpload } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    if (!id) return;
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) {
      const data = snap.data();
      setProduct({
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        discountPercentage: data.discountPercentage || 0,
        category: data.category || 'Silk Sarees',
        fabric: data.fabric || '',
        color: data.color || '',
        inStock: data.inStock !== undefined ? data.inStock : true,
      });
      setExistingImages(data.images || []);
    } else {
      toast.error('Product not found');
      router.push('/products');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const removeExistingImage = (index) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newImageUrls = [];
      for (const file of newImageFiles) {
        const url = await uploadToCloudinary(file);
        newImageUrls.push(url);
      }
      const finalImages = [...existingImages, ...newImageUrls];

      await updateDoc(doc(db, 'products', id), {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        discountPercentage: parseFloat(product.discountPercentage) || 0,
        category: product.category,
        fabric: product.fabric,
        color: product.color,
        inStock: product.inStock,
        images: finalImages,
        updatedAt: new Date().toISOString(),
      });

      toast.success('Product updated');
      router.push('/products');
    } catch (error) {
      toast.error(error.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <button onClick={() => router.push('/products')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <FaTimes /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input type="text" name="name" value={product.name} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" value={product.category} onChange={handleChange} className="w-full border p-2 rounded">
              <option>Silk Sarees</option><option>Cotton Sarees</option><option>Fabrics</option><option>Dupattas</option><option>Accessories</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Original Price (₹) *</label>
            <input type="number" name="price" value={product.price} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <input type="number" name="discountPercentage" value={product.discountPercentage} onChange={handleChange} min="0" max="100" step="0.1" className="w-full border p-2 rounded" placeholder="0" />
            <p className="text-xs text-gray-500 mt-1">Leave 0 for no discount</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fabric</label>
            <input type="text" name="fabric" value={product.fabric} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input type="text" name="color" value={product.color} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={product.description} onChange={handleChange} rows="4" className="w-full border p-2 rounded" />
        </div>

        {/* Existing images */}
        <div>
          <label className="block text-sm font-medium mb-1">Current Images (click × to remove)</label>
          <div className="flex gap-3 flex-wrap">
            {existingImages.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20">
                <img src={url} alt="Existing" className="w-full h-full object-cover rounded" />
                <button type="button" onClick={() => removeExistingImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* New image upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Add New Images</label>
          <div className="border-dashed border-2 p-4 text-center rounded">
            <FaUpload className="mx-auto text-2xl text-gray-400" />
            <input type="file" multiple accept="image/*" onChange={handleNewImageUpload} className="mt-2" />
          </div>
          {newImagePreviews.length > 0 && (
            <div className="flex gap-3 mt-2 flex-wrap">
              {newImagePreviews.map((preview, idx) => (
                <div key={idx} className="relative w-20 h-20">
                  <img src={preview} alt="New preview" className="w-full h-full object-cover rounded" />
                  <button type="button" onClick={() => removeNewImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="inStock" checked={product.inStock} onChange={handleChange} />
          In Stock
        </label>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push('/products')} className="px-6 py-2 border rounded hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded flex items-center gap-2">
            <FaSave /> {loading ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}