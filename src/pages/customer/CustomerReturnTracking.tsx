import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCcw, RotateCcw, Package, ChevronLeft, CheckCircle, Clock, Truck, XCircle, Search, ChevronRight, ArrowLeft, Eye, Send, ExternalLink, Image as ImageIcon, ShieldCheck, Sparkles, Copy, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { resolveProductImageUrl } from '../../utils/image';
import type { ReturnRequest, ReturnStatus, ReturnTimelineEvent } from '../../types';

const COURIER_OPTIONS = [
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

function buildTimeline(ret: ReturnRequest): ReturnTimelineEvent[] {
  const createdDate = new Date(ret.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const updatedDate = new Date(ret.updatedAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (ret.status === 'REJECTED') {
    return [
      { id: 1, date: createdDate, status: 'Pengajuan Diterima', description: 'Permohonan pengembalian berhasil diajukan dan sedang ditinjau oleh tim kami.', isCompleted: true },
      { id: 2, date: updatedDate, status: 'Pengajuan Ditolak', description: `Permohonan ditolak oleh admin. Alasan: ${ret.adminNotes || 'Tidak memenuhi syarat pengembalian.'}`, isCompleted: true },
    ];
  }

  const solution = ret.solutionType || ret.preferredSolution || 'REPLACEMENT';

  if (solution === 'REPLACEMENT') {
    const isApproved = ['APPROVED', 'SHIPPED_BY_CUSTOMER', 'RECEIVED', 'REPLACEMENT_SHIPPED', 'COMPLETED'].includes(ret.status);
    const isShipped = ['SHIPPED_BY_CUSTOMER', 'RECEIVED', 'REPLACEMENT_SHIPPED', 'COMPLETED'].includes(ret.status);
    const isReceived = ['RECEIVED', 'REPLACEMENT_SHIPPED', 'COMPLETED'].includes(ret.status);
    const isReplacementShipped = ['REPLACEMENT_SHIPPED', 'COMPLETED'].includes(ret.status);
    const isCompleted = ret.status === 'COMPLETED';

    return [
      {
        id: 1,
        date: createdDate,
        status: 'Pengajuan Diterima',
        description: 'Permohonan pengembalian (Ganti Barang Baru) berhasil diajukan dan menunggu tinjauan admin.',
        isCompleted: true,
      },
      {
        id: 2,
        date: isApproved ? updatedDate : '-',
        status: 'Pengajuan Disetujui (Ganti Baru)',
        description: isApproved
          ? (ret.adminNotes || 'Admin telah menyetujui penukaran unit baru. Ongkos kirim retur balik ke gudang 100% ditanggung penjual. Silakan kirimkan barang lama dan masukkan nomor resi di bawah.')
          : 'Menunggu konfirmasi dan persetujuan dari tim admin toko.',
        isCompleted: isApproved,
      },
      {
        id: 3,
        date: isShipped ? (ret.returnTrackingNumber ? `Resi: ${ret.returnTrackingNumber}` : updatedDate) : '-',
        status: 'Barang Cacat Dikirim Balik',
        description: isShipped
          ? `Barang sedang dalam perjalanan menuju gudang kami${ret.returnCourier ? ` via ${ret.returnCourier}` : ''} (Nomor Resi: ${ret.returnTrackingNumber || '-'}). Ongkir ditanggung toko.`
          : 'Kemas produk lama dengan aman dan masukkan nomor resi pengiriman balik melalui form di bawah.',
        isCompleted: isShipped,
      },
      {
        id: 4,
        date: isReceived ? updatedDate : '-',
        status: 'Barang Diterima di Gudang',
        description: isReceived
          ? 'Paket retur telah sampai di gudang SOTOYS dan lolos verifikasi QC. Unit pengganti baru sedang dipersiapkan untuk dikirim.'
          : 'Menunggu paket sampai di gudang SOTOYS untuk verifikasi fisik.',
        isCompleted: isReceived,
      },
      {
        id: 5,
        date: isReplacementShipped ? (ret.replacementTrackingNumber ? `Resi: ${ret.replacementTrackingNumber}` : updatedDate) : '-',
        status: 'Unit Pengganti Baru Dikirim',
        description: isReplacementShipped
          ? `Unit pengganti baru telah dikirimkan via ${ret.replacementCourier || 'Ekspedisi'} (Nomor Resi: ${ret.replacementTrackingNumber || '-'}). Bebas ongkir ditanggung SOTOYS.`
          : 'Unit baru akan dikirimkan setelah barang lama sampai dan lolos verifikasi QC.',
        isCompleted: isReplacementShipped,
      },
      {
        id: 6,
        date: isCompleted ? updatedDate : '-',
        status: 'Penukaran Selesai',
        description: isCompleted
          ? 'Unit pengganti baru telah sampai di tangan pembeli dan proses penukaran selesai.'
          : 'Penukaran barang baru akan tuntas setelah paket sampai di tangan Anda.',
        isCompleted: isCompleted,
      },
    ];
  }

  // Solusi: REFUND 100% PENUH
  const isApproved = ['APPROVED', 'SHIPPED_BY_CUSTOMER', 'RECEIVED', 'REFUNDED'].includes(ret.status);
  const isShipped = ['SHIPPED_BY_CUSTOMER', 'RECEIVED', 'REFUNDED'].includes(ret.status);
  const isReceived = ['RECEIVED', 'REFUNDED'].includes(ret.status);
  const isRefunded = ret.status === 'REFUNDED';

  return [
    {
      id: 1,
      date: createdDate,
      status: 'Pengajuan Diterima',
      description: 'Permohonan pengembalian dana 100% penuh berhasil diajukan dan menunggu tinjauan admin.',
      isCompleted: true,
    },
    {
      id: 2,
      date: isApproved ? updatedDate : '-',
      status: 'Pengajuan Disetujui (Refund 100%)',
      description: isApproved
        ? (ret.adminNotes || 'Admin telah menyetujui pengembalian dana 100% penuh. Ongkos kirim pengembalian ditanggung penjual. Silakan kirimkan barang dan masukkan nomor resi di bawah.')
        : 'Menunggu konfirmasi dan persetujuan dari tim admin.',
      isCompleted: isApproved,
    },
    {
      id: 3,
      date: isShipped ? (ret.returnTrackingNumber ? `Resi: ${ret.returnTrackingNumber}` : updatedDate) : '-',
      status: 'Barang Dikirim Balik',
      description: isShipped
        ? `Barang sedang dalam perjalanan menuju gudang kami${ret.returnCourier ? ` via ${ret.returnCourier}` : ''} (Nomor Resi: ${ret.returnTrackingNumber || '-'}). Ongkir ditanggung toko.`
        : 'Kemas produk dengan aman dan masukkan nomor resi pengiriman melalui form di bawah.',
      isCompleted: isShipped,
    },
    {
      id: 4,
      date: isReceived ? updatedDate : '-',
      status: 'Barang Diterima di Gudang',
      description: isReceived
        ? 'Paket retur telah sampai di gudang SOTOYS dan lolos QC. Pencairan dana refund sedang diproses.'
        : 'Menunggu paket sampai di gudang SOTOYS untuk proses pengecekan fisik.',
      isCompleted: isReceived,
    },
    {
      id: 5,
      date: isRefunded ? updatedDate : '-',
      status: 'Dana Dikembalikan (Selesai)',
      description: isRefunded
        ? `Dana refund 100% penuh sebesar Rp${Number(ret.refundAmount).toLocaleString('id-ID')} (meliputi harga produk & ongkir awal) telah berhasil ditransfer ke rekening ${ret.bankName || ''} (${ret.bankAccountNumber || ''} a.n ${ret.bankAccountHolder || ''}).`
        : 'Pencairan dana refund 100% penuh ke rekening/e-wallet Anda.',
      isCompleted: isRefunded,
    },
  ];
}

export default function CustomerReturnTracking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const returnIdParam = searchParams.get('returnId');

  const { isAuthenticated } = useAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReturnStatus | 'ALL'>('ALL');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  // Return shipment form states
  const [inputCourier, setInputCourier] = useState(COURIER_OPTIONS[0]);
  const [inputTrackingNumber, setInputTrackingNumber] = useState('');
  const [submittingShipment, setSubmittingShipment] = useState(false);

  // Preview image modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns');
      if (res?.returns && Array.isArray(res.returns)) {
        setReturns(res.returns);
        if (returnIdParam) {
          const matched = res.returns.find((r: ReturnRequest) => r.id === returnIdParam);
          if (matched) {
            setSelectedReturn(matched);
            return;
          }
        }
        if (orderIdParam) {
          const matchedList = res.returns
            .filter((r: ReturnRequest) => r.orderId === orderIdParam)
            .sort((a: ReturnRequest, b: ReturnRequest) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          if (matchedList.length > 0) {
            setSelectedReturn(matchedList[0]);
            return;
          }
        }
        if (selectedReturn) {
          const updated = res.returns.find((r: ReturnRequest) => r.id === selectedReturn.id);
          if (updated) setSelectedReturn(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load user returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchReturns();
  }, [isAuthenticated, orderIdParam, returnIdParam]);

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    if (!inputTrackingNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Resi Belum Diisi',
        text: 'Harap masukkan nomor resi pengiriman paket retur.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    setSubmittingShipment(true);
    try {
      await api.patch(`/returns/${selectedReturn.id}/shipment`, {
        returnCourier: inputCourier,
        returnTrackingNumber: inputTrackingNumber.trim(),
      });

      Swal.fire({
        icon: 'success',
        title: 'Resi Tersimpan!',
        text: 'Informasi pengiriman barang retur Anda berhasil diperbarui.',
        confirmButtonColor: '#ea580c',
      });

      setInputTrackingNumber('');
      fetchReturns();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Resi',
        text: err.message || 'Terjadi kesalahan saat menyimpan nomor resi.',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setSubmittingShipment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusDisplay = (status: ReturnStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Menunggu Review', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} className="mr-1.5" /> };
      case 'APPROVED':
        return { label: 'Disetujui (Kirim Barang)', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={16} className="mr-1.5" /> };
      case 'SHIPPED_BY_CUSTOMER':
        return { label: 'Dalam Pengiriman Balik', color: 'bg-purple-100 text-purple-800', icon: <Truck size={16} className="mr-1.5" /> };
      case 'RECEIVED':
        return { label: 'Diterima Gudang (QC)', color: 'bg-indigo-100 text-indigo-800', icon: <Package size={16} className="mr-1.5" /> };
      case 'REPLACEMENT_SHIPPED':
        return { label: 'Unit Baru Dikirim', color: 'bg-teal-100 text-teal-800', icon: <Truck size={16} className="mr-1.5" /> };
      case 'REFUNDED':
        return { label: 'Dana Dikembalikan (Selesai)', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="mr-1.5" /> };
      case 'COMPLETED':
        return { label: 'Penukaran Selesai', color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle size={16} className="mr-1.5" /> };
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
    } else if (status.includes('Dikirim') || status.includes('Kurir')) {
      Icon = Truck;
      if (isCompleted) { colorClass = 'text-purple-500'; bgClass = 'bg-purple-100'; }
    } else if (status.includes('Gudang')) {
      Icon = Package;
      if (isCompleted) { colorClass = 'text-indigo-500'; bgClass = 'bg-indigo-100'; }
    } else if (status.includes('Dana') || status.includes('Selesai')) {
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
    const timeline = buildTimeline(selectedReturn);
    const primaryImg = selectedReturn.product?.images?.[0] || selectedReturn.proofImages?.[0] || '/assets/uploads/products/placeholder.svg';

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedReturn(null)}
            className="flex items-center text-gray-600 hover:text-orange-600 mb-6 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Daftar Pengembalian
          </button>

          {/* Return Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-orange-50/80 p-6 border-b border-orange-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={resolveProductImageUrl(primaryImg)}
                    alt={selectedReturn.productName || 'Produk'}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/uploads/products/placeholder.svg';
                    }}
                  />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedReturn.productName || 'Semua Produk'}</h2>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      ID Retur: <span className="font-semibold text-gray-800">#{selectedReturn.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Pesanan: <span className="font-semibold text-gray-800">#{selectedReturn.orderId.slice(0, 8).toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusDisplay.color}`}>
                    {statusDisplay.icon}
                    {statusDisplay.label}
                  </span>
                  {selectedReturn.refundAmount > 0 && (
                    <span className="text-sm font-bold text-orange-600">
                      Refund: {formatCurrency(selectedReturn.refundAmount)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Banner Skenario A: Kesalahan Penjual */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-950">
                <ShieldCheck size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black px-1.5 py-0.5 bg-emerald-700 text-white rounded text-[10px] uppercase tracking-wider">
                      Jaminan Toko SOTOYS - Skenario A
                    </span>
                    <span className="font-bold text-emerald-900">Kesalahan Pihak Toko / Cacat Pabrik</span>
                  </div>
                  <p className="mt-1 leading-relaxed">
                    ✨ <strong>Ongkos kirim pengembalian (balik ke gudang) 100% DITANGGUNG PENJUAL!</strong> Anda tidak menanggung biaya kirim retur.
                    Solusi: <strong>{(selectedReturn.solutionType || selectedReturn.preferredSolution) === 'REPLACEMENT' ? 'Ganti Barang Baru (Replacement)' : 'Refund Dana 100% Penuh'}</strong>.
                  </p>
                </div>
              </div>

              {/* Card Khusus Info Pengiriman Unit Pengganti Baru */}
              {(selectedReturn.status === 'REPLACEMENT_SHIPPED' || selectedReturn.status === 'COMPLETED') && (
                <div className="p-4 bg-teal-50 border-2 border-teal-300 rounded-2xl space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-teal-950">
                      <Truck size={20} className="text-teal-700" />
                      <h4 className="font-bold text-sm">Unit Pengganti Baru Sedang Dikirim!</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-200 text-teal-900">
                      {selectedReturn.status === 'COMPLETED' ? 'Penukaran Selesai' : 'Dalam Perjalanan'}
                    </span>
                  </div>
                  <p className="text-xs text-teal-800">
                    Toko telah mengirimkan unit baru pengganti ke alamat pengiriman Anda (bebas ongkir ditanggung toko).
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-teal-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block uppercase">
                        {selectedReturn.replacementCourier || 'Ekspedisi'}
                      </span>
                      <span className="font-mono font-bold text-gray-900 text-sm">
                        {selectedReturn.replacementTrackingNumber || '-'}
                      </span>
                      {selectedReturn.replacementShippedAt && (
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          Dikirim: {new Date(selectedReturn.replacementShippedAt).toLocaleString('id-ID')} WIB
                        </span>
                      )}
                    </div>
                    {selectedReturn.replacementTrackingNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedReturn.replacementTrackingNumber || '');
                          Swal.fire({
                            icon: 'success',
                            title: 'Nomor Resi Disalin!',
                            text: selectedReturn.replacementTrackingNumber,
                            timer: 1500,
                            showConfirmButton: false,
                          });
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center cursor-pointer shadow-sm"
                      >
                        <Copy size={13} className="mr-1" /> Salin Resi
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Alasan & Detail Pengajuan Pelanggan */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Alasan Pengembalian dari Pembeli</h3>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-sm">
                  <p className="font-bold text-gray-900">{selectedReturn.reason}</p>
                  {selectedReturn.details && (
                    <p className="text-gray-600 mt-1 whitespace-pre-line">{selectedReturn.details}</p>
                  )}
                </div>
              </div>

              {/* Alasan Penolakan dari Admin & Batas 1x Pengajuan Ulang jika REJECTED */}
              {selectedReturn.status === 'REJECTED' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-red-800">
                    <XCircle size={18} className="text-red-600 flex-shrink-0" />
                    <h4 className="font-bold text-sm">Alasan Penolakan oleh Tim Admin:</h4>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg border border-red-100 text-xs text-red-800 leading-relaxed font-medium">
                    {selectedReturn.adminNotes || 'Permohonan pengembalian tidak memenuhi syarat dan ketentuan garansi/retur produk toko SOTOYS.'}
                  </div>

                  {returns.filter(r => r.orderId === selectedReturn.orderId).length < 2 ? (
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-red-200/60">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase tracking-wider mb-1">
                          Kesempatan Terakhir (Maksimal 1x Pengajuan Ulang)
                        </span>
                        <p className="text-xs text-gray-700">
                          Anda memiliki 1 kesempatan untuk mengajukan permohonan ulang dengan melengkapi foto bukti dan keterangan kendala barang.
                        </p>
                      </div>
                      <Link
                        to={`/customer/return/${selectedReturn.orderId}`}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm flex items-center transition cursor-pointer self-start sm:self-auto"
                      >
                        <RotateCcw size={14} className="mr-1.5" /> Ajukan Ulang Sekarang
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-red-200/60">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-200 text-red-900 uppercase tracking-wider mb-1">
                        Keputusan Final
                      </span>
                      <p className="text-xs text-red-700">
                        Batas maksimal pengajuan pengembalian (maksimal 1x pengajuan ulang) untuk pesanan ini telah tercapai. Keputusan penolakan bersifat mutlak.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Rekening Refund & Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Rekening Tujuan Refund:</span>
                  <p className="font-bold text-gray-900 mt-0.5 text-sm">
                    {selectedReturn.bankName || 'Bank'} - {selectedReturn.bankAccountNumber || '-'}
                  </p>
                  <p className="text-gray-600">a.n {selectedReturn.bankAccountHolder || '-'}</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Kontak WhatsApp:</span>
                  <p className="font-bold text-gray-900 mt-0.5 text-sm">{selectedReturn.contactInfo}</p>
                  {selectedReturn.videoUrl && (
                    <a
                      href={selectedReturn.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-orange-600 hover:underline mt-1 font-semibold"
                    >
                      <ExternalLink size={12} className="mr-1" /> Tonton Video Unboxing
                    </a>
                  )}
                </div>
              </div>

              {/* Bukti Foto (Cloudinary) */}
              {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Foto Bukti Fisik ({selectedReturn.proofImages.length} Foto)
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedReturn.proofImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewImage(img)}
                        className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-orange-500 transition cursor-pointer"
                      >
                        <img
                          src={img}
                          alt={`Bukti ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Eye size={16} className="text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Input Resi jika Pengajuan Disetujui */}
              {selectedReturn.status === 'APPROVED' && (
                <div className="mt-4 p-5 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50">
                  <div className="flex items-center space-x-2 mb-2 text-orange-800">
                    <Truck size={20} className="text-orange-600" />
                    <h4 className="font-bold text-sm">Masukkan Nomor Resi Pengiriman Balik</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Kirimkan barang retur ke alamat toko kami, lalu masukkan nama ekspedisi dan nomor resi pengiriman di bawah ini.
                  </p>
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mb-4 font-medium">
                    🛡️ <strong>Ongkir retur balik 100% ditanggung Penjual</strong>. Anda dapat mengirimkan paket via ekspedisi rekanan toko atau simpan struk ongkir untuk konfirmasi ke admin.
                  </p>

                  <form onSubmit={handleUpdateShipment} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Ekspedisi</label>
                        <select
                          value={inputCourier}
                          onChange={(e) => setInputCourier(e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 text-sm bg-white"
                        >
                          {COURIER_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor Resi Pengiriman</label>
                        <input
                          type="text"
                          value={inputTrackingNumber}
                          onChange={(e) => setInputTrackingNumber(e.target.value)}
                          placeholder="Contoh: JNE1234567890"
                          required
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 text-sm bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingShipment}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition shadow-sm disabled:opacity-50"
                    >
                      {submittingShipment ? (
                        <>
                          <RefreshCcw size={14} className="animate-spin mr-1.5" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Send size={14} className="mr-1.5" />
                          Kirim Informasi Resi
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Status Resi jika Sudah Dikirim */}
              {selectedReturn.returnTrackingNumber && selectedReturn.status !== 'APPROVED' && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-purple-600 font-semibold">Resi Pengiriman Balik ({selectedReturn.returnCourier || 'Ekspedisi'}):</span>
                    <p className="font-mono font-bold text-purple-900 text-sm mt-0.5">{selectedReturn.returnTrackingNumber}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-200 text-purple-800 rounded-full font-bold text-[11px]">
                    Dalam Pengiriman
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <RefreshCcw size={20} className="mr-2 text-orange-600" />
                Proses & Tahapan Pengembalian
              </h3>
            </div>

            <div className="p-6 md:p-8">
              <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                {timeline.map((event) => {
                  const { Icon, colorClass, bgClass } = getTimelineIcon(event.status, event.isCompleted);

                  return (
                    <div key={event.id} className="relative pl-8">
                      <div className={`absolute -left-[21px] flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white z-10 ${bgClass}`}>
                        <Icon size={18} className={colorClass} />
                      </div>

                      <div className={`${!event.isCompleted ? 'opacity-40' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                          <h4 className={`text-sm sm:text-base font-bold ${event.isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {event.status}
                          </h4>
                          <span className="text-xs font-medium text-gray-500 mt-0.5 sm:mt-0 whitespace-nowrap">
                            {event.date}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Preview Gambar */}
          {previewImage && (
            <div
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setPreviewImage(null)}
            >
              <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
                <img
                  src={previewImage}
                  alt="Bukti Preview"
                  className="w-full max-h-[80vh] object-contain rounded-xl"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          )}
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
            Lacak Pengembalian Produk
          </h1>
        </div>

        <Link
          to="/customer/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ChevronLeft size={18} className="mr-1" /> Kembali ke Dashboard
        </Link>

        {/* Filter Tabs */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'SHIPPED_BY_CUSTOMER', 'RECEIVED', 'REFUNDED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors cursor-pointer ${
                filter === status
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'Semua' : getStatusDisplay(status).label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data pengembalian...</p>
          </div>
        ) : filteredReturns.length > 0 ? (
          <div className="space-y-4">
            {filteredReturns.map((returnItem) => {
              const statusDisplay = getStatusDisplay(returnItem.status);
              const timeline = buildTimeline(returnItem);
              const completedSteps = timeline.filter(t => t.isCompleted).length;
              const totalSteps = timeline.length;
              const progressPercent = Math.round((completedSteps / totalSteps) * 100);
              const thumbnail = returnItem.product?.images?.[0] || returnItem.proofImages?.[0] || '/assets/uploads/products/placeholder.svg';

              return (
                <div
                  key={returnItem.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedReturn(returnItem)}
                >
                  <div className="border-b border-gray-100 p-4 bg-gray-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center space-x-3">
                      <RefreshCcw className="text-gray-400" size={18} />
                      <div>
                        <span className="font-bold text-gray-900 font-mono text-sm">
                          #{returnItem.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 sm:ml-2">
                          {formatDate(returnItem.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                      {statusDisplay.label}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={resolveProductImageUrl(thumbnail)}
                        alt={returnItem.productName || 'Produk'}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/uploads/products/placeholder.svg';
                        }}
                      />
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
                          {returnItem.productName || 'Semua Produk Pesanan'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                          Pesanan: #{returnItem.orderId.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          Alasan: <span className="font-semibold">{returnItem.reason}</span>
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-500">Progres Retur</span>
                        <span className="text-xs font-bold text-orange-600">{completedSteps}/{totalSteps} tahap</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            returnItem.status === 'REJECTED' ? 'bg-red-500' :
                            returnItem.status === 'REFUNDED' ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-gray-50">
                      <div>
                        {returnItem.refundAmount > 0 && (
                          <p className="text-xs text-gray-600">
                            Estimasi Refund: <span className="font-bold text-orange-600 text-sm">{formatCurrency(returnItem.refundAmount)}</span>
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="ml-auto flex items-center px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye size={15} className="mr-1.5" />
                        Detail & Lacak
                        <ChevronRight size={15} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-600 mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Pengajuan Pengembalian</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Anda belum pernah mengajukan pengembalian produk, atau belum ada pesanan yang sesuai dengan filter yang dipilih.
            </p>
            <Link
              to="/customer/orders"
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition"
            >
              Buka Pesanan Saya
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
