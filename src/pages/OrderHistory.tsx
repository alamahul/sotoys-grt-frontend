import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, Search } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';

// Mock data for order history
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-20231025-003',
    userId: 'u1',
    status: 'PENDING_PAYMENT',
    totalAmount: 350000,
    shippingAddress: 'Jl. Merdeka No. 10, Jakarta',
    courier: 'J&T',
    shippingCost: 25000,
    paymentMethod: 'OVO',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ORD-20231020-002',
    userId: 'u1',
    status: 'SHIPPED',
    totalAmount: 180000,
    shippingAddress: 'Jl. Merdeka No. 10, Jakarta',
    courier: 'SiCepat',
    shippingCost: 15000,
    trackingNumber: 'SC0987654321',
    paymentMethod: 'BCA Virtual Account',
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: 'ORD-20231015-001',
    userId: 'u1',
    status: 'DELIVERED',
    totalAmount: 450000,
    shippingAddress: 'Jl. Merdeka No. 10, Jakarta',
    courier: 'JNE',
    shippingCost: 20000,
    trackingNumber: 'JN1234567890',
    paymentMethod: 'Gopay',
    createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    updatedAt: new Date(Date.now() - 86400000 * 8),
  },
  {
    id: 'ORD-20230910-004',
    userId: 'u1',
    status: 'CANCELLED',
    totalAmount: 210000,
    shippingAddress: 'Jl. Merdeka No. 10, Jakarta',
    courier: 'JNE',
    shippingCost: 20000,
    paymentMethod: 'Bank Transfer',
    createdAt: new Date(Date.now() - 86400000 * 45), // 45 days ago
    updatedAt: new Date(Date.now() - 86400000 * 44),
  }
];

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft('Waktu Habis');
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="text-red-600 font-bold ml-1">{timeLeft}</span>;
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Simulate fetching order history from server
    const fetchOrders = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // fake network delay
      setOrders(MOCK_ORDERS);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} className="mr-1.5" /> };
      case 'PAID':
        return { label: 'Sudah Dibayar', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={16} className="mr-1.5" /> };
      case 'PROCESSING':
        return { label: 'Diproses', color: 'bg-indigo-100 text-indigo-800', icon: <Package size={16} className="mr-1.5" /> };
      case 'SHIPPED':
        return { label: 'Sedang Dikirim', color: 'bg-orange-100 text-orange-800', icon: <Truck size={16} className="mr-1.5" /> };
      case 'DELIVERED':
        return { label: 'Selesai', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="mr-1.5" /> };
      case 'CANCELLED':
        return { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: <XCircle size={16} className="mr-1.5" /> };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <main className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Pesanan</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-2">
          {['ALL', 'PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                filter === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'Semua Status' : getStatusDisplay(status as OrderStatus).label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-500">Memuat riwayat transaksi...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status);
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="border-b border-gray-100 p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <Package className="text-gray-400" size={20} />
                      <div>
                        <span className="font-semibold text-gray-900 block sm:inline">{order.id}</span>
                        <span className="text-sm text-gray-500 sm:ml-2">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                      {statusDisplay.label}
                    </span>
                  </div>
                  
                  <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-4 sm:mb-0">
                      <p className="text-sm text-gray-600 mb-1">Total Belanja</p>
                      <p className="font-bold text-lg text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-500 mt-2">
                          Resi: <span className="font-medium text-gray-700">{order.trackingNumber}</span> ({order.courier})
                        </p>
                      )}
                      {order.status === 'PENDING_PAYMENT' && (
                        <div className="text-sm text-gray-600 mt-3 flex items-center bg-red-50 px-3 py-2 rounded border border-red-100 max-w-max">
                          <Clock className="text-red-500 mr-2" size={16} />
                          Batas Pembayaran: 
                          <CountdownTimer targetDate={new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000)} />
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full sm:w-auto flex space-x-3">
                      {order.status === 'PENDING_PAYMENT' && (
                        <button className="flex-1 sm:flex-none px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                          Bayar Sekarang
                        </button>
                      )}
                      {(order.status === 'DELIVERED') && (
                        <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                          Beri Ulasan
                        </button>
                      )}
                      {(order.status === 'DELIVERED') && (new Date().getTime() - order.updatedAt.getTime() <= 24 * 60 * 60 * 1000) && (
                        <Link to={`/return/${order.id}`} className="flex-1 sm:flex-none px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">Ajukan Pengembalian</Link>
                      )}
                      <Link 
                        to={`/order/${order.id}`}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-orange-200 text-orange-600 text-sm font-medium rounded hover:bg-orange-50 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      >
                        Detail <ChevronRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada transaksi</h3>
            <p className="text-gray-500 mb-6">Mulai belanja mainan impianmu sekarang di SOTOYS!</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Mulai Belanja
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
