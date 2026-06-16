import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCcw, Package, ChevronLeft, CheckCircle, Clock, Truck, XCircle, Search, ChevronRight, ArrowLeft, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type ReturnStatus = 'PENDING' | 'APPROVED' | 'PICKUP' | 'RECEIVED' | 'REFUNDED' | 'REJECTED';

interface ReturnItem {
  id: string;
  orderId: string;
  productName: string;
  productImage: string;
  reason: string;
  status: ReturnStatus;
  createdAt: Date;
  updatedAt: Date;
  refundAmount: number;
  timeline: ReturnTimelineEvent[];
}

interface ReturnTimelineEvent {
  id: number;
  date: string;
  status: string;
  description: string;
  isCompleted: boolean;
}

const MOCK_RETURNS: ReturnItem[] = [
  {
    id: 'RTN-20260616-001',
    orderId: 'ORD-20231015-001',
    productName: 'Robot Mainan Canggih',
    productImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&auto=format&fit=crop&q=80',
    reason: 'Barang cacat produksi, bagian tangan robot tidak bisa bergerak.',
    status: 'PICKUP',
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 1),
    refundAmount: 250000,
    timeline: [
      { id: 1, date: '13 Jun 2026, 10:30', status: 'Pengajuan Diterima', description: 'Permohonan pengembalian berhasil diajukan dan sedang ditinjau oleh tim kami.', isCompleted: true },
      { id: 2, date: '14 Jun 2026, 09:15', status: 'Pengajuan Disetujui', description: 'Tim kami telah menyetujui permintaan pengembalian Anda. Harap siapkan paket untuk dijemput kurir.', isCompleted: true },
      { id: 3, date: '15 Jun 2026, 08:00', status: 'Penjemputan Kurir', description: 'Kurir JNE sedang dalam perjalanan menjemput paket Anda.', isCompleted: false },
      { id: 4, date: '-', status: 'Barang Diterima Gudang', description: 'Paket dikembalikan dan diterima di gudang SOTOYS untuk pengecekan.', isCompleted: false },
      { id: 5, date: '-', status: 'Dana Dikembalikan', description: 'Refund berhasil diproses ke metode pembayaran Anda.', isCompleted: false },
    ]
  },
  {
    id: 'RTN-20260610-002',
    orderId: 'ORD-20231020-002',
    productName: 'Puzzle Kayu Edukatif',
    productImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&auto=format&fit=crop&q=80',
    reason: 'Jumlah puzzle tidak lengkap, kurang 5 keping.',
    status: 'REFUNDED',
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    refundAmount: 100000,
    timeline: [
      { id: 1, date: '06 Jun 2026, 14:00', status: 'Pengajuan Diterima', description: 'Permohonan pengembalian berhasil diajukan.', isCompleted: true },
      { id: 2, date: '07 Jun 2026, 10:30', status: 'Pengajuan Disetujui', description: 'Tim kami menyetujui pengembalian Anda.', isCompleted: true },
      { id: 3, date: '08 Jun 2026, 09:00', status: 'Penjemputan Kurir', description: 'Kurir telah menjemput paket Anda.', isCompleted: true },
      { id: 4, date: '09 Jun 2026, 15:20', status: 'Barang Diterima Gudang', description: 'Paket telah diterima dan dicek oleh tim QC kami.', isCompleted: true },
      { id: 5, date: '11 Jun 2026, 11:00', status: 'Dana Dikembalikan', description: 'Refund sebesar Rp100.000 berhasil dikembalikan ke saldo OVO Anda.', isCompleted: true },
    ]
  },
  {
    id: 'RTN-20260605-003',
    orderId: 'ORD-20230910-004',
    productName: 'Boneka Beruang Besar',
    productImage: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=300&auto=format&fit=crop&q=80',
    reason: 'Warna tidak sesuai deskripsi produk.',
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 86400000 * 15),
    updatedAt: new Date(Date.now() - 86400000 * 13),
    refundAmount: 0,
    timeline: [
      { id: 1, date: '01 Jun 2026, 16:45', status: 'Pengajuan Diterima', description: 'Permohonan pengembalian diajukan.', isCompleted: true },
      { id: 2, date: '03 Jun 2026, 11:00', status: 'Pengajuan Ditolak', description: 'Maaf, pengembalian ditolak karena warna produk sudah sesuai dengan deskripsi yang tertera di halaman produk.', isCompleted: true },
    ]
  }
];

