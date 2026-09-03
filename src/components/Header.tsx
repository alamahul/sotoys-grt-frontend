import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, ClipboardList, LogOut, Bell, LayoutDashboard, ChevronDown, Menu, X, Flame, Clock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { mockProducts } from '../data/mock';
import Swal from 'sweetalert2';
import {
  getPopularSearches,
  getSearchHistory,
  getCheckoutKeywords,
} from '../utils/search';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const matchedProducts = useMemo(() => {
    if (debouncedQuery.trim().length === 0) return [];
    const q = debouncedQuery.trim().toLowerCase();
    return mockProducts.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [debouncedQuery]);

  const popularSearches = useMemo(() => getPopularSearches().slice(0, 4), []);
  const searchHistory = useMemo(() => getSearchHistory().slice(0, 3), []);
  const checkoutKeywords = useMemo(() => getCheckoutKeywords().slice(0, 3), []);

  const showDropdown = searchQuery.trim().length > 0 && (
    matchedProducts.length > 0 ||
    popularSearches.length > 0 ||
    searchHistory.length > 0 ||
    checkoutKeywords.length > 0
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setDebouncedQuery('');
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Akun?',
      text: 'Apakah Anda yakin ingin keluar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          title: 'Berhasil Keluar!',
          text: 'Anda telah keluar dari akun.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ea580c',
        });
        navigate('/login');
      }
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-orange-500 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Kiri: Hamburger (Mobile) + Logo + Navigasi Desktop */}
            <div className="flex items-center space-x-6 xl:space-x-8 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden text-orange-50 hover:text-white transition-colors"
                  aria-label="Buka menu navigasi"
                >
                  <Menu size={24} />
                </button>
                <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">SOTOYS</Link>
              </div>

              {/* Menu Navigasi Desktop dengan Animasi Sliding Underline */}
              <nav className="hidden lg:flex items-center space-x-6">
                <Link 
                  to="/" 
                  className="relative text-sm font-medium text-orange-50 hover:text-white py-1 transition-colors duration-300 whitespace-nowrap after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
                >
                  Beranda
                </Link>
                <Link 
                  to="/catalog" 
                  className="relative text-sm font-medium text-orange-50 hover:text-white py-1 transition-colors duration-300 whitespace-nowrap after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
                >
                  Katalog Produk
                </Link>
                <Link 
                  to="/about" 
                  className="relative text-sm font-medium text-orange-50 hover:text-white py-1 transition-colors duration-300 whitespace-nowrap after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
                >
                  Tentang Kami
                </Link>
              </nav>
            </div>

            {/* Tengah: Search Bar */}
            <div className="flex-1 max-w-md lg:max-w-lg hidden sm:block mx-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Cari mainan kesukaanmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-gray-900 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                />
                <button type="submit" aria-label="Search" className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-orange-500 transition-colors">
                  <Search size={18} />
                </button>

                {/* Auto-suggest dropdown */}
                {showDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 max-h-96 overflow-y-auto">
                    {matchedProducts.length > 0 && (
                      <div>
                        <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Produk Cocok</div>
                        {matchedProducts.map(product => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={() => setSearchQuery('')}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            {product.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {popularSearches.length > 0 && (
                      <div className={matchedProducts.length > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                        <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Flame size={12} /> Pencarian Populer
                        </div>
                        {popularSearches.map(item => (
                          <button
                            key={item.query}
                            type="button"
                            onClick={() => handleSuggestionClick(item.query)}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-between"
                          >
                            <span>{item.query}</span>
                            <span className="text-xs text-gray-400">{item.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchHistory.length > 0 && (
                      <div className={matchedProducts.length > 0 || popularSearches.length > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                        <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock size={12} /> Riwayat
                        </div>
                        {searchHistory.map(item => (
                          <button
                            key={item.query + item.timestamp}
                            type="button"
                            onClick={() => handleSuggestionClick(item.query)}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            {item.query}
                          </button>
                        ))}
                      </div>
                    )}

                    {checkoutKeywords.length > 0 && (
                      <div className={matchedProducts.length > 0 || popularSearches.length > 0 || searchHistory.length > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                        <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <ShoppingBag size={12} /> Dari Checkout
                        </div>
                        {checkoutKeywords.map((keyword, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(keyword)}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Kanan: Icons & User Menu + Tombol Keranjang Beranimasi */}
            <div className="flex items-center space-x-4 sm:space-x-5 flex-shrink-0">
              <Link 
                to="/cart" 
                aria-label="Cart" 
                className="text-orange-50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 relative p-1 block group" 
                title="Keranjang"
              >
                <ShoppingCart size={22} className="group-hover:rotate-3 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse group-hover:scale-110 transition-transform">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-orange-50 hover:text-white transition-colors p-1 rounded-md hover:bg-orange-600"
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-bold shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:inline-block text-sm font-medium max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 text-gray-900 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Pengguna'}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/customer/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <LayoutDashboard size={18} className="mr-3 text-gray-400" />
                            Dashboard
                          </Link>
                          <Link
                            to="/customer/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <ClipboardList size={18} className="mr-3 text-gray-400" />
                            Pesanan
                          </Link>
                          <Link
                            to="/customer/notifications"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <Bell size={18} className="mr-3 text-gray-400" />
                            Notifikasi
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={18} className="mr-3" />
                            Keluar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-sm font-medium text-white border border-white border-opacity-40 rounded-md px-3 py-1.5 hover:bg-white hover:text-orange-600 active:scale-95 transition whitespace-nowrap">
                  <span className="hidden sm:inline">Masuk / Daftar</span>
                  <span className="sm:hidden">Masuk</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari mainan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-900 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
            />
            <button type="submit" aria-label="Search" className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-orange-500 transition-colors">
              <Search size={18} />
            </button>
             {/* Auto-suggest dropdown mobile */}
             {showDropdown && (
               <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 max-h-96 overflow-y-auto">
                 {matchedProducts.length > 0 && (
                   <div>
                     <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Produk Cocok</div>
                     {matchedProducts.map(product => (
                       <Link
                         key={product.id}
                         to={`/product/${product.id}`}
                         onClick={() => setSearchQuery('')}
                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                       >
                         {product.name}
                       </Link>
                     ))}
                   </div>
                 )}

                 {popularSearches.length > 0 && (
                   <div className={matchedProducts.length > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                     <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                       <Flame size={12} /> Pencarian Populer
                     </div>
                     {popularSearches.map(item => (
                       <button
                         key={item.query}
                         type="button"
                         onClick={() => handleSuggestionClick(item.query)}
                         className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-between"
                       >
                         <span>{item.query}</span>
                         <span className="text-xs text-gray-400">{item.count}</span>
                       </button>
                     ))}
                   </div>
                 )}

                 {searchHistory.length > 0 && (
                   <div className={matchedProducts.length > 0 || popularSearches.length > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                     <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                       <Clock size={12} /> Riwayat
                     </div>
                     {searchHistory.map(item => (
                       <button
                         key={item.query + item.timestamp}
                         type="button"
                         onClick={() => handleSuggestionClick(item.query)}
                         className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                       >
                         {item.query}
                       </button>
                     ))}
                   </div>
                 )}

                 {checkoutKeywords.length > 0 && (
                   <div className={matchedProducts.length > 0 || popularSearches.length > 0 || searchHistory.length > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                     <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                       <ShoppingBag size={12} /> Dari Checkout
                     </div>
                     {checkoutKeywords.map((keyword, idx) => (
                       <button
                         key={idx}
                         type="button"
                         onClick={() => handleSuggestionClick(keyword)}
                         className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                       >
                         {keyword}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             )}
          </form>
        </div>
      </header>

      {/* Sidebar Overlay & Content (Mobile Only) dengan Efek Slide-In Teks */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden backdrop-blur-sm transition-all" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-orange-500 text-white">
          <span className="text-lg font-bold tracking-tight">Menu</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-white hover:rotate-90 hover:text-orange-100 transition-all duration-200" aria-label="Tutup menu">
            <X size={22} />
          </button>
        </div>

        <nav className="py-4">
          <Link 
            to="/" 
            onClick={() => { setIsSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }} 
            className="block px-6 py-3.5 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 border-l-4 border-transparent hover:border-orange-500 hover:pl-8 transition-all duration-300"
          >
            Beranda
          </Link>
          <Link 
            to="/catalog" 
            onClick={() => { setIsSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }} 
            className="block px-6 py-3.5 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 border-l-4 border-transparent hover:border-orange-500 hover:pl-8 transition-all duration-300"
          >
            Katalog
          </Link>
          <Link 
            to="/about" 
            onClick={() => { setIsSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }} 
            className="block px-6 py-3.5 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 border-l-4 border-transparent hover:border-orange-500 hover:pl-8 transition-all duration-300"
          >
            Tentang Kami
          </Link>
        </nav>
      </div>
    </>
  );
}