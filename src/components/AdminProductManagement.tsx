import React, { useState } from 'react';
import { Package, Edit2, Trash2, Plus, LayoutGrid, List, Eye, X, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { mockProducts } from '../data/mock';
import { Product } from '../types';
import { Link } from 'react-router-dom';

export default function AdminProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    categoryId: '1',
    description: '',
    images: ''
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Produk berhasil dihapus dari katalog', 'success');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      description: product.description,
      images: product.images[0]
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      stock: 0,
      categoryId: '1',
      description: '',
      images: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        ...formData,
        images: [formData.images]
      } : p));
      showToast('Produk berhasil diperbarui', 'success');
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        sku: `NEW-${Date.now()}`,
        name: formData.name,
        price: formData.price,
        stock: formData.stock,
        categoryId: formData.categoryId,
        description: formData.description,
        rating: 0,
        reviews: [],
        images: [formData.images],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProducts(prev => [newProduct, ...prev]);
      showToast('Produk baru berhasil ditambahkan', 'success');
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Kanban logic
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return 'HABIS';
    if (stock <= 20) return 'MENIPIS';
    return 'AMAN';
  };

  const handleDragStart = (e: React.DragEvent, productId: string) => {
    e.dataTransfer.setData('productId', productId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const productId = e.dataTransfer.getData('productId');
    if (productId) {
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          let newStock = p.stock;
          if (newStatus === 'HABIS') newStock = 0;
          if (newStatus === 'MENIPIS' && p.stock > 20) newStock = 15; // simulate setting to low
          if (newStatus === 'AMAN' && p.stock <= 20) newStock = 50; // simulate restocking
          return { ...p, stock: newStock };
        }
        return p;
      }));
      showToast(`Stok produk diperbarui`, 'success');
    }
  };

  const renderKanbanBoard = () => {
    const columns = [
      { id: 'AMAN', title: 'Stok Aman (>20)', color: 'bg-green-50 border-green-200' },
      { id: 'MENIPIS', title: 'Stok Menipis (1-20)', color: 'bg-yellow-50 border-yellow-200' },
      { id: 'HABIS', title: 'Stok Habis (0)', color: 'bg-red-50 border-red-200' },
    ];

    return (
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {columns.map(col => (
          <div 
            key={col.id} 
            className={`flex-1 min-w-[280px] rounded-xl border ${col.color} p-4 flex flex-col`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
              {col.title}
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                {products.filter(p => getStockStatus(p.stock) === col.id).length}
              </span>
            </h3>
            <div className="flex flex-col gap-3 flex-1">
              {products.filter(p => getStockStatus(p.stock) === col.id).map(product => (
                <div 
                  key={product.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, product.id)}
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                >
                  <div className="flex gap-3">
                    <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded object-cover bg-gray-100" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 line-clamp-2 text-sm">{product.name}</h4>
                      <p className="text-orange-600 font-bold text-xs mt-1">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-gray-500 mt-1">Stok: {product.stock}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <button onClick={() => handleEdit(product)} className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-blue-600 hover:bg-blue-50">
                      <Edit2 size={14} />
                    </button>
                    <Link to={`/admin/products/${product.id}`} className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-green-600 hover:bg-green-50">
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-sm">
            <th className="p-4 font-semibold text-gray-700">Produk</th>
            <th className="p-4 font-semibold text-gray-700">Kategori</th>
            <th className="p-4 font-semibold text-gray-700">Harga</th>
            <th className="p-4 font-semibold text-gray-700">Stok</th>
            <th className="p-4 font-semibold text-gray-700 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {products.map(product => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                  <span className="font-medium text-gray-900 line-clamp-2 max-w-xs">{product.name}</span>
                </div>
              </td>
              <td className="p-4 text-gray-600">{product.categoryId}</td>
              <td className="p-4 text-gray-900 font-medium">{formatCurrency(product.price)}</td>
              <td className="p-4">
                <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                  product.stock > 20 ? 'bg-green-100 text-green-800' : 
                  product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {product.stock} tersisa
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end space-x-2">
                  <Link 
                    to={`/admin/products/${product.id}`}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Detail Produk"
                  >
                    <Eye size={16} />
                  </Link>
                  <button 
                    onClick={() => handleEdit(product)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Produk"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Hapus Produk"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                <Package size={32} className="text-gray-300 mb-2" />
                Katalog produk kosong.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8 relative">
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen Katalog Produk</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola stok, harga, dan ketersediaan mainan secara Interaktif atau Tabel.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={16} className="mr-2 hidden sm:block" /> Kanban Stok
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={16} className="mr-2 hidden sm:block" /> Tabel
            </button>
          </div>
          
          <button 
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-sm shadow-sm"
          >
            <Plus size={16} className="mr-1" /> Tambah Baru
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {viewMode === 'kanban' ? renderKanbanBoard() : renderTable()}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Tersedia</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Kategori</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none">
                    <option value="1">Mainan Edukasi</option>
                    <option value="2">Kendaraan & Remote Control</option>
                    <option value="3">Boneka & Action Figure</option>
                    <option value="4">Board Games & Puzzle</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <input required type="url" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} placeholder="https://..." className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Produk</label>
                  <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"></textarea>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 flex items-center">
                  <Save size={18} className="mr-2" /> Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
