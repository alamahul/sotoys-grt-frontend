import React, { useState, useEffect } from 'react';
import { Package, Truck, ChevronLeft, CheckCircle, Clock, ChevronRight, MessageSquare, Star, X, Loader2, CreditCard, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../utils/api';

export interface CustomerOrder {
  id: string;
  displayId: string;
  date: string;
  total: number;
  status: string;
  rawStatus: string;
  items: number;
  itemsList?: any[];
  payment?: any;
  returnRecord?: any;
  returnCount?: number;
}

export const mapBackendOrderStatus = (status: string, payment?: any): string => {
  if (status === 'PENDING_PAYMENT') {
    const paymentStatus = payment?.paymentData?.status;
    if (paymentStatus === 'PENDING_VERIFICATION' || payment?.paymentData?.proofImage) {
      return 'Menunggu Verifikasi';
    }
    if (paymentStatus === 'REJECTED') {
      return 'Bukti Ditolak';
    }
    return 'Menunggu Pembayaran';
  }
  switch (status) {
    case 'PAID':
    case 'PROCESSING':
      return 'Diproses';
    case 'SHIPPED':
      return 'Dikirim';
    case 'DELIVERED':
      return 'Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return status;
  }
};

export default function CustomerOrders() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get('/orders').catch(() => ({ orders: [] })),
      api.get('/returns').catch(() => ({ returns: [] })),
    ])
      .then(([orderRes, returnRes]) => {
        const returnMap: Record<string, any> = {};
        const returnCountMap: Record<string, number> = {};
        if (returnRes?.returns && Array.isArray(returnRes.returns)) {
          returnRes.returns.forEach((r: any) => {
            if (r.orderId) {
              returnCountMap[r.orderId] = (returnCountMap[r.orderId] || 0) + 1;
              const current = returnMap[r.orderId];
              if (!current) {
                returnMap[r.orderId] = r;
              } else {
                const currentTime = new Date(current.createdAt || 0).getTime();
                const newTime = new Date(r.createdAt || 0).getTime();
                if (newTime > currentTime) {
                  returnMap[r.orderId] = r;
                }
              }
            }
          });
        }

        if (orderRes?.orders && Array.isArray(orderRes.orders)) {
          const mapped: CustomerOrder[] = orderRes.orders.map((o: any) => {
            let ret = returnMap[o.id];
            if (!ret && Array.isArray(o.returns) && o.returns.length > 0) {
              const sorted = [...o.returns].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              ret = sorted[0];
            }
            const returnCount = returnCountMap[o.id] || (Array.isArray(o.returns) ? o.returns.length : (ret ? 1 : 0));
            return {
              id: o.id,
              displayId: o.id.startsWith('ORD-') ? o.id : `ORD-${o.id.slice(0, 8).toUpperCase()}`,
              date: new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
              total: typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : (Number(o.totalAmount) || 0),
              status: mapBackendOrderStatus(o.status, o.payment),
              rawStatus: o.status,
              items: (o.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0),
              itemsList: o.items || [],
              payment: o.payment,
              returnRecord: ret,
              returnCount,
            };
          });
          setOrders(mapped);
        }
      })
      .catch(err => {
        console.warn('Failed to load orders from backend:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const firstProductId = selectedOrder?.itemsList?.[0]?.productId;
      if (firstProductId) {
        await api.post(`/reviews/products/${firstProductId}/reviews`, {
          rating,
          comment: reviewText,
        });
      }
    } catch (err: any) {
      console.warn('Review API note:', err.message);
    }

    Swal.fire({
      title: 'Berhasil!',
      text: 'Terima kasih! Ulasan Anda telah tersimpan.',
      icon: 'success',
      confirmButtonColor: '#ea580c',
      confirmButtonText: 'OK'
    });

    setReviewModalOpen(false);
    setSelectedOrder(null);
    setRating(0);
    setReviewText('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selesai': return <CheckCircle className="text-green-500" size={20} />;
      case 'Dikirim': return <Truck className="text-blue-500" size={20} />;
      case 'Diproses': return <Package className="text-indigo-500" size={20} />;
      case 'Menunggu Verifikasi': return <Clock className="text-blue-500" size={20} />;
      case 'Bukti Ditolak': return <Clock className="text-red-500" size={20} />;
      case 'Menunggu Pembayaran': return <Clock className="text-orange-500" size={20} />;
      default: return <Package className="text-gray-500" size={20} />;
    }
  };

  const filteredOrders = activeTab === 'Semua' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Pesanan Saya</h1>
        <Link to="/customer/dashboard" className="w-70 mb-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center text-sm">
          <ChevronLeft size={16} className="mr-1" /> Kembali ke Dashboard
        </Link>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-100 min-w-max">
            {['Semua', 'Menunggu Pembayaran', 'Menunggu Verifikasi', 'Diproses', 'Dikirim', 'Selesai'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
            <Loader2 size={36} className="animate-spin text-orange-500 mb-3" />
            <p className="text-gray-500 font-medium">Memuat pesanan Anda dari database...</p>
          </div>
        ) : (
          /* Order List */
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-900">{order.displayId}</h3>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{order.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.items} Produk • Rp {order.total.toLocaleString('id-ID')}</p>
                    <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${
                      order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      order.status === 'Dikirim' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Diproses' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'Menunggu Verifikasi' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Bukti Ditolak' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                  {order.status === 'Menunggu Pembayaran' && (
                    <Link
                      to={`/customer/orders/${order.id}?pay=true`}
                      className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                    >
                      <CreditCard size={16} className="mr-1.5" /> Bayar Sekarang
                    </Link>
                  )}
                  {order.status === 'Menunggu Verifikasi' && (
                    <Link
                      to={`/customer/orders/${order.id}`}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center justify-center text-sm shadow-sm"
                    >
                      <Clock size={16} className="mr-1.5" /> Cek Verifikasi
                    </Link>
                  )}
                  {order.status === 'Bukti Ditolak' && (
                    <Link
                      to={`/customer/orders/${order.id}?pay=true`}
                      className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                    >
                      <CreditCard size={16} className="mr-1.5" /> Upload Ulang Bukti
                    </Link>
                  )}
                  {order.status === 'Selesai' && (
                    <>
                      <button
                        onClick={() => { setSelectedOrder(order); setReviewModalOpen(true); }}
                        className="w-full sm:w-auto px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-bold hover:bg-orange-100 transition-colors flex items-center justify-center text-sm"
                      >
                        <MessageSquare size={16} className="mr-2" /> Beri Ulasan
                      </button>
                      {order.returnRecord ? (
                        <>
                          <Link
                            to={`/customer/returns?orderId=${order.id}${order.returnRecord.id ? `&returnId=${order.returnRecord.id}` : ''}`}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center text-sm border ${
                              order.returnRecord.status === 'REFUNDED'
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : order.returnRecord.status === 'REJECTED'
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                : order.returnRecord.status === 'APPROVED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : order.returnRecord.status === 'SHIPPED_BY_CUSTOMER'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                : order.returnRecord.status === 'RECEIVED'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                            }`}
                          >
                            <RotateCcw size={16} className="mr-1.5" />
                            {order.returnRecord.status === 'REFUNDED' ? 'Retur Selesai' :
                             order.returnRecord.status === 'REJECTED'
                              ? ((order.returnCount || 1) >= 2 ? 'Retur Ditolak (Final)' : 'Retur Ditolak')
                              : order.returnRecord.status === 'APPROVED' ? 'Retur Disetujui' :
                             order.returnRecord.status === 'SHIPPED_BY_CUSTOMER' ? 'Barang Diretur' :
                             order.returnRecord.status === 'RECEIVED' ? 'Retur di Gudang' :
                             'Retur Diproses'}
                          </Link>
                          {order.returnRecord.status === 'REJECTED' && (order.returnCount || 1) < 2 && (
                            <Link
                              to={`/customer/return/${order.id}`}
                              className="w-full sm:w-auto px-4 py-2 bg-amber-50 text-amber-700 border border-amber-300 rounded-lg font-bold hover:bg-amber-100 transition-colors flex items-center justify-center text-sm shadow-sm"
                              title="Batas maksimal 1x pengajuan ulang"
                            >
                              <RotateCcw size={15} className="mr-1.5" /> Ajukan Ulang
                            </Link>
                          )}
                        </>
                      ) : (
                        <Link
                          to={`/customer/return/${order.id}`}
                          className="w-full sm:w-auto px-4 py-2 bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition-colors flex items-center justify-center text-sm"
                        >
                          Ajukan Pengembalian
                        </Link>
                      )}
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
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Nilai Pesanan {selectedOrder.displayId}</h2>
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
