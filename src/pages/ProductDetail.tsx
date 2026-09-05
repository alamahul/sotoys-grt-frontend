import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Heart, Star, ChevronRight, ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { mockProducts } from '../data/mock';
import api, { normalizeProduct, getImageUrl, handleImageError } from '../utils/api';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import VariantSelectionModal from '../components/VariantSelectionModal';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [showVariantModal, setShowVariantModal] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([
    { id: 'r1', author: 'Budi Santoso', rating: 5, comment: 'Mainan sangat bagus sesuai gambar. Anak saya suka sekali! Pengiriman juga cepat.', date: '2 hari yang lalu' },
    { id: 'r2', author: 'Siti Aminah', rating: 4, comment: 'Kualitasnya standar tapi oke lah harganya murah. Agak lama di kurir aja.', date: '1 minggu yang lalu' }
  ]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Combine base product images + all variation option images into the gallery
  const allGalleryImages = React.useMemo(() => {
    if (!product) return [];
    const list = [...(product.images || [])];
    if (product.variations) {
      product.variations.forEach(v => {
        v.variation_options?.forEach(opt => {
          if (opt.image && !list.includes(opt.image)) {
            list.push(opt.image);
          }
        });
      });
    }
    return list.length > 0 ? list : ['/assets/uploads/products/placeholder.svg'];
  }, [product]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res && res.product && isMounted) {
          setProduct(normalizeProduct(res.product));
          setLoading(false);
          window.scrollTo(0, 0);
          return;
        }
      } catch (err) {
        console.warn('Backend product detail fetch failed, trying mock:', err);
      }

      if (isMounted) {
        const foundProduct = mockProducts.find(p => p.id === id || (p as any).slug === id);
        setProduct(foundProduct ? normalizeProduct(foundProduct) : null);
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 animate-pulse">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 bg-gray-200 rounded w-2/3 sm:w-64 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              <div className="w-full md:w-1/2 lg:w-5/12 flex-shrink-0">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex space-x-3 pb-2 overflow-x-hidden">
                  {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-md"></div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col pt-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="border-t border-b border-gray-100 py-6 mb-6">
                  <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mt-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produk Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">Maaf, mainan yang Anda cari tidak tersedia atau sudah dihapus.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSelectedVariantString = () => {
    return Object.entries(selectedVariant)
      .map(([type, option]) => `${type}: ${option}`)
      .join(' | ');
  };

  const handleVariantSelect = (type: string, optionName: string, optionImage?: string | null) => {
    setSelectedVariant(prev => ({ ...prev, [type]: optionName }));
    if (optionImage) {
      const idx = allGalleryImages.findIndex(img => img === optionImage);
      if (idx !== -1) {
        setActiveImage(idx);
      }
    }
  };

  const confirmAddToCart = () => {
    const variant = product?.variations && Object.keys(selectedVariant).length > 0
      ? { 
          type: product.variations[0]?.variation_type || '', 
          option: Object.values(selectedVariant)[0] || '' 
        }
      : null;
    
    if (product) {
      addToCart(product, quantity, variant);
      setAddedToCart(true);
      const variantText = variant ? ` (${getSelectedVariantString()})` : '';
      Swal.fire({
        title: 'Ditambahkan!',
        text: `${product.name}${variantText} berhasil ditambahkan ke keranjang.`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
        timer: 2000,
        timerProgressBar: true,
      });
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const isAllVariantsSelected = () => {
    if (!product?.variations || product.variations.length === 0) return true;
    return product.variations.every(v => Boolean(selectedVariant[v.variation_type]));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      Swal.fire({
        title: 'Stok Habis!',
        text: `Maaf, stok untuk produk "${product.name}" saat ini sedang kosong.`,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
      });
      return;
    }
    if (product?.variations && product.variations.length > 0) {
      if (isAllVariantsSelected()) {
        confirmAddToCart();
      } else {
        setShowVariantModal(true);
      }
    } else {
      confirmAddToCart();
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.stock <= 0) {
      Swal.fire({
        title: 'Stok Habis!',
        text: `Maaf, stok untuk produk "${product.name}" saat ini sedang kosong.`,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
      });
      return;
    }
    if (product?.variations && product.variations.length > 0) {
      if (isAllVariantsSelected()) {
        const variant = {
          type: product.variations[0]?.variation_type || '',
          option: Object.values(selectedVariant)[0] || ''
        };
        if (product) {
          addToCart(product, quantity, variant);
          navigate('/checkout');
        }
      } else {
        setShowVariantModal(true);
      }
    } else {
      const variant = null;
      if (product) {
        addToCart(product, quantity, variant);
        navigate('/checkout');
      }
    }
  };

  const isWished = isInWishlist(product?.id || '');
  const handleWishlistToggle = () => {
    if (isWished) {
      removeFromWishlist(product?.id || '');
      showToast('Dihapus dari wishlist', 'info');
    } else {
      if (product) {
        addToWishlist(product.id);
        showToast('Ditambahkan ke wishlist', 'success');
      }
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    setTimeout(() => {
      const newReview = {
        id: `r${Date.now()}`,
        author: 'Pengguna',
        rating: newRating,
        comment: newComment,
        date: 'Baru saja'
      };

      setReviews(prev => [newReview, ...prev]);
      setNewComment('');
      setNewRating(5);
      setIsSubmittingReview(false);
    }, 600);
  };

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>{product.name} | SOTOYS</title>
        <meta name="description" content={`Beli ${product.name} hanya di SOTOYS. Harga terbaik: ${formatCurrency(product.price)}.`} />
      </Helmet>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="hover:text-orange-600">Beranda</Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight size={16} className="mx-1" />
                <Link to="/catalog" className="hover:text-orange-600 cursor-pointer">Katalog</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight size={16} className="mx-1" />
                <span className="text-gray-800 font-medium">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Status Alert (If not published) */}
        {product.status && product.status !== 'published' && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3.5 shadow-2xs ${
            product.status === 'draft' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            product.status === 'archived' ? 'bg-purple-50 border-purple-200 text-purple-900' :
            'bg-gray-100 border-gray-200 text-gray-800'
          }`}>
            <AlertTriangle className="shrink-0 text-orange-600" size={24} />
            <div>
              <h4 className="font-bold text-sm">
                {product.status === 'draft' && 'Perhatian: Produk ini Masih Berstatus Draf'}
                {product.status === 'non-published' && 'Perhatian: Produk ini Sedang Diturunkan / Non-Published'}
                {product.status === 'archived' && 'Perhatian: Produk ini Telah Diarsipkan'}
              </h4>
              <p className="text-xs opacity-85 mt-0.5">
                {product.status === 'draft' && 'Produk ini belum resmi diterbitkan untuk publik dan sementara tidak dapat dipesan.'}
                {product.status === 'non-published' && 'Produk ini disembunyikan sementara dari katalog toko dan tidak dapat dibeli.'}
                {product.status === 'archived' && 'Produk ini sudah tidak dijual lagi dan disimpan hanya sebagai arsip catatan pesanan.'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-1/2 lg:w-5/12 flex-shrink-0">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 relative group shadow-xs border border-gray-100">
                <img
                  src={getImageUrl(allGalleryImages[activeImage] || allGalleryImages[0], 'detail')}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={handleImageError}
                />

                {allGalleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage(prev => (prev > 0 ? prev - 1 : allGalleryImages.length - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage(prev => (prev < allGalleryImages.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Selector */}
              {allGalleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {allGalleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage === idx ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={getImageUrl(img, 'thumb')} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={18} />
                  <span className="ml-1 font-bold text-gray-700">4.8</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span>240 Terjual</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span>Kategori: <strong className="text-gray-800">{product.category?.name || 'Mainan Anak'}</strong></span>
                  <span>•</span>
                  <span>Kondisi: <strong className="text-gray-800">{product.condition || 'Baru'}</strong></span>
                  <span>•</span>
                  <span>Berat: <strong className="text-gray-800">{product.weight || 200}g</strong></span>
                  <span>•</span>
                  <span>SKU: <span className="font-mono text-xs text-gray-700">{product.sku}</span></span>
                </div>
              </div>

              <div className="text-3xl font-bold text-orange-600 mb-6">
                {formatCurrency(product.price)}
              </div>

              <div className="border-t border-b border-gray-100 py-6 mb-6">
                {product.variations && product.variations.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Varian Produk</h3>
                    <div className="space-y-4">
                      {product.variations.map((variation, idx) => (
                        <div key={idx}>
                          <span className="text-xs text-gray-500 block mb-1.5 font-medium">{variation.variation_type}</span>
                          <div className="flex flex-wrap gap-2.5">
                            {variation.variation_options.map((option, optIdx) => {
                              const isSelected = selectedVariant[variation.variation_type] === option.name;
                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleVariantSelect(variation.variation_type, option.name, option.image)}
                                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl border-2 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-orange-600 bg-orange-50 text-orange-600 font-bold shadow-xs'
                                      : 'border-gray-200 hover:border-orange-200 bg-white text-gray-700 hover:bg-orange-50/20'
                                  }`}
                                >
                                  {option.image && (
                                    <img
                                      src={getImageUrl(option.image)}
                                      alt={option.name}
                                      className="w-6 h-6 object-cover rounded-md shrink-0 border border-gray-200"
                                      onError={handleImageError}
                                    />
                                  )}
                                  <span>{option.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Object.keys(selectedVariant).length > 0 && (
                  <div className="text-xs text-gray-600 mb-3">
                    Varian terpilih: <span className="font-medium text-gray-900">{getSelectedVariantString()}</span>
                  </div>
                )}

                <div className="flex items-center space-x-6 mb-6">
                  <span className="text-gray-700 font-medium">Atur Jumlah</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1 || product.stock <= 0}
                    >-</button>
                    <input
                      type="number"
                      className="w-12 text-center border-x border-gray-300 py-1.5 text-gray-900 focus:outline-none"
                      value={product.stock <= 0 ? 0 : quantity}
                      disabled={product.stock <= 0}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= product.stock || product.stock <= 0}
                    >+</button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock <= 0 ? (
                      <span className="text-red-500 font-semibold">Stok Habis (0)</span>
                    ) : (
                      <>Tersisa <b>{product.stock}</b> buah</>
                    )}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={Boolean(product.status && product.status !== 'published')}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all focus:outline-none ${
                      product.status && product.status !== 'published'
                        ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                        : product.stock <= 0
                        ? 'bg-gray-100 border border-gray-300 text-gray-500 hover:bg-gray-200 cursor-pointer'
                        : addedToCart
                        ? 'bg-green-500 text-white border-transparent'
                        : 'bg-orange-50 border border-orange-600 text-orange-600 hover:bg-orange-100'
                    }`}
                  >
                    {product.stock <= 0 ? (
                      <><ShoppingCart size={20} /> <span>Stok Habis</span></>
                    ) : addedToCart ? (
                      <><Check size={20} /> <span>Dimasukkan!</span></>
                    ) : (
                      <><ShoppingCart size={20} /> <span>Masukkan Keranjang</span></>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={Boolean(product.status && product.status !== 'published')}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold transition-colors focus:outline-none ${
                      product.status && product.status !== 'published'
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : product.stock <= 0
                        ? 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-pointer'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {product.status && product.status !== 'published'
                      ? 'Tidak Dapat Dibeli'
                      : product.stock <= 0
                      ? 'Stok Habis'
                      : 'Beli Langsung'}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className="p-3 border border-gray-300 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none"
                    aria-label={isWished ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
                  >
                    <Heart size={24} className={isWished ? "fill-red-500 text-red-500" : ""} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Deskripsi Produk</h3>
                <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                  {product.description || 'Tidak ada deskripsi rinci untuk produk ini.'}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ulasan Pembeli</h2>

          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-lg md:w-48 flex-shrink-0">
              <span className="text-5xl font-extrabold text-orange-600">{averageRating}</span>
              <div className="flex text-yellow-400 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={star <= Math.round(Number(averageRating)) ? "fill-current" : "text-gray-300"} size={20} />
                ))}
              </div>
              <span className="text-sm text-gray-500">Dari {reviews.length} ulasan</span>
            </div>

            <div className="flex-1 space-y-8">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Tulis Ulasan</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Penilaian</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={star <= newRating ? "text-yellow-400 fill-current" : "text-gray-300"}
                            size={24}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">Komentar</label>
                    <textarea
                      id="review"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
                      placeholder="Bagaimana kualitas produk ini?"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="px-6 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                  >
                    {isSubmittingReview ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Kirim Ulasan'
                    )}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className={star <= review.rating ? "fill-current" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{review.author}</span>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </main>

      <VariantSelectionModal
        product={product}
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        onAddToCart={(qty, variant) => {
          if (product) {
            addToCart(product, qty, variant);
            setAddedToCart(true);
            const variantText = variant ? ` (${variant.type}: ${variant.option})` : '';
            Swal.fire({
              title: 'Ditambahkan!',
              text: `${product.name}${variantText} berhasil ditambahkan ke keranjang.`,
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#ea580c',
              timer: 2000,
              timerProgressBar: true,
            });
            setTimeout(() => setAddedToCart(false), 2000);
          }
        }}
        onBuyNow={(qty, variant) => {
          if (product) {
            addToCart(product, qty, variant);
            navigate('/checkout');
          }
        }}
      />
    </div>
  );
}