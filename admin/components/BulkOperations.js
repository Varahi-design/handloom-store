import { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as XLSX from 'xlsx';
import { FaUpload, FaDownload, FaFileExcel } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function BulkOperations() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [operation, setOperation] = useState('import');

  const handleFileUpload = (e) => {
    const f = e.target.files[0];
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setResults({ type: 'preview', data: json });
    };
    reader.readAsArrayBuffer(f);
  };

  const handleBulkImport = async () => {
    if (!results?.data) return;
    setProcessing(true);
    const batch = writeBatch(db);
    let success = 0, fail = 0;
    for (const row of results.data) {
      const productRef = doc(collection(db, 'products'));
      batch.set(productRef, {
        ...row,
        price: parseFloat(row.price) || 0,
        inStock: row.inStock === 'true' || row.inStock === true,
        images: row.images ? row.images.split(',').map(url => url.trim()) : [],
        createdAt: new Date().toISOString(),
      });
      success++;
    }
    try {
      await batch.commit();
      toast.success(`Imported ${success} products`);
    } catch (err) {
      toast.error('Import failed');
      fail = success;
    }
    setProcessing(false);
  };

  const handleExport = async () => {
    const snap = await getDocs(collection(db, 'products'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'handloom-products.xlsx');
    toast.success('Exported products');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-bold">Bulk Operations</h2>
      <div className="flex gap-2">
        <button onClick={() => setOperation('import')} className={`px-4 py-2 rounded ${operation==='import'?'bg-primary text-white':'bg-gray-200'}`}>Import</button>
        <button onClick={() => setOperation('export')} className={`px-4 py-2 rounded ${operation==='export'?'bg-primary text-white':'bg-gray-200'}`}>Export</button>
      </div>
      {operation === 'import' && (
        <div>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="mb-2" />
          {results?.data && <p>{results.data.length} products found</p>}
          <button onClick={handleBulkImport} disabled={!results || processing} className="bg-green-600 text-white px-4 py-2 rounded">Import</button>
        </div>
      )}
      {operation === 'export' && (
        <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaDownload /> Export Products</button>
      )}
    </div>
  );
}