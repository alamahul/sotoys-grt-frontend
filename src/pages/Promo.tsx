import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { Tag, Clock, Copy, CheckCircle, ArrowRight, Percent } from 'lucide-react';
import { mockProducts, mockCategories } from '../data/mock';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Product } from '../types';
import api, { normalizeProduct } from '../utils/api';

export default function Promo() {
  const [searchParams] = useSearchParams();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(mockCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>(mockProducts);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);

  const query = searchParams.get('q');
  const catParam = searchParams.get('category') || searchParams.get('cat');

  useEffect(() => {
    api.get('/products')
      .then(res => {
        if (res?.products && Array.isArray(res.products) && res.products.length > 0) {
          setAllProducts(
            res.products
              .map(normalizeProduct)
              .filter(p => !p.status || p.status === 'published')
          );
        }
      })
      .catch(err => {
        console.warn('Backend /products unavailable in Promo, using mockProducts fallback:', err);
      });

    api.get('/categories')
      .then(res => {
        if (res?.categories && Array.isArray(res.categories) && res.categories.length > 0) {
          setCategories(res.categories);
        }
      })
      .catch(err => {
        console.warn('Backend /categories unavailable in Promo:', err);
      });
  }, []);

  useEffect(() => {
    if (catParam) {
      const match = categories.find(c => 
        String(c.id).toLowerCase() === catParam.toLowerCase() ||
        c.name.toLowerCase() === catParam.toLowerCase()
      );
      if (match) {
        setSelectedCategoryId(match.id);
      } else {
        setSelectedCategoryId(catParam);
      }
    }
  }, [catParam, categories]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = allProducts.filter(p => p.price > 100000 || p.rating >= 4);
      if (filtered.length === 0) {
        filtered = allProducts;
      }

      if (selectedCategoryId) {
        const activeCat = categories.find(c => String(c.id).toLowerCase() === String(selectedCategoryId).toLowerCase())
          || mockCategories.find(c => c.id.toLowerCase() === String(selectedCategoryId).toLowerCase());

        filtered = filtered.filter(p => {
          if (p.categoryId && String(p.categoryId).toLowerCase() === String(selectedCategoryId).toLowerCase()) return true;
          if (p.category?.id && String(p.category.id).toLowerCase() === String(selectedCategoryId).toLowerCase()) return true;
          if (activeCat && p.category?.name && p.category.name.toLowerCase() === activeCat.name.toLowerCase()) return true;
          if (p.category?.name && p.category.name.toLowerCase() === String(selectedCategoryId).toLowerCase()) return true;
          const mockMatch = mockCategories.find(mc => mc.id === selectedCategoryId);
          if (mockMatch && (p.categoryId === mockMatch.id || (p.category?.name && p.category.name.toLowerCase() === mockMatch.name.toLowerCase()))) {
            return true;
          }
          return false;
        });
      }

      if (query) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      }

      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'popularity') {
        filtered.sort((a, b) => b.stock - a.stock);
      }

      setPromoProducts(filtered);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [allProducts, selectedCategoryId, sortBy, query]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Promo & Penawaran Spesial | SOTOYS GARUT</title>
        <meta name="description" content="Dapatkan berbagai diskon menarik dan penawaran eksklusif SOTOYS GARUT. Kupon diskon, potongan harga, dan gratis ongkir untuk Anda." />
      </Helmet>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-orange-600 text-white mb-10 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-90"></div>
        <div className="relative px-8 py-12 sm:px-16 sm:py-16 flex flex-col items-start w-full md:w-2/3">
          <span className="inline-flex items-center py-1 px-3 rounded-full bg-orange-100 text-orange-800 text-sm font-semibold mb-4">
            <Percent size={16} className="mr-1" /> Promo Spesial
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Hemat Lebih, Belanja Lebih!
          </h1>
          <p className="text-orange-50 text-base md:text-lg mb-6 max-w-xl">
            Nikmati diskon eksklusif, kupon cashback, dan penawaran khusus untuk mainan anak favorit Anda.
          </p>
          <Link
            to="#produk-promo"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm transition-colors"
          >
            Lihat Produk <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Coupons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Coupon 1 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100 flex flex-col">
            <div className="bg-orange-100 p-6 flex flex-col items-center justify-center text-center border-b border-orange-200 border-dashed">
              <span className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-2">Diskon Pengguna Baru</span>
              <span className="text-4xl font-extrabold text-gray-900 mb-1">10% OFF</span>
              <span className="text-sm text-gray-500">Maksimal potongan Rp 50.000</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock size={16} className="mr-1" /> Berlaku s/d 31 Des 2026
              </div>
              <p className="text-sm text-gray-600 mb-6">Gunakan kode ini saat checkout untuk mendapatkan potongan harga pada pembelian pertama Anda.</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <span className="font-mono font-bold text-gray-800 tracking-wider">NEW10SOTOYS</span>
                  <button
                    onClick={() => handleCopy('NEW10SOTOYS')}
                    className="text-orange-600 hover:text-orange-700 p-1"
                  >
                    {copiedCode === 'NEW10SOTOYS' ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon 2 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 flex flex-col">
            <div className="bg-blue-100 p-6 flex flex-col items-center justify-center text-center border-b border-blue-200 border-dashed">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">Gratis Ongkir</span>
              <span className="text-4xl font-extrabold text-gray-900 mb-1">Rp 0</span>
              <span className="text-sm text-gray-500">Min. belanja Rp 200.000</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock size={16} className="mr-1" /> Berlaku s/d 30 Nov 2026
              </div>
              <p className="text-sm text-gray-600 mb-6">Potongan ongkos kirim hingga Rp 20.000 ke seluruh Indonesia untuk kategori mainan edukasi.</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <span className="font-mono font-bold text-gray-800 tracking-wider">FREESHIP20</span>
                  <button
                    onClick={() => handleCopy('FREESHIP20')}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    {copiedCode === 'FREESHIP20' ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon 3 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100 flex flex-col">
            <div className="bg-green-100 p-6 flex flex-col items-center justify-center text-center border-b border-green-200 border-dashed">
              <span className="text-green-600 font-bold uppercase tracking-widest text-sm mb-2">Potongan Belanja</span>
              <span className="text-4xl font-extrabold text-gray-900 mb-1">Rp 30.000</span>
              <span className="text-sm text-gray-500">Min. belanja Rp 150.000</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock size={16} className="mr-1" /> Berlaku s/d 31 Des 2026
              </div>
              <p className="text-sm text-gray-600 mb-6">Diskon potongan langsung Rp 30.000 untuk transaksi dengan produk mainan apa saja.</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <span className="font-mono font-bold text-gray-800 tracking-wider">SOTOYSGARUT</span>
                  <button
                    onClick={() => handleCopy('SOTOYSGARUT')}
                    className="text-green-600 hover:text-green-700 p-1"
                  >
                    {copiedCode === 'SOTOYSGARUT' ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Products */}
        <section id="produk-promo" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Tag className="mr-2 text-orange-600" /> Produk Promo
            </h2>
            <span className="text-sm text-gray-500 font-medium">
              {loading ? 'Memuat...' : `${promoProducts.length} produk tersedia`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">
                {loading ? '...' : `${promoProducts.length} produk`}
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
          ) : promoProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Tag size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada produk promo</h3>
              <p className="text-gray-500">Belum ada mainan promo di kategori ini.</p>
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="mt-4 px-4 py-2 bg-orange-50 text-orange-600 text-sm font-medium rounded-md hover:bg-orange-100 transition-colors"
              >
                Lihat Semua Promo
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}