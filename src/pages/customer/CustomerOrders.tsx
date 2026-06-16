import React, { useState } from 'react';
import { Package, Truck, ChevronLeft, CheckCircle, Clock, ChevronRight, MessageSquare, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
// Import SweetAlert2
import Swal from 'sweetalert2';

// ... (Simulated Orders)
const initialOrders = [
  { id: 'ORD-12345', date: '25 Okt 2023', total: 350000, status: 'Dikirim', items: 3 },
  { id: 'ORD-98765', date: '16 Jun 2026', total: 150000, status: 'Selesai', items: 1 },
  { id: 'ORD-45678', date: '01 Sep 2023', total: 550000, status: 'Selesai', items: 4 },
  { id: 'ORD-55555', date: '15 Nov 2023', total: 200000, status: 'Menunggu Pembayaran', items: 2 },
];

export default function CustomerOrders() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [orders, setOrders] = useState(initialOrders);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Menggunakan SweetAlert2 untuk menampilkan pesan sukses
    Swal.fire({
      title: 'Berhasil!',
      text: 'Terima kasih! Ulasan Anda telah tersimpan.',
      icon: 'success',
      confirmButtonColor: '#ea580c', // Warna orange-600 agar match dengan UI Anda
      confirmButtonText: 'OK'
    });

    setReviewModalOpen(false);
    setRating(0);
    setReviewText('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selesai': return <CheckCircle className="text-green-500" size={20} />;
      case 'Dikirim': return <Truck className="text-blue-500" size={20} />;
      case 'Menunggu Pembayaran': return <Clock className="text-orange-500" size={20} />;
      default: return <Package className="text-gray-500" size={20} />;
    }
  };

  const filteredOrders = activeTab === 'Semua' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Pesanan Saya</h1>
        <Link to="/customer/dashboard" className="w-70 mb-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center text-sm hover:bg-orange-500 hover:text-white">
          <ChevronLeft size={16} className="mr-1" /> Kembali ke Dashboard
        </Link>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-100 min-w-max">
            {['Semua', 'Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{order.id}</h3>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{order.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{order.items} Produk • Rp {order.total.toLocaleString('id-ID')}</p>
                  <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                    order.status === 'Dikirim' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                {order.status === 'Selesai' && (
                  <>
                    <button
                      onClick={() => { setSelectedOrder(order.id); setReviewModalOpen(true); }}
                      className="w-full sm:w-auto px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-bold hover:bg-orange-100 transition-colors flex items-center justify-center text-sm"
                    >
                      <MessageSquare size={16} className="mr-2" /> Beri Ulasan
                    </button>
                    <Link
                      to={`/customer/return/${order.id}`}
                      className="w-full sm:w-auto px-4 py-2 bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition-colors flex items-center justify-center text-sm"
                    >
                      Ajukan Pengembalian
                    </Link>
                  </>
                )}
                <Link to={`/customer/orders/${order.id}`} className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center text-sm">
                  Detail <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada pesanan untuk status ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Nilai Pesanan {selectedOrder}</h2>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6">
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star} type="button"
                    onClick={() => setRating(star)}
                    className={`focus:outline-none transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star size={40} className={rating >= star ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none mb-6 text-sm"
              />
              <button type="submit" disabled={rating === 0} className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Kirim Ulasan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}