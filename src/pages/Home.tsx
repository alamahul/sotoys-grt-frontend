import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import useSmartLoading from '../hooks/useSmartLoading';
import { mockProducts } from '../data/mock';
import api, { normalizeProduct, getImageUrl, handleImageError } from '../utils/api';
import { Product } from '../types';
import { motion } from 'motion/react';
import TestimonialCarousel from '../components/TestimonialCarousel';
import VariantSelectionModal from '../components/VariantSelectionModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);

  const fetchFeatured = async (): Promise<Product[]> => {
    try {
      const res = await api.get('/products');
      if (res && Array.isArray(res.products) && res.products.length > 0) {
        return res.products
          .map(normalizeProduct)
          .filter(p => !p.status || p.status === 'published')
          .slice(0, 4);
      }
    } catch (err) {
      console.warn('Backend unavailable, using mockProducts in Home:', err);
    }
    return mockProducts.filter(p => !p.status || p.status === 'published').slice(0, 4);
  };

  const { data: featuredProducts, showSkeleton } = useSmartLoading<Product[]>(fetchFeatured);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative bg-orange-50 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Temukan Dunia <span className="text-orange-600">Bermain</span> Tanpa Batas!
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                SOTOYS GARUT menghadirkan koleksi mainan edukatif, action figure, dan board game terbaik untuk keceriaan keluarga Anda. Koleksi terlengkap dengan harga terjangkau.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/catalog" className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg shadow-orange-200">
                  <ShoppingBag size={20} className="mr-2" /> Mulai Belanja
                </Link>
                <Link to="/promo" className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 border-2 border-orange-200 font-bold rounded-full hover:bg-orange-50 transition-all">
                  Lihat Promo <ArrowRight size={20} className="ml-2" />
                </Link>
              </div>
            </div>
            <div className="relative z-10 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80" alt="Anak bermain mainan" className="w-full h-[400px] lg:h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">Koleksi Mainan Edukatif</h3>
                    <p className="text-orange-200">Latih kreativitas anak sejak dini</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-orange-200 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-yellow-200 opacity-30 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Produk Original</h3>
              <p className="text-gray-500">Kami menjamin semua mainan yang dijual adalah produk asli dan bersertifikat SNI.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pengiriman Cepat</h3>
              <p className="text-gray-500">Pesanan sebelum jam 15.00 WIB akan dikirim pada hari yang sama ke seluruh Indonesia.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Layanan Pelanggan 24/7</h3>
              <p className="text-gray-500">Tim dukungan kami siap membantu menjawab pertanyaan dan kendala Anda kapan saja.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <TestimonialCarousel />

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Produk Unggulan</h2>
              <p className="text-gray-500">Mainan paling populer minggu ini dari koleksi kami.</p>
            </div>
            <Link to="/catalog" className="text-orange-600 font-bold hover:text-orange-700 hidden sm:flex items-center">
              Lihat Semua Katalog <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>

          {showSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts && featuredProducts.map((product) => (
                <motion.div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full border border-gray-100 relative" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                  {product.stock <= 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      HABIS
                    </div>
                  )}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img 
                      src={getImageUrl(product.images[0])} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link to={`/product/${product.slug || product.id}`} className="px-6 py-2 bg-white text-gray-900 font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <Link to={`/product/${product.slug || product.id}`} className="block flex-grow">
                      <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
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
                            if (product.variations && product.variations.length > 0) {
                              setSelectedProduct(product);
                              setShowVariantModal(true);
                            } else {
                              addToCart(product, 1);
                              Swal.fire({
                                title: 'Ditambahkan!',
                                text: `${product.name} berhasil ditambahkan ke keranjang.`,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#ea580c',
                                timer: 2000,
                                timerProgressBar: true,
                              });
                            }
                          }}
                          className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${product.stock > 0
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          aria-label={product.stock <= 0 ? "Stok Habis" : "Tambah ke keranjang"}
                          title={product.stock <= 0 ? "Stok Habis" : "Tambah ke keranjang"}
                        >
                          <ShoppingBag size={20} />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden flex justify-center">
            <Link to="/catalog" className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
              Lihat Semua Katalog <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-orange-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Siap untuk Memberikan Hadiah Terbaik?
          </h2>
          <p className="text-orange-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Jangan lewatkan kesempatan untuk membahagiakan orang tersayang dengan koleksi mainan eksklusif dari SOTOYS GARUT. Dapatkan diskon 10% untuk pengguna baru!
          </p>
<div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-extrabold text-lg rounded-full hover:bg-orange-50 hover:scale-105 transition-all shadow-xl">
              Daftar Sekarang
            </Link>
            <Link to="/catalog" className="inline-flex items-center justify-center px-8 py-4 bg-orange-700 text-white font-extrabold text-lg rounded-full hover:bg-orange-800 transition-all border border-orange-500">
              Jelajahi Katalog
            </Link>
          </div>
        </div>
      </section>

      <VariantSelectionModal
        product={selectedProduct}
        isOpen={showVariantModal}
        onClose={() => {
          setShowVariantModal(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(qty, variant) => {
          if (selectedProduct) {
            addToCart(selectedProduct, qty, variant);
            const variantText = variant ? ` (${variant.type}: ${variant.option})` : '';
            Swal.fire({
              title: 'Ditambahkan!',
              text: `${selectedProduct.name}${variantText} berhasil ditambahkan ke keranjang.`,
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#ea580c',
              timer: 2000,
              timerProgressBar: true,
            });
          }
        }}
        onBuyNow={(qty, variant) => {
          if (selectedProduct) {
            addToCart(selectedProduct, qty, variant);
            navigate('/checkout');
          }
        }}
      />
    </div>
   );
}