export default function CustomerReturnTracking() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReturnStatus | 'ALL'>('ALL');
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchReturns = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setReturns(MOCK_RETURNS);
      setLoading(false);
    };

    fetchReturns();
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
    }).format(date);
  };

  const getStatusDisplay = (status: ReturnStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Menunggu Review', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} className="mr-1.5" /> };
      case 'APPROVED':
        return { label: 'Disetujui', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={16} className="mr-1.5" /> };
      case 'PICKUP':
        return { label: 'Penjemputan Kurir', color: 'bg-orange-100 text-orange-800', icon: <Truck size={16} className="mr-1.5" /> };
      case 'RECEIVED':
        return { label: 'Diterima Gudang', color: 'bg-indigo-100 text-indigo-800', icon: <Package size={16} className="mr-1.5" /> };
      case 'REFUNDED':
        return { label: 'Dana Dikembalikan', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="mr-1.5" /> };
      case 'REJECTED':
        return { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: <XCircle size={16} className="mr-1.5" /> };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  const getTimelineIcon = (status: string, isCompleted: boolean) => {
    let Icon = Clock;
    let colorClass = 'text-gray-300';
    let bgClass = 'bg-gray-100';

    if (status.includes('Diterima') && !status.includes('Gudang')) {
      Icon = Package;
      if (isCompleted) { colorClass = 'text-blue-500'; bgClass = 'bg-blue-100'; }
    } else if (status.includes('Disetujui')) {
      Icon = CheckCircle;
      if (isCompleted) { colorClass = 'text-green-500'; bgClass = 'bg-green-100'; }
    } else if (status.includes('Kurir') || status.includes('Penjemputan')) {
      Icon = Truck;
      if (isCompleted) { colorClass = 'text-orange-500'; bgClass = 'bg-orange-100'; }
    } else if (status.includes('Gudang')) {
      Icon = Package;
      if (isCompleted) { colorClass = 'text-indigo-500'; bgClass = 'bg-indigo-100'; }
    } else if (status.includes('Dana') || status.includes('Dikembalikan')) {
      Icon = CheckCircle;
      if (isCompleted) { colorClass = 'text-green-600'; bgClass = 'bg-green-100'; }
    } else if (status.includes('Ditolak')) {
      Icon = XCircle;
      if (isCompleted) { colorClass = 'text-red-500'; bgClass = 'bg-red-100'; }
    }

    return { Icon, colorClass, bgClass };
  };

  const filteredReturns = filter === 'ALL' ? returns : returns.filter(r => r.status === filter);

  // Detail View
  if (selectedReturn) {
    const statusDisplay = getStatusDisplay(selectedReturn.status);
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedReturn(null)}
            className="flex items-center text-gray-600 hover:text-orange-600 mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Daftar Pengembalian
          </button>

          {/* Return Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-orange-50 p-6 border-b border-orange-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedReturn.productImage}
                    alt={selectedReturn.productName}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedReturn.productName}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">ID Retur: <span className="font-semibold text-gray-700">{selectedReturn.id}</span></p>
                    <p className="text-sm text-gray-500">Pesanan: <span className="font-semibold text-gray-700">{selectedReturn.orderId}</span></p>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusDisplay.color}`}>
                    {statusDisplay.icon}
                    {statusDisplay.label}
                  </span>
                  {selectedReturn.refundAmount > 0 && (
                    <span className="text-sm font-bold text-gray-900">
                      Refund: {formatCurrency(selectedReturn.refundAmount)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Alasan Pengembalian</h3>
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedReturn.reason}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <RefreshCcw size={20} className="mr-2 text-orange-600" />
                Proses Pengembalian
              </h3>
            </div>

            <div className="p-6 md:p-8">
              <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                {selectedReturn.timeline.map((event) => {
                  const { Icon, colorClass, bgClass } = getTimelineIcon(event.status, event.isCompleted);

                  return (
                    <div key={event.id} className="relative pl-8">
                      <div className={`absolute -left-[21px] flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white z-10 ${bgClass}`}>
                        <Icon size={18} className={colorClass} />
                      </div>

                      <div className={`${!event.isCompleted ? 'opacity-50' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                          <h4 className={`text-base font-bold ${event.isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {event.status}
                          </h4>
                          <span className="text-sm font-medium text-gray-500 mt-1 sm:mt-0 whitespace-nowrap">
                            {event.date}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <main className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">

          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <RefreshCcw size={24} className="mr-2 text-orange-600" />
            Proses Pengembalian
          </h1>
        </div>

        {/* Filters */}

        <Link to="/customer/dashboard" className="w-70 mb-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center text-sm hover:bg-orange-500 hover:text-white">
          <ChevronLeft size={16} className="mr-1" /> Kembali ke Dashboard
        </Link>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'PICKUP', 'RECEIVED', 'REFUNDED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${filter === status
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {status === 'ALL' ? 'Semua' : getStatusDisplay(status).label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-500">Memuat data pengembalian...</p>
          </div>
        ) : filteredReturns.length > 0 ? (
          <div className="space-y-4">
            {filteredReturns.map((returnItem) => {
              const statusDisplay = getStatusDisplay(returnItem.status);
              const completedSteps = returnItem.timeline.filter(t => t.isCompleted).length;
              const totalSteps = returnItem.timeline.length;
              const progressPercent = Math.round((completedSteps / totalSteps) * 100);

              return (
                <div
                  key={returnItem.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedReturn(returnItem)}
                >
                  <div className="border-b border-gray-100 p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <RefreshCcw className="text-gray-400" size={20} />
                      <div>
                        <span className="font-semibold text-gray-900 block sm:inline">{returnItem.id}</span>
                        <span className="text-sm text-gray-500 sm:ml-2">{formatDate(returnItem.createdAt)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                      {statusDisplay.label}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={returnItem.productImage}
                        alt={returnItem.productName}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{returnItem.productName}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Pesanan: {returnItem.orderId}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">Alasan: {returnItem.reason}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-500">Progres Pengembalian</span>
                        <span className="text-xs font-bold text-orange-600">{completedSteps}/{totalSteps} tahap</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${returnItem.status === 'REJECTED' ? 'bg-red-500' :
                            returnItem.status === 'REFUNDED' ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      {returnItem.refundAmount > 0 && (
                        <p className="text-sm text-gray-600">
                          Refund: <span className="font-bold text-gray-900">{formatCurrency(returnItem.refundAmount)}</span>
                        </p>
                      )}
                      <button
                        className="ml-auto flex items-center px-4 py-2 bg-white border border-orange-200 text-orange-600 text-sm font-medium rounded hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      >
                        <Eye size={16} className="mr-1.5" />
                        Lihat Detail
                        <ChevronRight size={16} className="ml-1" />
                      </button>
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada pengembalian</h3>
            <p className="text-gray-500 mb-6">Anda belum pernah mengajukan pengembalian produk.</p>
            <Link
              to="/customer/orders"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Lihat Pesanan Saya
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
