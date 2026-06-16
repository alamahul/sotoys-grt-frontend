import { Link } from 'react-router-dom';
import { Store, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminHeader() {
  const { logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Anda telah keluar dari mode admin', 'info');
  };

  return (
    <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-extrabold tracking-tight text-orange-500 mr-2">SOTOYS</span>
            <span className="text-sm font-medium text-gray-300 border-l border-gray-600 pl-2">Admin Panel</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors"
              title="Kembali ke Toko Utama"
            >
              <Store size={18} className="mr-1.5" />
              <span className="hidden sm:inline">Lihat Toko</span>
            </Link>

            <button 
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-4 border-l border-gray-700 pl-4"
              title="Keluar"
            >
              <LogOut size={18} className="mr-1.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
