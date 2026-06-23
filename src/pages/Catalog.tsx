import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { mockProducts, mockCategories } from '../data/mock';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { ArrowRight, Flame, Filter, ChevronRight } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import VariantSelectionModal from '../components/VariantSelectionModal';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

export default function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);

  // Infinite Scroll States
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = visibleCount < products.length;

  useEffect(() => {
    setLoading(true);
    setVisibleCount(10); // Reset count on filter change
    // Simulate network request
    const timer = setTimeout(() => {
      let filtered = selectedCategoryId
        ? mockProducts.filter(p => p.categoryId === selectedCategoryId)
        : [...mockProducts];

      if (query) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      }

      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'popularity') {
        filtered.sort((a, b) => a.stock - b.stock);
      }

      setProducts(filtered);
      setFlashSaleProducts(mockProducts.slice(0, 4));
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedCategoryId, sortBy, query]);

  // Infinite Scroll Observer Effect
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          // Simulate loading delay for premium feel
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 10, products.length));
            setLoadingMore(false);
          }, 600);
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, loading, loadingMore, products.length]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>SOTOYS | Toko Mainan Anak Terbaik & Terlengkap</title>
        <meta name="description" content="SOTOYS menawarkan berbagai koleksi mainan anak dari berbagai kategori. Belanja mainan edukasi, boneka, dan diecast dengan harga terbaik." />
      </Helmet>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden bg-orange-600 text-white mb-10 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-90"></div>
          <div className="relative px-8 py-16 sm:px-16 sm:py-24 flex flex-col items-start w-full md:w-2/3">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-800 text-sm font-semibold mb-4">
              Promo Spesial!
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Lebih Murah, Lebih Seru!
            </h1>
            <p className="text-orange-50 text-base md:text-lg mb-8 max-w-xl">
              Temukan koleksi mainan terbaru dengan harga terjangkau. Diskon hingga 50% untuk kategori pilihan bulan ini.
            </p>
            <Link
              to="/promo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm transition-colors"
            >
              Belanja Sekarang <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Flash Sale Area */}
        <section className="mb-10 lg:mb-14">
          <div className="flex items-center space-x-2 mb-6">
            <Flame className="text-orange-600" size={28} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Flash Sale</h2>
            <div className="ml-4 flex items-center space-x-1">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">02</span>
              <span className="font-bold text-red-600">:</span>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">45</span>
              <span className="font-bold text-red-600">:</span>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">10</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : (
              flashSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>

        {/* Shop Area with Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Category Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-5 sticky top-24 z-10 w-full overflow-hidden">
              <div className="flex items-center space-x-2 mb-3 md:mb-4 md:border-b border-gray-100 md:pb-4">
                <Filter size={20} className="text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">Kategori</h2>
              </div>
              <ul className="flex flex-row overflow-x-auto md:flex-col md:space-y-1 space-x-2 md:space-x-0 pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <li>
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className={`whitespace-nowrap md:w-full flex items-center justify-between px-4 py-2 md:px-3 md:py-2 text-sm rounded-full md:rounded-md transition-colors ${selectedCategoryId === null
                        ? 'bg-orange-50 text-orange-700 border border-orange-200 md:border-transparent font-semibold shadow-sm md:shadow-none'
                        : 'text-gray-600 border border-gray-200 md:border-transparent hover:bg-gray-50 hover:text-gray-900 bg-white'
                      }`}
                  >
                    <span>Semua Kategori</span>
                    {selectedCategoryId === null && <ChevronRight size={16} className="hidden md:block ml-2" />}
                  </button>
                </li>
                {mockCategories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`whitespace-nowrap md:w-full flex items-center justify-between px-4 py-2 md:px-3 md:py-2 text-sm rounded-full md:rounded-md transition-colors ${selectedCategoryId === category.id
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 md:border-transparent font-semibold shadow-sm md:shadow-none'
                          : 'text-gray-600 border border-gray-200 md:border-transparent hover:bg-gray-50 hover:text-gray-900 bg-white'
                        }`}
                    >
                      <span>{category.name}</span>
                      {selectedCategoryId === category.id && <ChevronRight size={16} className="hidden md:block ml-2" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {query ? `Hasil Pencarian: "${query}"` : selectedCategoryId
                  ? `Mainan ${mockCategories.find(c => c.id === selectedCategoryId)?.name}`
                  : 'Semua Mainan'
                }
              </h2>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">
                  Menampilkan {loading ? '...' : products.length} produk
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-orange-500 focus:border-orange-500 block p-2 w-full sm:w-auto"
                  aria-label="Urutkan produk"
                >
                  <option value="default">Paling Sesuai</option>
                  <option value="popularity">Terpopuler</option>
                  <option value="price_desc">Harga Tertinggi</option>
                  <option value="price_asc">Harga Terendah</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.slice(0, visibleCount).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Sentinel/Loader for Infinite Scroll */}
                <div ref={sentinelRef} className="mt-6 flex justify-center w-full">
                  {loadingMore && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Filter size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada produk</h3>
                <p className="text-gray-500">Belum ada mainan di kategori ini.</p>
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="mt-4 px-4 py-2 bg-orange-50 text-orange-600 text-sm font-medium rounded-md hover:bg-orange-100 transition-colors"
                >
                  Lihat Semua Mainan
                </button>
              </div>
            )}
          </section>
        </div>

      </main>
    </div>
  );
}
