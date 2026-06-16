import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Heart, Star, ChevronRight, Check } from 'lucide-react';
import { mockProducts } from '../data/mock';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
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

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      const foundProduct = mockProducts.find(p => p.id === id);
      setProduct(foundProduct || null);
      setLoading(false);
      window.scrollTo(0, 0);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 animate-pulse">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-2/3 sm:w-64 mb-6"></div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

              {/* Image Gallery Skeleton */}
              <div className="w-full md:w-1/2 lg:w-5/12 flex-shrink-0">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex space-x-3 pb-2 overflow-x-hidden">
                  {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-md"></div>
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col pt-2">
                {/* Title */}
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>

                {/* Rating line */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Price */}
                <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>

                {/* Actions Box */}
                <div className="border-t border-b border-gray-100 py-6 mb-6">
                  <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>

                {/* Description */}
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

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      showToast(`${product.name} ditambahkan ke keranjang`, 'success');
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/checkout');
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
        author: 'Pengguna', // Mocked user name
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
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="hover:text-orange-600">Beranda</Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight size={16} className="mx-1" />
                <span className="hover:text-orange-600 cursor-pointer">Kategori</span>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

            {/* Image Gallery */}
            <div className="w-full md:w-1/2 lg:w-5/12 flex-shrink-0">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                <img
                  src={product.images[activeImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-orange-500' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={18} />
                  <span className="ml-1 font-bold text-gray-700">4.8</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500 text-sm">240 Terjual</span>
                </div>
                <div className="text-gray-500 text-sm">
                  Kondisi: <span className="font-medium text-gray-800">Baru</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-orange-600 mb-6">
                {formatCurrency(product.price)}
              </div>

              {/* Quantity and Actions */}
              <div className="border-t border-b border-gray-100 py-6 mb-6">
                <div className="flex items-center space-x-6 mb-6">
                  <span className="text-gray-700 font-medium">Atur Jumlah</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition"
                      disabled={quantity <= 1}
                    >-</button>
                    <input
                      type="number"
                      className="w-12 text-center border-x border-gray-300 py-1.5 text-gray-900 focus:outline-none"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition"
                      disabled={quantity >= product.stock}
                    >+</button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Tersisa <b>{product.stock}</b> buah
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${addedToCart
                        ? 'bg-green-500 text-white border-transparent'
                        : 'bg-orange-50 border border-orange-600 text-orange-600 hover:bg-orange-100'
                      }`}
                  >
                    {addedToCart ? <><Check size={20} /> <span>Dimasukkan!</span></> : <><ShoppingCart size={20} /> <span>Masukkan Keranjang</span></>}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3 px-6 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Beli Langsung
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

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Deskripsi Produk</h3>
                <div className="text-gray-600 leading-relaxed text-sm">
                  {product.description}
                  <br /><br />
                  <b>Spesifikasi:</b>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>SKU: {product.sku}</li>
                    <li>Label: SNI (Standar Nasional Indonesia)</li>
                    <li>Rekomendasi Usia: 3 Tahun ke atas</li>
                    <li>Material: Plastik / Kayu berkualitas tinggi aman untuk anak</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
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
              {/* Review submit form */}
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

              {/* Reviews List */}
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
    </div>
  );
}
