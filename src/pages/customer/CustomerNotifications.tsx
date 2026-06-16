import React from 'react';
import { Bell, CheckCircle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerNotifications() {
  const notifications = [
    { id: 1, title: 'Pesanan Dikirim', desc: 'Pesanan ORD-12345 sedang menuju ke alamat Anda.', time: '10 mnt lalu', isRead: false },
    { id: 2, title: 'Promo Flash Sale', desc: 'Diskon 50% untuk kategori mainan edukasi. Cek sekarang!', time: '1 jam lalu', isRead: true },
    { id: 3, title: 'Pembayaran Berhasil', desc: 'Pembayaran untuk pesanan ORD-12345 telah dikonfirmasi.', time: 'Kemarin', isRead: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center">
            <Bell className="mr-3 text-orange-600" />
            Pusat Notifikasi
          </h1>
          <button className="text-sm font-medium text-orange-600 hover:text-orange-700">Tandai semua dibaca</button>

        </div>
        <Link to="/customer/dashboard" className="w-70 mb-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center text-sm hover:bg-orange-500 hover:text-white">
          <ChevronLeft size={16} className="mr-1" /> Kembali ke Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {notifications.map(notif => (
            <div key={notif.id} className={`p-6 border-b border-gray-100 transition-colors flex items-start ${notif.isRead ? 'bg-white' : 'bg-orange-50'}`}>
              <div className={`p-2 rounded-full mr-4 flex-shrink-0 ${notif.isRead ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 text-orange-600'}`}>
                {notif.title.includes('Promo') ? <Bell size={20} /> : <CheckCircle size={20} />}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notif.desc}</p>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <p>Belum ada notifikasi baru untuk Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
