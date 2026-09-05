import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Edit2, Trash2, Tag, Star, BarChart3, AlertTriangle } from 'lucide-react';
import { mockProducts } from '../../data/mock';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';
import api, { normalizeProduct, getImageUrl, handleImageError } from '../../utils/api';

export default function AdminDetailsProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeImage, setActiveImage] = useState(0);

  const [product, setProduct] = useState<Product>(() => {
    return mockProducts.find(p => p.id === id) || mockProducts[0];
  });

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`)
      .then(res => {
        if (res?.product) {
          setProduct(normalizeProduct(res.product));
        }
      })
      .catch(err => {
        console.warn('Failed to load product detail from API:', err);
      });
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleDelete = async () => {
    if (window.confirm('Yakin ingin menghapus produk ini dari katalog?')) {
      try {
        await api.delete(`/products/${id}`);
        showToast('Produk berhasil dihapus', 'success');
        navigate('/admin/products');
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus produk', 'error');
      }
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'published' | 'non-published' | 'archived') => {
    try {
      await api.patch(`/products/${product.id}/status`, { status: newStatus });
      setProduct(prev => ({ ...prev, status: newStatus }));
      showToast(`Status produk berhasil diubah menjadi ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status produk', 'error');
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Stok Habis', color: 'text-red-600 bg-red-100', icon: <AlertTriangle size={16} className="mr-1" /> };
    if (stock <= 20) return { label: 'Stok Menipis', color: 'text-yellow-600 bg-yellow-100', icon: <AlertTriangle size={16} className="mr-1" /> };
    return { label: 'Stok Aman', color: 'text-green-600 bg-green-100', icon: <Package size={16} className="mr-1" /> };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/products')} className="mr-4 p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-orange-600 hover:border-orange-200 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center">
                Detail Produk
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                ID Produk: {product.id}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center"
            >
              <Trash2 size={16} className="mr-2" /> Hapus
            </button>
            <button 
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center"
            >
              <Edit2 size={16} className="mr-2" /> Edit Produk
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Image & Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-3">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative mb-3">
                <img 
                  src={getImageUrl(product.images[activeImage] || product.images[0])} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all duration-200"
                  onError={handleImageError} 
                />
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${stockStatus.color}`}>
                    {stockStatus.icon} {stockStatus.label}
                  </span>
                  <select
                    value={product.status || 'published'}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg border border-gray-200 bg-white/95 backdrop-blur shadow-xs cursor-pointer outline-none hover:border-orange-500 transition"
                    title="Ubah Status Publikasi"
                  >
                    <option value="published">🟢 Diterbitkan</option>
                    <option value="draft">🟡 Draf</option>
                    <option value="non-published">⚪ Non-Published</option>
                    <option value="archived">🟣 Diarsipkan</option>
                  </select>
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                        activeImage === idx 
                          ? 'border-orange-500 ring-2 ring-orange-500/20 scale-105' 
                          : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={getImageUrl(img)} 
                        alt={`${product.name} - ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Statistik Penjualan</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center"><BarChart3 size={18} className="mr-2 text-gray-400" /> Terjual</span>
                  <span className="font-bold text-gray-900">124 pcs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center"><Star size={18} className="mr-2 text-gray-400" /> Rating</span>
                  <span className="font-bold text-gray-900 flex items-center">
                    {product.rating ? product.rating : "Belum ada rating"} <span className="text-gray-400 text-xs ml-1">({product.reviews?.length || 0} ulasan)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <div className="flex items-center text-sm text-orange-600 font-bold mb-2">
                  <Tag size={16} className="mr-1" /> {product.category?.name || product.categoryId || 'Mainan Anak'}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <div className="text-3xl font-extrabold text-orange-600">{formatCurrency(product.price)}</div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Informasi Inventaris</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Stok Saat Ini</p>
                    <p className="text-xl font-bold text-gray-900">{product.stock}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Stok Minimum</p>
                    <p className="text-xl font-bold text-gray-900">20</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Berat</p>
                    <p className="text-xl font-bold text-gray-900">{product.weight ? `${product.weight}g` : '200g'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Kondisi</p>
                    <p className="text-xl font-bold text-gray-900">{product.condition || 'Baru'}</p>
                  </div>
                </div>
              </div>

              {product.variations && product.variations.length > 0 && (
                <div className="border-t border-gray-100 pt-6 mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Tipe & Varian Produk</h3>
                  <div className="space-y-4">
                    {product.variations.map((v, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-gray-700 mb-2">{v.variation_type}</p>
                        <div className="flex flex-wrap gap-3">
                          {v.variation_options.map((opt, j) => (
                            <div key={j} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 text-xs">
                              {opt.image && (
                                <img src={getImageUrl(opt.image)} alt={opt.name} className="w-6 h-6 object-cover rounded" />
                              )}
                              <span className="font-medium text-gray-800">{opt.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Deskripsi Produk</h3>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description || 'Tidak ada deskripsi untuk produk ini.'}
                </div>
              </div>
            </div>

            {/* Reviews Section Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">
                Ulasan Pelanggan Terakhir
              </h3>
              <div className="text-center py-6 text-gray-500 text-sm">
                Belum ada ulasan terbaru untuk produk ini.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
