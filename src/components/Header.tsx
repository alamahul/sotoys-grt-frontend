import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, ClipboardList, LogOut, Bell, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { mockProducts } from '../data/mock';
import Swal from 'sweetalert2';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const searchSuggestions = mockProducts.filter(p =>
    searchQuery.trim().length > 0 &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold tracking-tight">SOTOYS</Link>
            </div>

            {/* Search Bar (Auto-suggest & Search execution) */}
            <div className="flex-1 max-w-2xl mx-8 hidden sm:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Cari mainan kesukaanmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-gray-900 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button type="submit" aria-label="Search" className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-orange-500">
                  <Search size={20} />
                </button>

                {/* Auto-suggest dropdown */}
                {searchQuery.trim().length > 0 && searchSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                    {searchSuggestions.map(product => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => setSearchQuery('')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        {product.name}
                      </Link>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-3 sm:space-x-6">

              <Link to="/cart" aria-label="Cart" className="text-orange-50 hover:text-white transition-colors relative" title="Keranjang">
                <ShoppingCart size={22} className="sm:w-6 sm:h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-xs text-white font-bold px-1.5 py-0.5 rounded-full">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1.5 text-orange-50 hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-orange-600"
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline-block text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
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
                <Link to="/login" className="text-sm font-medium text-white border border-white border-opacity-30 rounded px-2 sm:px-3 py-1.5 hover:bg-orange-600 transition whitespace-nowrap">
                  <span className="hidden sm:inline">Masuk / Daftar</span>
                  <span className="sm:hidden">Masuk</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - shown below header on small screens */}
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari mainan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-900 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button type="submit" aria-label="Search" className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-orange-500">
              <Search size={20} />
            </button>
            {/* Auto-suggest dropdown mobile */}
            {searchQuery.trim().length > 0 && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                {searchSuggestions.map(product => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={() => setSearchQuery('')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            )}
          </form>
        </div>
      </header>

      {/* Secondary Navigation */}
      <div className="bg-orange-600 text-white border-t border-orange-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap space-x-4">
            <Link to="/" className="px-3 py-3 text-sm font-medium text-orange-50 hover:text-white hover:bg-orange-700 transition-colors">Beranda</Link>
            <Link to="/catalog" className="px-3 py-3 text-sm font-medium text-orange-50 hover:text-white hover:bg-orange-700 transition-colors">Katalog Produk</Link>

            <Link to="/about" className="px-3 py-3 text-sm font-medium text-orange-50 hover:text-white hover:bg-orange-700 transition-colors">Tentang Kami</Link>
          </nav>
        </div>
      </div>
    </>
  );
}
