import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Package,
  CreditCard,
  AlertCircle,
  ExternalLink,
  X,
  Send,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../utils/api';
import { resolveProductImageUrl } from '../utils/image';
import type { ReturnRequest, ReturnStatus } from '../types';

const COURIER_PRESETS = [
  'JNE Express',
  'J&T Express',
  'SiCepat',
  'Anteraja',
  'SPX (Shopee Express)',
  'Pos Indonesia',
  'Lion Parcel',
  'TIKI',
  'Lainnya',
];

export default function AdminReturnManagement() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Action states inside modal
  const [actionNotes, setActionNotes] = useState('');
  const [actionRefundAmount, setActionRefundAmount] = useState<number | string>('');
  const [updating, setUpdating] = useState(false);

  // Skenario A specific states
  const [actionSolutionType, setActionSolutionType] = useState<'REPLACEMENT' | 'REFUND'>('REPLACEMENT');
  const [actionReplacementCourier, setActionReplacementCourier] = useState('JNE Express');
  const [actionReplacementTracking, setActionReplacementTracking] = useState('');
  const [currentProductStock, setCurrentProductStock] = useState<number | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  // Lightbox for proof images
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns/admin/all');
      if (res?.returns && Array.isArray(res.returns)) {
        setReturns(res.returns);
        if (selectedReturn) {
          const updated = res.returns.find((r: ReturnRequest) => r.id === selectedReturn.id);
          if (updated) setSelectedReturn(updated);
        }
      }
    } catch (err: any) {
      console.error('Failed to load admin returns:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: err.message || 'Tidak dapat mengambil daftar pengembalian produk.',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const openDetailModal = async (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setActionNotes(ret.adminNotes || '');
    setActionRefundAmount(ret.refundAmount || 0);
    const initialSol = (ret.solutionType || ret.preferredSolution || 'REPLACEMENT') as 'REPLACEMENT' | 'REFUND';
    setActionSolutionType(initialSol);
    setActionReplacementCourier(ret.replacementCourier || 'JNE Express');
    setActionReplacementTracking(ret.replacementTrackingNumber || '');
    setIsModalOpen(true);

    // Check product stock real-time
    if (ret.productId) {
      setCheckingStock(true);
      try {
        const prodRes = await api.get(`/products/${ret.productId}`);
        const p = prodRes.product || prodRes;
        if (p && typeof p.stock === 'number') {
          setCurrentProductStock(p.stock);
        } else {
          setCurrentProductStock(ret.product?.stock ?? null);
        }
      } catch {
        setCurrentProductStock(ret.product?.stock ?? null);
      } finally {
        setCheckingStock(false);
      }
    } else {
      setCurrentProductStock(null);
    }
  };

  const handleUpdateStatus = async (newStatus: ReturnStatus) => {
    if (!selectedReturn) return;

    // Validation for REJECTED
    if (newStatus === 'REJECTED' && !actionNotes.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Alasan Penolakan Wajib Diisi',
        text: 'Harap tuliskan catatan/alasan penolakan pengembalian produk untuk pembeli.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    // Validation for REPLACEMENT_SHIPPED
    if (newStatus === 'REPLACEMENT_SHIPPED' && !actionReplacementTracking.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nomor Resi Baru Wajib Diisi',
        text: 'Harap masukkan nomor resi pengiriman unit baru untuk pembeli.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    const confirmLabels: Record<ReturnStatus, { title: string; text: string; confirmBtn: string; color: string }> = {
      APPROVED: {
        title: actionSolutionType === 'REPLACEMENT' ? 'Setujui Ganti Barang Baru?' : 'Setujui Pengembalian Dana?',
        text: actionSolutionType === 'REPLACEMENT'
          ? 'Pengajuan disetujui untuk Ganti Barang Baru. Pembeli akan diminta mengirimkan unit lama ke toko (ongkir balik ditanggung toko).'
          : 'Pengajuan disetujui untuk Refund 100% Penuh (harga barang + ongkir awal). Pembeli akan diminta mengirimkan barang ke gudang.',
        confirmBtn: 'Ya, Setujui',
        color: '#2563eb',
      },
      SHIPPED_BY_CUSTOMER: {
        title: 'Ubah Status ke Dalam Pengiriman?',
        text: 'Menandai bahwa barang sedang dalam perjalanan ke gudang toko.',
        confirmBtn: 'Ya, Ubah',
        color: '#7c3aed',
      },
      RECEIVED: {
        title: 'Konfirmasi Barang Sampai di Gudang?',
        text: 'Barang retur telah diterima di gudang dan lolos verifikasi fisik oleh tim QC.',
        confirmBtn: 'Ya, Barang Diterima (QC Passed)',
        color: '#4f46e5',
      },
      REPLACEMENT_SHIPPED: {
        title: 'Kirim Barang Pengganti Baru?',
        text: `Unit baru telah disiapkan dan dikirim via ${actionReplacementCourier} (Resi: "${actionReplacementTracking}"). 1 unit stok barang akan dipotong dari gudang.`,
        confirmBtn: 'Ya, Kirim Unit Baru',
        color: '#0d9488',
      },
      REFUNDED: {
        title: 'Selesaikan Pengembalian Dana (Refund 100%)?',
        text: `Pastikan dana refund 100% sebesar Rp${Number(actionRefundAmount || selectedReturn.refundAmount).toLocaleString('id-ID')} telah ditransfer ke rekening pembeli. Status retur akan selesai.`,
        confirmBtn: 'Ya, Refund Berhasil',
        color: '#16a34a',
      },
      COMPLETED: {
        title: 'Selesaikan Transaksi Pengembalian?',
        text: 'Proses penukaran / retur produk ini telah rampung sepenuhnya.',
        confirmBtn: 'Ya, Selesaikan',
        color: '#16a34a',
      },
      REJECTED: {
        title: 'Tolak Permohonan Pengembalian?',
        text: `Alasan penolakan: "${actionNotes}". Notifikasi penolakan akan dikirimkan ke pembeli.`,
        confirmBtn: 'Tolak Pengajuan',
        color: '#dc2626',
      },
      PENDING: {
        title: 'Kembalikan ke Status Menunggu?',
        text: 'Status pengembalian akan dikembalikan ke tinjauan awal.',
        confirmBtn: 'Ya, Ubah',
        color: '#eab308',
      },
    };

    const confirmConfig = confirmLabels[newStatus];

    const result = await Swal.fire({
      title: confirmConfig.title,
      text: confirmConfig.text,
      icon: newStatus === 'REJECTED' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: confirmConfig.color,
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmConfig.confirmBtn,
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    setUpdating(true);
    try {
      await api.patch(`/returns/${selectedReturn.id}/status`, {
        status: newStatus,
        adminNotes: actionNotes.trim() || null,
        refundAmount: Number(actionRefundAmount) || selectedReturn.refundAmount,
        solutionType: actionSolutionType,
        replacementCourier: actionReplacementCourier.trim() || null,
        replacementTrackingNumber: actionReplacementTracking.trim() || null,
        shippingFeeBearer: 'SELLER',
      });

      Swal.fire({
        icon: 'success',
        title: 'Status Berhasil Diperbarui!',
        text: `Status pengembalian #${selectedReturn.id.slice(0, 8).toUpperCase()} telah diubah menjadi ${newStatus}.`,
        confirmButtonColor: '#ea580c',
      });

      setIsModalOpen(false);
      fetchReturns();
    } catch (err: any) {
      console.error('Failed to update return status:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memperbarui Status',
        text: err.message || 'Terjadi kesalahan pada server.',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Stats calculation
  const totalCount = returns.length;
  const pendingCount = returns.filter((r) => r.status === 'PENDING').length;
  const approvedCount = returns.filter((r) => r.status === 'APPROVED').length;
  const shippingCount = returns.filter((r) => r.status === 'SHIPPED_BY_CUSTOMER').length;
  const receivedCount = returns.filter((r) => r.status === 'RECEIVED').length;
  const replacementCount = returns.filter((r) => r.status === 'REPLACEMENT_SHIPPED').length;
  const refundedCount = returns.filter((r) => r.status === 'REFUNDED').length;
  const rejectedCount = returns.filter((r) => r.status === 'REJECTED').length;

  // Filtering
  const filteredReturns = returns.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesId = item.id.toLowerCase().includes(term);
    const matchesOrder = item.orderId.toLowerCase().includes(term);
    const matchesUser = item.user?.name?.toLowerCase().includes(term) || item.user?.email?.toLowerCase().includes(term);
    const matchesProduct = item.productName?.toLowerCase().includes(term) || item.reason?.toLowerCase().includes(term);
    const matchesTracking = item.returnTrackingNumber?.toLowerCase().includes(term);

    return matchesStatus && (matchesId || matchesOrder || matchesUser || matchesProduct || matchesTracking);
  });

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1" /> Menunggu Tinjauan</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><CheckCircle2 size={12} className="mr-1" /> Disetujui (Kirim Barang)</span>;
      case 'SHIPPED_BY_CUSTOMER':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800"><Truck size={12} className="mr-1" /> Sedang Dikirim Balik</span>;
      case 'RECEIVED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800"><Package size={12} className="mr-1" /> Diterima di Gudang</span>;
      case 'REPLACEMENT_SHIPPED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800"><Truck size={12} className="mr-1" /> Unit Baru Dikirim</span>;
      case 'REFUNDED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800"><CheckCircle2 size={12} className="mr-1" /> Selesai (Refunded)</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 size={12} className="mr-1" /> Selesai (Ditukar)</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"><XCircle size={12} className="mr-1" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Semua Retur</span>
            <RotateCcw size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{totalCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'PENDING' ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-500' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-700 uppercase">Perlu Tinjauan</span>
            <Clock size={16} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-black text-yellow-800 mt-2">{pendingCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'APPROVED' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase">Disetujui</span>
            <CheckCircle2 size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-800 mt-2">{approvedCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('SHIPPED_BY_CUSTOMER')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'SHIPPED_BY_CUSTOMER' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase">Dikirim Balik</span>
            <Truck size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-800 mt-2">{shippingCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('RECEIVED')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'RECEIVED' ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase">Di Gudang (QC)</span>
            <Package size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-800 mt-2">{receivedCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('REPLACEMENT_SHIPPED')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'REPLACEMENT_SHIPPED' ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700 uppercase">Unit Baru Dikirim</span>
            <Truck size={16} className="text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-800 mt-2">{replacementCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('REFUNDED')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'REFUNDED' ? 'bg-green-50 border-green-300 ring-2 ring-green-500' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-700 uppercase">Selesai Refund</span>
            <CreditCard size={16} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-green-800 mt-2">{refundedCount}</p>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID Retur, Order, Pelanggan, atau Resi..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 p-2 font-medium"
          >
            <option value="ALL">Semua Status ({totalCount})</option>
            <option value="PENDING">Perlu Tinjauan ({pendingCount})</option>
            <option value="APPROVED">Disetujui ({approvedCount})</option>
            <option value="SHIPPED_BY_CUSTOMER">Sedang Dikirim Balik ({shippingCount})</option>
            <option value="RECEIVED">Diterima di Gudang ({receivedCount})</option>
            <option value="REFUNDED">Selesai Refund ({refundedCount})</option>
            <option value="REJECTED">Ditolak ({rejectedCount})</option>
          </select>

          <button
            type="button"
            onClick={fetchReturns}
            className="p-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="h-8 w-8 text-orange-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">Memuat data pengembalian produk...</p>
          </div>
        ) : filteredReturns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">ID Retur & Tanggal</th>
                  <th className="px-5 py-3.5">Pelanggan</th>
                  <th className="px-5 py-3.5">Pesanan & Produk</th>
                  <th className="px-5 py-3.5">Alasan & Bukti</th>
                  <th className="px-5 py-3.5">Resi Balik</th>
                  <th className="px-5 py-3.5">Nominal Refund</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredReturns.map((ret) => {
                  const thumbnail = ret.product?.images?.[0] || ret.proofImages?.[0] || '/assets/uploads/products/placeholder.svg';
                  return (
                    <tr key={ret.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="font-mono font-bold text-gray-900 block text-xs">
                            #{ret.id.slice(0, 8).toUpperCase()}
                          </span>
                          {returns.filter(r => r.orderId === ret.orderId).length > 1 && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200" title="Pengajuan Ulang">
                              Ajukan Ulang
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {new Date(ret.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900 text-xs truncate max-w-[140px]">
                          {ret.user?.name || 'Pelanggan'}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate max-w-[140px]">
                          {ret.user?.email || ret.contactInfo}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={resolveProductImageUrl(thumbnail)}
                            alt={ret.productName || 'Produk'}
                            className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/uploads/products/placeholder.svg';
                            }}
                          />
                          <div className="min-w-0 max-w-[160px]">
                            <p className="font-semibold text-gray-900 text-xs truncate">
                              {ret.productName || 'Semua Produk'}
                            </p>
                            <p className="font-mono text-[10px] text-gray-500 truncate">
                              Ord: #{ret.orderId.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 text-xs line-clamp-1">{ret.reason}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            (ret.solutionType || ret.preferredSolution) === 'REPLACEMENT'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {(ret.solutionType || ret.preferredSolution) === 'REPLACEMENT' ? (
                              <><Package size={10} className="mr-1" /> Ganti Baru</>
                            ) : (
                              <><CreditCard size={10} className="mr-1" /> Refund 100%</>
                            )}
                          </span>
                          {ret.proofImages && ret.proofImages.length > 0 && (
                            <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                              {ret.proofImages.length} Foto
                            </span>
                          )}
                          {ret.videoUrl && (
                            <span className="inline-flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              Video
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {ret.returnTrackingNumber ? (
                          <div>
                            <span className="text-[10px] font-semibold text-purple-600 block">
                              {ret.returnCourier || 'Kurir'}
                            </span>
                            <span className="font-mono text-xs font-bold text-gray-800">
                              {ret.returnTrackingNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">-</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-orange-600 text-xs">
                          Rp{Number(ret.refundAmount || 0).toLocaleString('id-ID')}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(ret.status)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => openDetailModal(ret)}
                          className="inline-flex items-center px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          <Eye size={14} className="mr-1" /> Kelola
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <RotateCcw className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-bold text-base">Tidak ada permohonan pengembalian</p>
            <p className="text-gray-400 text-xs mt-1">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Tidak ditemukan pengembalian dengan kriteria pencarian saat ini.'
                : 'Belum ada pembeli yang mengajukan pengembalian produk.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Detail & Aksi Kelola Retur */}
      {isModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <RotateCcw size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Kelola Pengembalian Produk</h3>
                  <p className="text-xs text-orange-100 font-mono">
                    ID Retur: #{selectedReturn.id.slice(0, 8).toUpperCase()} • Pesanan: #{selectedReturn.orderId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-3">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Status Saat Ini:</span>
                  <div className="mt-1">{getStatusBadge(selectedReturn.status)}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Tahapan Pengajuan:</span>
                  <div className="mt-1">
                    {returns.filter(r => r.orderId === selectedReturn.orderId).length > 1 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Pengajuan Ulang (Banding ke-2 / Terakhir)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        Pengajuan Pertama (1/2)
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Tanggal Pengajuan:</span>
                  <p className="text-xs font-bold text-gray-800 mt-1">
                    {new Date(selectedReturn.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
                  </p>
                </div>
              </div>

              {/* Banner Skenario A: Kesalahan Penjual */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl flex-shrink-0 mt-0.5">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-black uppercase rounded tracking-wider">
                        Skenario A
                      </span>
                      <h4 className="font-bold text-emerald-950 text-sm">Kesalahan Murni Pihak Toko (Penjual)</h4>
                    </div>
                    <p className="text-xs text-emerald-900 mt-1">
                      Cacat pabrik, packing rusak, salah kirim barang/ukuran.
                      <strong className="block text-emerald-950 mt-0.5">
                        📦 Ongkir Retur Balik ke Gudang: 100% Ditanggung Penjual!
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-right flex-shrink-0">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Preferensi Pembeli:</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold mt-0.5 ${
                    (selectedReturn.preferredSolution || selectedReturn.solutionType) === 'REPLACEMENT'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {(selectedReturn.preferredSolution || selectedReturn.solutionType) === 'REPLACEMENT' ? (
                      <><Package size={12} className="mr-1" /> Minta Ganti Barang</>
                    ) : (
                      <><CreditCard size={12} className="mr-1" /> Minta Refund 100%</>
                    )}
                  </span>
                </div>
              </div>

              {/* Warehouse Stock Checker & Resolution Selector */}
              <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Produk Terkait:</span>
                    <h4 className="font-bold text-gray-900 text-sm">{selectedReturn.productName || selectedReturn.product?.name || 'Produk Pesanan'}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-semibold">Stok Gudang Real-time:</span>
                    {checkingStock ? (
                      <span className="text-xs text-gray-500 flex items-center"><RefreshCw size={12} className="animate-spin mr-1" /> Mengecek...</span>
                    ) : currentProductStock !== null ? (
                      currentProductStock > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={13} className="mr-1" /> {currentProductStock} Unit Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800">
                          <XCircle size={13} className="mr-1" /> Stok Habis (0 Unit)
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-700 block mb-2">Pilih Solusi yang Diterapkan oleh Toko:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActionSolutionType('REPLACEMENT')}
                      className={`p-3.5 rounded-xl border-2 text-left transition flex items-start space-x-3 cursor-pointer ${
                        actionSolutionType === 'REPLACEMENT'
                          ? 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`p-2 rounded-xl flex-shrink-0 ${actionSolutionType === 'REPLACEMENT' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        <Package size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-gray-900">1. Ganti Barang Baru (Replacement)</span>
                          {currentProductStock !== null && currentProductStock > 0 && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                              Rekomendasi
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">Tukar unit rusak dengan unit baru tanpa kehilangan omzet. Ongkir balik & kirim baru ditanggung toko.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionSolutionType('REFUND')}
                      className={`p-3.5 rounded-xl border-2 text-left transition flex items-start space-x-3 cursor-pointer ${
                        actionSolutionType === 'REFUND'
                          ? 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`p-2 rounded-xl flex-shrink-0 ${actionSolutionType === 'REFUND' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        <CreditCard size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-gray-900">2. Refund Dana 100% Penuh</span>
                          {currentProductStock === 0 && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-red-200 text-red-900 rounded">
                              Disarankan (Stok Habis)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">Dana dikembalikan 100% penuh (Harga barang + ongkir awal yang dibayar pembeli).</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Pelanggan & Rekening Refund */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                    Data Pelanggan
                  </h4>
                  <p className="font-bold text-gray-900">{selectedReturn.user?.name || 'Pelanggan'}</p>
                  <p className="text-xs text-gray-600">{selectedReturn.user?.email || '-'}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">WhatsApp / Kontak:</span>
                    <a
                      href={`https://wa.me/${selectedReturn.contactInfo.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-bold text-green-600 hover:underline"
                    >
                      <MessageCircle size={13} className="mr-1" /> {selectedReturn.contactInfo}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-orange-50/50">
                  <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-2 flex items-center">
                    Rekening Tujuan Refund 100%
                  </h4>
                  <p className="font-bold text-gray-900 text-sm">
                    {selectedReturn.bankName || 'Bank'} - {selectedReturn.bankAccountNumber || '-'}
                  </p>
                  <p className="text-xs text-gray-700 mt-0.5">
                    Atas Nama: <span className="font-semibold">{selectedReturn.bankAccountHolder || '-'}</span>
                  </p>
                  <div className="mt-2 pt-2 border-t border-orange-100 flex items-center justify-between">
                    <span className="text-xs text-gray-600">Nominal 100% (Barang + Ongkir Awal):</span>
                    <span className="font-bold text-orange-700 text-sm">
                      Rp{Number(selectedReturn.refundAmount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Alasan & Bukti Foto */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Alasan Pengembalian:</span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedReturn.reason}</p>
                  {selectedReturn.details && (
                    <p className="text-xs text-gray-700 mt-1 whitespace-pre-line bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {selectedReturn.details}
                    </p>
                  )}
                </div>

                {/* Proof Images Gallery */}
                {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-2">
                      Foto Bukti Fisik ({selectedReturn.proofImages.length} Foto):
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedReturn.proofImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightboxImage(img)}
                          className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-orange-500 transition cursor-pointer"
                        >
                          <img
                            src={img}
                            alt={`Bukti ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Eye size={16} className="text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video URL */}
                {selectedReturn.videoUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedReturn.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline"
                    >
                      <ExternalLink size={14} className="mr-1" /> Buka Tautan Video Unboxing Pelanggan
                    </a>
                  </div>
                )}
              </div>

              {/* Info Resi Pengiriman Balik dari Pelanggan */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">
                  Resi Pengiriman Balik Pembeli (Ongkir Ditanggung Toko)
                </span>
                {selectedReturn.returnTrackingNumber ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-purple-900 text-sm">
                        {selectedReturn.returnCourier || 'Ekspedisi'} - {selectedReturn.returnTrackingNumber}
                      </p>
                      <p className="text-xs text-gray-500">Barang retur sedang dalam perjalanan ke gudang SOTOYS.</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-xs">
                      Resi Terlampir
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Pembeli belum memasukkan nomor resi pengiriman balik.</p>
                )}
              </div>

              {/* Form Input Resi Unit Pengganti Baru (Jika Solusi Ganti Barang & Barang Sudah Diterima Gudang) */}
              {selectedReturn.status === 'RECEIVED' && actionSolutionType === 'REPLACEMENT' && (
                <div className="p-4 rounded-2xl border-2 border-teal-300 bg-teal-50/60 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-teal-950">
                    <Truck size={20} className="text-teal-700" />
                    <h4 className="font-bold text-sm">Pengiriman Unit Pengganti Baru ke Pembeli</h4>
                  </div>
                  <p className="text-xs text-teal-800">
                    Barang cacat telah lolos QC gudang. Siapkan unit baru dan masukkan rincian pengiriman:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Ekspedisi Pengiriman Unit Baru *
                      </label>
                      <select
                        value={actionReplacementCourier}
                        onChange={(e) => setActionReplacementCourier(e.target.value)}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 text-sm bg-white"
                      >
                        {COURIER_PRESETS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nomor Resi Pengiriman Unit Baru *
                      </label>
                      <input
                        type="text"
                        value={actionReplacementTracking}
                        onChange={(e) => setActionReplacementTracking(e.target.value)}
                        placeholder="Contoh: SOCEX0123456789"
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 text-sm bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tampilan Info Unit Baru Jika Status REPLACEMENT_SHIPPED atau COMPLETED */}
              {(selectedReturn.status === 'REPLACEMENT_SHIPPED' || selectedReturn.status === 'COMPLETED') && (
                <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50 text-xs text-teal-950 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black uppercase text-[10px] tracking-wider text-teal-700 block">
                        Unit Pengganti Baru Telah Dikirim
                      </span>
                      <p className="font-bold text-sm text-teal-900 mt-0.5">
                        {selectedReturn.replacementCourier || 'Ekspedisi'} - {selectedReturn.replacementTrackingNumber || '-'}
                      </p>
                      {selectedReturn.replacementShippedAt && (
                        <p className="text-[11px] text-teal-700 mt-0.5">
                          Waktu Kirim: {new Date(selectedReturn.replacementShippedAt).toLocaleString('id-ID')} WIB
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-teal-200 text-teal-900 rounded-full font-bold text-xs">
                      {selectedReturn.status === 'COMPLETED' ? 'Penukaran Selesai' : 'Sedang Dikirim'}
                    </span>
                  </div>
                </div>
              )}

              {/* Form Aksi Admin */}
              <div className="p-4 rounded-xl border-2 border-orange-200 bg-orange-50/30 space-y-4">
                <h4 className="font-bold text-gray-900 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-1.5 text-orange-600" /> Catatan & Pengaturan Refund Admin
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nominal Refund yang Disetujui (Rp)
                    </label>
                    <input
                      type="number"
                      value={actionRefundAmount}
                      onChange={(e) => setActionRefundAmount(e.target.value)}
                      placeholder="Nominal refund..."
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Catatan / Instruksi untuk Pembeli
                    </label>
                    <input
                      type="text"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Alasan penolakan / alamat pengiriman / catatan refund..."
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 text-sm bg-white"
                    />
                  </div>
                </div>

                {/* Tombol Aksi Lifecycle */}
                <div className="pt-2 border-t border-orange-200 flex flex-wrap gap-2 justify-end">
                  {selectedReturn.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus('REJECTED')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        Tolak Pengajuan
                      </button>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus('APPROVED')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {actionSolutionType === 'REPLACEMENT' ? 'Setujui Ganti Barang Baru' : 'Setujui Refund 100% Penuh'}
                      </button>
                    </>
                  )}

                  {(selectedReturn.status === 'APPROVED' || selectedReturn.status === 'SHIPPED_BY_CUSTOMER') && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus('RECEIVED')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      Konfirmasi Barang Tiba di Gudang (QC Passed)
                    </button>
                  )}

                  {selectedReturn.status === 'RECEIVED' && (
                    actionSolutionType === 'REPLACEMENT' ? (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus('REPLACEMENT_SHIPPED')}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center"
                      >
                        <Truck size={14} className="mr-1.5" /> Kirim Barang Pengganti Baru
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus('REFUNDED')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        Konfirmasi Refund 100% Ditransfer (Selesai)
                      </button>
                    )
                  )}

                  {selectedReturn.status === 'REPLACEMENT_SHIPPED' && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center"
                    >
                      <CheckCircle2 size={14} className="mr-1.5" /> Selesaikan Penukaran (Completed)
                    </button>
                  )}

                  {/* Tombol Simpan Catatan saja jika sudah selesai atau ditolak */}
                  {(selectedReturn.status === 'REFUNDED' || selectedReturn.status === 'COMPLETED' || selectedReturn.status === 'REJECTED') && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(selectedReturn.status)}
                      className="px-4 py-2 bg-gray-800 hover:bg-black text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      Perbarui Catatan Admin
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-white text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal untuk Bukti Foto */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Bukti Foto Full"
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

