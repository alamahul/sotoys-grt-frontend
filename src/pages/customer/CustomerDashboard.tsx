import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Heart, Bell, Settings, LogOut, ChevronRight, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Dashboard Pelanggan</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 sm:p-8 bg-orange-600 text-white">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white text-orange-600 flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold">Halo, {user?.name || 'Pelanggan'}!</h2>
                <p className="text-orange-100 mt-1">{user?.email || 'email@contoh.com'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/customer/orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all group flex items-start">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4 group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600">Pesanan Saya</h3>
              <p className="text-sm text-gray-500 mt-1">Lacak status pesanan, lihat riwayat, dan berikan ulasan.</p>
            </div>
            <ChevronRight className="text-gray-400 self-center" />
          </Link>

          <Link to="/wishlist" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all group flex items-start">
            <div className="p-3 rounded-full bg-pink-100 text-pink-600 mr-4 group-hover:scale-110 transition-transform">
              <Heart size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600">Wishlist</h3>
              <p className="text-sm text-gray-500 mt-1">Lihat produk favorit yang sudah Anda simpan.</p>
            </div>
            <ChevronRight className="text-gray-400 self-center" />
          </Link>

          <Link to="/customer/returns" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all group flex items-start">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4 group-hover:scale-110 transition-transform">
              <RefreshCcw size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600">Pengembalian Produk</h3>
              <p className="text-sm text-gray-500 mt-1">Lihat status proses pengembalian barang Anda.</p>
            </div>
            <ChevronRight className="text-gray-400 self-center" />
          </Link>

          <Link to="/customer/notifications" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all group flex items-start">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4 group-hover:scale-110 transition-transform">
              <Bell size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600">Notifikasi</h3>
              <p className="text-sm text-gray-500 mt-1">Pembaruan pesanan dan promo terbaru.</p>
            </div>
            <ChevronRight className="text-gray-400 self-center" />
          </Link>

          <Link to="/customer/profile" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all group flex items-start">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600 mr-4 group-hover:scale-110 transition-transform">
              <Settings size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600">Pengaturan Profil</h3>
              <p className="text-sm text-gray-500 mt-1">Ubah kata sandi dan perbarui detail akun.</p>
            </div>
            <ChevronRight className="text-gray-400 self-center" />
          </Link>
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 font-medium hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-2" />
            Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  );
}
