import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Package, Edit2, Trash2, Plus, LayoutGrid, List, Eye, X, Save, 
  Upload, Image as ImageIcon, Loader2, CheckCircle2, Link as LinkIcon, 
  Search, ChevronLeft, ChevronRight, Layers, Tag, Filter,
  CheckSquare, Square, Archive, Globe, FileText, EyeOff, Check, AlertCircle, Star
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { mockProducts, mockCategories } from '../data/mock';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import api, { normalizeProduct, getImageUrl, handleImageError } from '../utils/api';

export default function AdminProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(mockCategories);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState<'ALL' | 'SAFE' | 'LOW' | 'OUT'>('ALL');
  const [selectedProductStatus, setSelectedProductStatus] = useState<'ALL' | 'published' | 'draft' | 'non-published' | 'archived'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { showToast } = useToast();
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    weight: 200,
    condition: 'Baru',
    status: 'published' as 'draft' | 'published' | 'non-published' | 'archived',
    categoryId: '1',
    description: '',
    images: [] as string[],
    hasVariations: false,
    variationType: 'Tipe',
    variationOptions: [] as { name: string; image: string }[]
  });

  useEffect(() => {
    setIsLoading(true);
    // Fetch products (all statuses for admin)
    api.get('/products?status=all')
      .then(res => {
        if (res?.products && Array.isArray(res.products) && res.products.length > 0) {
          setProducts(res.products.map(normalizeProduct));
        }
      })
      .catch(err => {
        console.warn('Backend /products?status=all fetch failed, using fallback:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Fetch categories
    api.get('/categories')
      .then(res => {
        if (res?.categories && Array.isArray(res.categories) && res.categories.length > 0) {
          setCategories(res.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered products with useMemo for high performance
  // Filtered products with useMemo for high performance
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Search Query (Name or SKU)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name ? p.name.toLowerCase().includes(q) : false;
        const matchSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
        if (!matchName && !matchSku) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) {
        return false;
      }

      // 3. Stock Filter
      if (selectedStockStatus === 'OUT' && p.stock > 0) return false;
      if (selectedStockStatus === 'LOW' && (p.stock <= 0 || p.stock > 20)) return false;
      if (selectedStockStatus === 'SAFE' && p.stock <= 20) return false;

      // 4. Product Status Filter (draft, published, non-published, archived)
      if (selectedProductStatus !== 'ALL') {
        const s = p.status || 'published';
        if (s !== selectedProductStatus) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStockStatus, selectedProductStatus]);

  // Product status count summary for tabs
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: products.length,
      published: 0,
      draft: 0,
      'non-published': 0,
      archived: 0
    };
    products.forEach(p => {
      const s = (p.status || 'published') as keyof typeof counts;
      if (s in counts) {
        counts[s]++;
      }
    });
    return counts;
  }, [products]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  // Selection logic for bulk actions
  const isAllOnPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id));

  const toggleSelectAllOnPage = () => {
    if (isAllOnPageSelected) {
      const pageIds = new Set(paginatedProducts.map(p => p.id));
      setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedProducts.map(p => p.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Status changers
  const handleSingleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'non-published' | 'archived') => {
    try {
      await api.patch(`/products/${id}/status`, { status: newStatus });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      showToast(`Status produk diubah menjadi ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status produk', 'error');
    }
  };

  const handleBulkStatusChange = async (newStatus: 'draft' | 'published' | 'non-published' | 'archived') => {
    if (selectedIds.length === 0) return;
    try {
      await api.patch('/products/bulk/status', { ids: selectedIds, status: newStatus });
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: newStatus } : p));
      showToast(`${selectedIds.length} produk berhasil diubah menjadi ${newStatus}`, 'success');
      setSelectedIds([]);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status produk', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Yakin ingin menghapus ${selectedIds.length} produk terpilih secara permanen?`)) {
      try {
        await api.post('/products/bulk/delete', { ids: selectedIds });
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        showToast(`${selectedIds.length} produk berhasil dihapus`, 'success');
        setSelectedIds([]);
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus produk', 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(prev => prev.filter(p => p.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
        showToast('Produk berhasil dihapus dari katalog', 'success');
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus produk', 'error');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const hasVars = Boolean(product.variations && product.variations.length > 0);
    const varType = product.variations?.[0]?.variation_type || 'Tipe';
    const varOpts = product.variations?.[0]?.variation_options
      ? product.variations[0].variation_options.map(opt => ({ name: opt.name, image: opt.image || '' }))
      : [];

    // Filter out variation images from base product images so base images stay distinct
    const varImages = new Set(varOpts.map(o => o.image).filter(Boolean));
    const baseImages = (product.images || []).filter(img => !varImages.has(img));

    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      weight: product.weight || 200,
      condition: product.condition || 'Baru',
      status: product.status || 'published',
      categoryId: product.categoryId || (categories[0]?.id || '1'),
      description: product.description,
      images: baseImages.length > 0 ? baseImages : (product.images && product.images.length > 0 ? product.images : []),
      hasVariations: hasVars,
      variationType: varType,
      variationOptions: varOpts
    });
    setCustomImageUrl('');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      stock: 0,
      weight: 200,
      condition: 'Baru',
      status: 'published',
      categoryId: categories[0]?.id || '1',
      description: '',
      images: [],
      hasVariations: false,
      variationType: 'Tipe',
      variationOptions: []
    });
    setCustomImageUrl('');
    setIsModalOpen(true);
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const next = [...prev.images];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      return { ...prev, images: next };
    });
    showToast('Foto utama produk berhasil diatur', 'success');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      showToast('Masukkan URL gambar yang valid (dimulai http/https)', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, trimmed]
    }));
    setCustomImageUrl('');
    showToast('Foto URL berhasil ditambahkan ke galeri', 'success');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploadingImage(true);
    let successCount = 0;

    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        showToast(`File ${file.name} harus berupa gambar`, 'error');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast(`Ukuran ${file.name} maksimal 5MB`, 'error');
        continue;
      }

      try {
        const form = new FormData();
        form.append('image', file);
        const res = await api.upload('/products/upload', form);
        if (res?.url) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, res.url]
          }));
          successCount++;
        }
      } catch (err: any) {
        showToast(err.message || `Gagal mengunggah ${file.name}`, 'error');
      }
    }

    setIsUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (successCount > 0) {
      showToast(`${successCount} foto berhasil diunggah ke Cloudinary!`, 'success');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct variations if enabled
    const variations = formData.hasVariations && formData.variationOptions.length > 0
      ? [
          {
            variation_type: formData.variationType.trim() || 'Tipe',
            variation_options: formData.variationOptions
              .filter(o => o.name.trim() !== '')
              .map(o => ({ name: o.name.trim(), image: o.image || null }))
          }
        ]
      : [];

    // Collect all base images (fallback to placeholder if empty)
    const baseImages = formData.images.length > 0
      ? formData.images
      : ['/assets/uploads/products/placeholder.svg'];

    // Collect all images including variation images
    const combinedImages = [...baseImages];
    if (variations && variations.length > 0) {
      variations[0].variation_options.forEach(opt => {
        if (opt.image && !combinedImages.includes(opt.image)) {
          combinedImages.push(opt.image);
        }
      });
    }

    if (editingProduct) {
      try {
        const payload = {
          name: formData.name,
          price: Number(formData.price),
          stock: Number(formData.stock),
          weight: Number(formData.weight) || 200,
          condition: formData.condition || 'Baru',
          status: formData.status || 'published',
          categoryId: formData.categoryId,
          description: formData.description,
          images: combinedImages,
          variations
        };
        await api.put(`/products/${editingProduct.id}`, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
          ...p,
          ...payload,
        } : p));
        showToast('Produk berhasil diperbarui', 'success');
        setIsModalOpen(false);
      } catch (err: any) {
        showToast(err.message || 'Gagal memperbarui produk', 'error');
      }
    } else {
      try {
        const payload = {
          name: formData.name,
          price: Number(formData.price),
          stock: Number(formData.stock),
          weight: Number(formData.weight) || 200,
          condition: formData.condition || 'Baru',
          status: formData.status || 'published',
          categoryId: formData.categoryId,
          description: formData.description,
          images: combinedImages,
          variations
        };
        const res = await api.post('/products', payload);
        const created = res?.product ? normalizeProduct(res.product) : {
          id: `prod-${Date.now()}`,
          sku: `NEW-${Date.now()}`,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          name: formData.name,
          price: formData.price,
          stock: formData.stock,
          weight: formData.weight,
          condition: formData.condition,
          status: formData.status,
          categoryId: formData.categoryId,
          description: formData.description,
          rating: 0,
          reviews: [],
          images: combinedImages,
          variations,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setProducts(prev => [created, ...prev]);
        showToast('Produk baru berhasil ditambahkan', 'success');
        setIsModalOpen(false);
      } catch (err: any) {
        showToast(err.message || 'Gagal menambahkan produk', 'error');
      }
    }
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

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const productId = e.dataTransfer.getData('productId');
    if (productId) {
      let targetStock = 0;
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          let newStock = p.stock;
          if (newStatus === 'HABIS') newStock = 0;
          if (newStatus === 'MENIPIS' && p.stock > 20) newStock = 15; // simulate setting to low
          if (newStatus === 'AMAN' && p.stock <= 20) newStock = 50; // simulate restocking
          targetStock = newStock;
          return { ...p, stock: newStock };
        }
        return p;
      }));
      showToast('Stok produk diperbarui', 'success');

      try {
        await api.put(`/products/${productId}`, { stock: targetStock });
      } catch (err: any) {
        console.warn('Failed to sync stock with backend:', err.message);
      }
    }
  };

  const renderKanbanBoard = () => {
    const columns = [
      { id: 'AMAN', title: 'Stok Aman (> 20 pcs)', color: 'border-green-200 bg-green-50/30' },
      { id: 'MENIPIS', title: 'Stok Menipis (1 - 20 pcs)', color: 'border-yellow-200 bg-yellow-50/30' },
      { id: 'HABIS', title: 'Stok Habis (0 pcs)', color: 'border-red-200 bg-red-50/30' },
    ];

    return (
      <div className="flex gap-4 overflow-x-auto p-4 min-h-[500px]">
        {columns.map(col => {
          const colProducts = filteredProducts.filter(p => getStockStatus(p.stock) === col.id);
          const displayLimit = 25;
          const displayProducts = colProducts.slice(0, displayLimit);

          return (
            <div 
              key={col.id} 
              className={`flex-1 min-w-[290px] rounded-xl border ${col.color} p-4 flex flex-col`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                {col.title}
                <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs">
                  {colProducts.length}
                </span>
              </h3>
              
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {displayProducts.map(product => (
                  <div 
                    key={product.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, product.id)}
                    className="bg-white p-3 rounded-lg shadow-xs border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                  >
                    <div className="flex gap-3">
                      <img 
                        src={getImageUrl(product.images[0])} 
                        alt={product.name} 
                        className="w-16 h-16 rounded object-cover bg-gray-100 shrink-0" 
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 line-clamp-2 text-xs leading-snug">{product.name}</h4>
                        <p className="text-orange-600 font-bold text-xs mt-1">{formatCurrency(product.price)}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span>Stok: <strong className="text-gray-700">{product.stock}</strong></span>
                          <span>•</span>
                          <span>{product.weight || 200}g</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <button onClick={() => handleEdit(product)} className="p-1.5 bg-white shadow-xs border border-gray-100 rounded-md text-blue-600 hover:bg-blue-50">
                        <Edit2 size={13} />
                      </button>
                      <Link to={`/admin/products/${product.slug || product.id}`} className="p-1.5 bg-white shadow-xs border border-gray-100 rounded-md text-green-600 hover:bg-green-50">
                        <Eye size={13} />
                      </Link>
                    </div>
                  </div>
                ))}

                {colProducts.length > displayLimit && (
                  <div className="text-center py-2 text-xs text-gray-400 font-medium bg-white/60 rounded-lg">
                    +{colProducts.length - displayLimit} produk lainnya (gunakan pencarian/filter)
                  </div>
                )}

                {colProducts.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-400 py-8">
                    Tidak ada produk
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Status Badge Helper
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draf', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'non-published':
        return { label: 'Non-Published', color: 'bg-gray-100 text-gray-700 border-gray-300' };
      case 'archived':
        return { label: 'Diarsipkan', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'published':
      default:
        return { label: 'Diterbitkan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const getCategoryName = (p: Product) => {
    if (p.category?.name) return p.category.name;
    const found = categories.find(c => String(c.id) === String(p.categoryId));
    if (found?.name) return found.name;
    const mockFound = mockCategories.find(c => String(c.id) === String(p.categoryId));
    return mockFound?.name || 'Mainan Lainnya';
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-600 uppercase font-semibold">
            <th className="p-4 w-10">
              <input
                type="checkbox"
                checked={isAllOnPageSelected}
                onChange={toggleSelectAllOnPage}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300 cursor-pointer"
                title="Pilih semua di halaman ini"
              />
            </th>
            <th className="p-4">Produk</th>
            <th className="p-4">Kategori & Berat</th>
            <th className="p-4">Harga</th>
            <th className="p-4">Stok & Kondisi</th>
            <th className="p-4">Status Publikasi</th>
            <th className="p-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {paginatedProducts.map(product => {
            const isSelected = selectedIds.includes(product.id);
            const statusInfo = getStatusBadge(product.status);

            return (
              <tr 
                key={product.id} 
                className={`transition-colors ${isSelected ? 'bg-orange-50/70' : 'hover:bg-orange-50/30'}`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectProduct(product.id)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300 cursor-pointer"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <img 
                        src={getImageUrl(product.images[0])} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                        onError={handleImageError}
                      />
                      {product.images && product.images.length > 1 && (
                        <span 
                          className="absolute bottom-0 right-0 bg-gray-900/80 text-white text-[9px] font-bold px-1 rounded-tl-sm backdrop-blur-2xs"
                          title={`${product.images.length} foto tersedia`}
                        >
                          +{product.images.length - 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 line-clamp-1 max-w-sm block text-sm">{product.name}</span>
                      <span className="text-[11px] font-mono text-gray-400 block">{product.sku}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-xs text-gray-700 block font-medium line-clamp-1 max-w-[180px]">{getCategoryName(product)}</span>
                  <span className="text-[11px] text-gray-400">{product.weight || 200} gram</span>
                </td>
                <td className="p-4 text-gray-900 font-bold">{formatCurrency(product.price)}</td>
                <td className="p-4">
                  <div className="space-y-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                      product.stock > 20 ? 'bg-green-100 text-green-800' : 
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} pcs
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {product.condition || 'Baru'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  {/* Quick status dropdown */}
                  <select
                    value={product.status || 'published'}
                    onChange={(e) => handleSingleStatusChange(product.id, e.target.value as any)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition shadow-2xs ${statusInfo.color}`}
                    title="Ubah status publikasi"
                  >
                    <option value="published">Diterbitkan (Published)</option>
                    <option value="draft">Draf (Draft)</option>
                    <option value="non-published">Non-Published</option>
                    <option value="archived">Diarsipkan (Archived)</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link 
                      to={`/admin/products/${product.slug || product.id}`}
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
            );
          })}
          {paginatedProducts.length === 0 && (
            <tr>
              <td colSpan={7} className="p-12 text-center text-gray-500">
                <Package size={36} className="text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Tidak ada produk yang cocok</p>
                <p className="text-xs text-gray-400 mt-1">Coba sesuaikan status publikasi, pencarian, atau filter kategori Anda.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mt-8 relative">
      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-900 text-white p-3.5 px-6 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xl border-b border-gray-800 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
              {selectedIds.length} produk dipilih
            </span>
            <span className="text-xs text-gray-300 hidden sm:inline">Aksi Massal:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkStatusChange('published')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center shadow-xs"
              title="Terbitkan semua produk terpilih"
            >
              <Globe size={13} className="mr-1.5" /> Terbitkan
            </button>
            <button
              onClick={() => handleBulkStatusChange('draft')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition flex items-center shadow-xs"
              title="Jadikan draf produk terpilih"
            >
              <FileText size={13} className="mr-1.5" /> Draf
            </button>
            <button
              onClick={() => handleBulkStatusChange('non-published')}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition flex items-center shadow-xs"
              title="Sembunyikan produk terpilih dari publik"
            >
              <EyeOff size={13} className="mr-1.5" /> Non-Publish
            </button>
            <button
              onClick={() => handleBulkStatusChange('archived')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition flex items-center shadow-xs"
              title="Arsipkan produk terpilih"
            >
              <Archive size={13} className="mr-1.5" /> Arsipkan
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition flex items-center shadow-xs ml-1"
              title="Hapus permanen produk terpilih"
            >
              <Trash2 size={13} className="mr-1.5" /> Hapus Terpilih
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen Katalog Produk</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola stok, status publikasi, variasi tipe, dan aksi massal produk mainan.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={16} className="mr-2" /> Tabel
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={16} className="mr-2" /> Kanban
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition shadow-sm hover:shadow"
          >
            <Plus size={16} className="mr-1.5" /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => { setSelectedProductStatus('ALL'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedProductStatus === 'ALL'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-200/70'
          }`}
        >
          Semua Status <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[11px]">{statusCounts.ALL}</span>
        </button>
        <button
          onClick={() => { setSelectedProductStatus('published'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedProductStatus === 'published'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Globe size={13} /> Diterbitkan <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[11px] font-bold">{statusCounts.published}</span>
        </button>
        <button
          onClick={() => { setSelectedProductStatus('draft'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedProductStatus === 'draft'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          <FileText size={13} /> Draf <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full text-[11px] font-bold">{statusCounts.draft}</span>
        </button>
        <button
          onClick={() => { setSelectedProductStatus('non-published'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedProductStatus === 'non-published'
              ? 'bg-gray-700 text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-200/70'
          }`}
        >
          <EyeOff size={13} /> Non-Published <span className="bg-gray-200 text-gray-800 px-1.5 py-0.2 rounded-full text-[11px] font-bold">{statusCounts['non-published']}</span>
        </button>
        <button
          onClick={() => { setSelectedProductStatus('archived'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedProductStatus === 'archived'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Archive size={13} /> Diarsipkan <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full text-[11px] font-bold">{statusCounts.archived}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 w-full md:w-auto items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Cari produk (Nama atau SKU)..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="w-52 hidden sm:block">
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 truncate"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Filter Pills & Counter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 text-xs">
            <button
              onClick={() => { setSelectedStockStatus('ALL'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md font-medium transition ${selectedStockStatus === 'ALL' ? 'bg-orange-100 text-orange-700 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => { setSelectedStockStatus('SAFE'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md font-medium transition ${selectedStockStatus === 'SAFE' ? 'bg-green-100 text-green-700 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Aman
            </button>
            <button
              onClick={() => { setSelectedStockStatus('LOW'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md font-medium transition ${selectedStockStatus === 'LOW' ? 'bg-yellow-100 text-yellow-700 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Menipis
            </button>
            <button
              onClick={() => { setSelectedStockStatus('OUT'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md font-medium transition ${selectedStockStatus === 'OUT' ? 'bg-red-100 text-red-700 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Habis
            </button>
          </div>

          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
            {filteredProducts.length} produk
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'kanban' ? renderKanbanBoard() : renderTable()}

      {/* Pagination Controls */}
      {viewMode === 'table' && filteredProducts.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per halaman (Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>)</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            
            {getPageNumbers(currentPage, totalPages).map((p, idx) => (
              typeof p === 'number' ? (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-md font-bold transition text-xs ${
                    currentPage === p 
                      ? 'bg-orange-600 text-white shadow-xs' 
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} className="px-1 text-gray-400 font-bold">...</span>
              )
            ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700"
              title="Halaman Selanjutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Berat Produk (gram)</label>
                  <input 
                    type="number" 
                    value={formData.weight} 
                    onChange={e => setFormData({...formData, weight: Number(e.target.value)})} 
                    placeholder="200"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Produk</label>
                  <select 
                    value={formData.condition} 
                    onChange={e => setFormData({...formData, condition: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                  >
                    <option value="Baru">Baru (Segel / Original)</option>
                    <option value="Bekas">Bekas (Layak Pakai)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Kategori</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none">
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Foto Produk (Galeri Utama)</label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Anda bisa mengunggah banyak foto untuk produk ini. Foto pertama otomatis menjadi <strong>Foto Sampul Utama</strong>.
                      </p>
                    </div>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          imageInputMode === 'upload' ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Upload size={12} className="inline mr-1" /> Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          imageInputMode === 'url' ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <LinkIcon size={12} className="inline mr-1" /> Tautan URL
                      </button>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* Uploading progress indicator */}
                  {isUploadingImage && (
                    <div className="mb-3 border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-xl p-4 text-center">
                      <Loader2 size={24} className="animate-spin text-orange-600 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-orange-700">Mengunggah foto ke Cloudinary...</p>
                      <p className="text-[11px] text-gray-500">Menyimpan dan mengoptimalkan gambar di Cloudinary CDN</p>
                    </div>
                  )}

                  {/* URL Input Box if imageInputMode is url */}
                  {imageInputMode === 'url' && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={customImageUrl}
                          onChange={e => setCustomImageUrl(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomImageUrl(); } }}
                          placeholder="https://res.cloudinary.com/... atau https://..."
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-orange-500 focus:border-orange-500 outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomImageUrl}
                          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                        >
                          + Tambahkan Foto
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">Masukkan URL gambar online yang valid lalu klik tombol tambah.</p>
                    </div>
                  )}

                  {/* Gallery Grid */}
                  {formData.images.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {formData.images.map((imgUrl, index) => (
                          <div 
                            key={index} 
                            className={`group relative rounded-xl border-2 overflow-hidden bg-gray-50 flex flex-col transition-all ${
                              index === 0 ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="aspect-square relative overflow-hidden bg-white">
                              <img 
                                src={getImageUrl(imgUrl)} 
                                alt={`Foto produk ${index + 1}`} 
                                className="w-full h-full object-cover" 
                                onError={handleImageError}
                              />

                              {/* Primary badge or Make Primary button */}
                              {index === 0 ? (
                                <span className="absolute top-1.5 left-1.5 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                  <Star size={10} className="fill-current" /> Sampul
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(index)}
                                  className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-orange-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs cursor-pointer"
                                  title="Jadikan foto sampul utama"
                                >
                                  Jadikan Sampul
                                </button>
                              )}

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Hapus foto dari produk"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <div className="p-1.5 px-2 text-center bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-600">
                                {index === 0 ? 'Foto Sampul' : `Foto #${index + 1}`}
                              </span>
                              <span className="text-[9px] text-gray-400 truncate max-w-[80px]">
                                {imgUrl.includes('cloudinary.com') ? 'Cloudinary' : 'Galeri'}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Add More Tile */}
                        <div
                          onClick={() => {
                            if (imageInputMode === 'upload') {
                              fileInputRef.current?.click();
                            }
                          }}
                          className="aspect-square border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50/30 rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer transition text-center group"
                          title="Tambah foto lagi"
                        >
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                            <Plus size={18} />
                          </div>
                          <span className="text-xs font-bold text-gray-700">+ Foto Lain</span>
                          <span className="text-[10px] text-gray-400">Pilih berkas</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty state dropzone */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50/30 rounded-xl p-6 text-center cursor-pointer transition group"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-gray-800">
                        Klik untuk memilih foto produk (Bisa pilih banyak sekaligus)
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        PNG, JPG, atau WebP hingga 5MB. Foto otomatis tersimpan di Cloudinary CDN.
                      </p>
                    </div>
                  )}
                </div>

                {/* Toggle & Daftar Tipe / Varian Produk */}
                <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="text-sm font-bold text-gray-900 block flex items-center">
                        <Layers size={16} className="mr-1.5 text-orange-600" /> Tipe / Varian Produk
                      </label>
                      <p className="text-xs text-gray-500">Atur apakah produk memiliki tipe (warna, model, ukuran) beserta foto per tipenya.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        hasVariations: !prev.hasVariations,
                        variationOptions: !prev.hasVariations && prev.variationOptions.length === 0
                          ? [{ name: 'Varian 1', image: '' }]
                          : prev.variationOptions
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.hasVariations ? 'bg-orange-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.hasVariations ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {formData.hasVariations && (
                    <div className="bg-orange-50/40 rounded-xl p-4 border border-orange-200 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nama Jenis Variasi</label>
                        <input
                          type="text"
                          value={formData.variationType}
                          onChange={e => setFormData({ ...formData, variationType: e.target.value })}
                          placeholder="Contoh: Warna, Model, Karakter, Tipe"
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs outline-none focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-gray-700">Daftar Pilihan & Foto Tiap Tipe</label>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              variationOptions: [...prev.variationOptions, { name: '', image: '' }]
                            }))}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center"
                          >
                            <Plus size={14} className="mr-1" /> Tambah Tipe
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {formData.variationOptions.map((opt, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <input
                                type="text"
                                placeholder={`Nama tipe #${idx + 1} (misal: Merah / Robot A)`}
                                value={opt.name}
                                onChange={e => {
                                  const newOpts = [...formData.variationOptions];
                                  newOpts[idx].name = e.target.value;
                                  setFormData({ ...formData, variationOptions: newOpts });
                                }}
                                className="flex-1 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:ring-orange-500 w-full"
                              />

                              {/* Upload Foto Varian ke Cloudinary */}
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                {opt.image ? (
                                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 pr-2">
                                    <img 
                                      src={getImageUrl(opt.image)} 
                                      alt={opt.name} 
                                      className="w-8 h-8 rounded object-cover" 
                                      onError={handleImageError}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOpts = [...formData.variationOptions];
                                        newOpts[idx].image = '';
                                        setFormData({ ...formData, variationOptions: newOpts });
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                                      title="Hapus foto"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer px-2.5 py-1.5 bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg text-xs font-semibold flex items-center border border-gray-200 transition shrink-0">
                                    <Upload size={12} className="mr-1" /> Foto Tipe
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const f = e.target.files?.[0];
                                        if (!f) return;
                                        try {
                                          showToast('Mengunggah foto tipe ke Cloudinary...', 'info');
                                          const form = new FormData();
                                          form.append('image', f);
                                          const res = await api.upload('/products/upload', form);
                                          if (res?.url) {
                                            const newOpts = [...formData.variationOptions];
                                            newOpts[idx].image = res.url;
                                            setFormData({ ...formData, variationOptions: newOpts });
                                            showToast('Foto tipe berhasil diunggah ke Cloudinary!', 'success');
                                          }
                                        } catch (err: any) {
                                          showToast(err.message || 'Gagal upload foto tipe', 'error');
                                        }
                                      }}
                                    />
                                  </label>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOpts = formData.variationOptions.filter((_, i) => i !== idx);
                                    setFormData({ ...formData, variationOptions: newOpts });
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                  title="Hapus pilihan tipe"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Publikasi Produk */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Status Publikasi Produk</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'published', label: 'Diterbitkan', desc: 'Tayang di katalog & pencarian', badge: 'bg-emerald-100 text-emerald-800' },
                      { id: 'draft', label: 'Draf', desc: 'Belum siap tayang', badge: 'bg-amber-100 text-amber-800' },
                      { id: 'non-published', label: 'Non-Published', desc: 'Sembunyikan dari publik', badge: 'bg-gray-100 text-gray-800' },
                      { id: 'archived', label: 'Diarsipkan', desc: 'Arsip lama tidak dijual', badge: 'bg-purple-100 text-purple-800' },
                    ].map((st) => {
                      const isActive = (formData.status || 'published') === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: st.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isActive 
                              ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-50/20 shadow-xs' 
                              : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${st.badge}`}>
                              {st.label}
                            </span>
                            {isActive && <Check size={14} className="text-orange-600" />}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 leading-tight">{st.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Produk</label>
                  <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"></textarea>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 text-sm"
                >
                  Batal
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    type="button" 
                    onClick={(e) => {
                      setFormData(prev => ({ ...prev, status: 'draft' }));
                      setTimeout(() => {
                        const form = (e.target as HTMLElement).closest('form');
                        if (form) form.requestSubmit();
                      }, 50);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 border border-amber-300 bg-amber-50 text-amber-800 font-bold rounded-lg hover:bg-amber-100 text-sm flex items-center justify-center transition"
                  >
                    <FileText size={16} className="mr-1.5" /> Simpan sebagai Draf
                  </button>
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 flex items-center justify-center text-sm shadow-sm transition"
                  >
                    <Save size={16} className="mr-1.5" /> {formData.status === 'published' ? 'Terbitkan Produk' : 'Simpan Produk'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
