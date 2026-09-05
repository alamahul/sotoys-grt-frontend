import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Flame, Clock, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockProducts } from '../data/mock';
import api, { normalizeProduct } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import {
  getSearchHistory,
  addToSearchHistory,
  getPopularSearches,
  getCheckoutKeywords,
  getRelatedProducts,
} from '../utils/search';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [productsList, setProductsList] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        if (res?.products && Array.isArray(res.products) && res.products.length > 0) {
          setProductsList(res.products.map(normalizeProduct));
        }
      })
      .catch(err => {
        console.warn('Search fallback to mockProducts:', err);
      });
  }, []);

  const results = useMemo(() => {
    if (!initialQuery.trim()) return [];
    const q = initialQuery.trim().toLowerCase();
    return productsList.filter(p => p.name.toLowerCase().includes(q));
  }, [initialQuery, productsList]);

  const relatedProducts = useMemo(() => {
    if (initialQuery.trim() && results.length === 0) {
      return getRelatedProducts(initialQuery, productsList, 12);
    }
    return [];
  }, [initialQuery, results, productsList]);

  const trending = useMemo(() => getPopularSearches(), []);
  const history = useMemo(() => getSearchHistory(), []);
  const checkoutKeywords = useMemo(() => getCheckoutKeywords(), []);

  useEffect(() => {
    if (initialQuery.trim()) {
      addToSearchHistory(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsFocused(false);
    }
  };

  const handleChipClick = (query: string) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{initialQuery ? `Hasil Pencarian: "${initialQuery}" | SOTOYS` : 'Pencarian | SOTOYS'}</title>
        <meta name="description" content="Cari mainan favoritmu di SOTOYS Garut." />
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            {initialQuery ? `Pencarian: "${initialQuery}"` : 'Cari Mainan'}
          </h1>
          <p className="text-gray-500 mb-6">
            {initialQuery ? `${results.length} produk ditemukan` : 'Temukan mainan kesukaanmu'}
          </p>

          <form onSubmit={handleSubmit} className="relative max-w-3xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari mainan kesukaanmu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                className="w-full bg-white text-gray-900 rounded-xl py-4 pl-6 pr-24 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-sm border border-gray-200 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={20} />
                  </button>
                )}
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <SearchIcon size={18} />
                  <span className="hidden sm:inline">Cari</span>
                </button>
              </div>
            </div>

            {/* Live suggestions while typing */}
            <AnimatePresence>
              {isFocused && searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 max-h-80 overflow-y-auto"
                >
                  {mockProducts
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 5)
                    .map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onMouseDown={() => handleChipClick(product.name)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3"
                      >
                        <SearchIcon size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{product.name}</span>
                      </button>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Results */}
        {initialQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                  <SearchIcon size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ditemukan</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Maaf, kami tidak menemukan produk yang cocok dengan pencarian "{initialQuery}". Coba kata kunci lain atau jelajahi produk terkait di bawah.
                </p>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
                      <ShoppingBag size={24} className="text-orange-600" />
                      Produk Terkait
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {relatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Suggestion Chips - always visible when no exact query or to help discover */}
        {(!initialQuery || results.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-12 space-y-8"
          >
            {/* Trending */}
            {trending.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Flame size={20} className="text-orange-600" />
                  Pencarian Populer
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trending.map(item => (
                    <button
                      key={item.query}
                      onClick={() => handleChipClick(item.query)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm transition-all"
                    >
                      <span className="font-medium">{item.query}</span>
                      <span className="text-xs text-gray-400">({item.count})</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* History */}
            {history.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-orange-600" />
                  Riwayat Pencarian
                </h3>
                <div className="flex flex-wrap gap-2">
                  {history.map(item => (
                    <button
                      key={item.query + item.timestamp}
                      onClick={() => handleChipClick(item.query)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm transition-all"
                    >
                      <span className="font-medium">{item.query}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Checkout History */}
            {checkoutKeywords.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-orange-600" />
                  Dari Checkout Sebelumnya
                </h3>
                <div className="flex flex-wrap gap-2">
                  {checkoutKeywords.map((keyword, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(keyword)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm transition-all"
                    >
                      <span className="font-medium">{keyword}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
