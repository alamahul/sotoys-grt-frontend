import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Package, Truck, CheckCircle, Edit3, Save, X, LayoutGrid, List, Eye, 
  FileText, Check, AlertCircle, Loader2, Image as ImageIcon, Search, 
  CheckSquare, Square, RotateCw, Layers, ShieldCheck, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import api, { getImageUrl } from '../utils/api';

interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  courier?: string;
  payment?: any;
  paymentData?: any;
}

const mockOrders: Order[] = [
  { id: 'ORD-12345', customerName: 'Budi Santoso', date: '2023-10-25', total: 450000, status: 'PROCESSING', courier: 'J&T Express' },
  { id: 'ORD-12346', customerName: 'Siti Aminah', date: '2023-10-24', total: 275000, status: 'SHIPPED', trackingNumber: 'JT987654321', courier: 'JNE Reguler' },
  { id: 'ORD-12347', customerName: 'Arif Setiawan', date: '2023-10-20', total: 1200000, status: 'DELIVERED', trackingNumber: 'SICEPAT123T', courier: 'SiCepat BEST' },
  { id: 'ORD-12348', customerName: 'Dewi Lestari', date: '2023-10-26', total: 850000, status: 'PENDING_PAYMENT' },
  { id: 'ORD-12349', customerName: 'Hendra Wijaya', date: '2023-10-27', total: 320000, status: 'PAID', courier: 'J&T Express' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'PAID', label: 'Sudah Dibayar' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'DELIVERED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_verification' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const { showToast } = useToast();

  const fetchOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.get('/admin/orders');
      if (res?.orders && Array.isArray(res.orders) && res.orders.length > 0) {
        const mapped: Order[] = res.orders.map((o: any) => ({
          id: o.id,
          customerName: o.user?.name || o.user?.email || 'Pelanggan',
          date: new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          total: typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : (Number(o.totalAmount) || 0),
          status: o.status,
          trackingNumber: o.trackingNumber || o.shipment?.trackingNumber,
          courier: o.courier || o.shipment?.courier,
          payment: o.payment,
          paymentData: o.payment?.paymentData,
        }));
        setOrders(mapped);
      }
    } catch (err: any) {
      console.warn('Backend /admin/orders fetch failed, using mock:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-yellow-100 text-yellow-800">MENUNGGU PEMBAYARAN</span>;
      case 'PAID': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-cyan-100 text-cyan-800">SUDAH DIBAYAR</span>;
      case 'PROCESSING': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-blue-100 text-blue-800">DIPROSES</span>;
      case 'SHIPPED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-purple-100 text-purple-800">DIKIRIM</span>;
      case 'DELIVERED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-green-100 text-green-800">SELESAI</span>;
      case 'CANCELLED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-gray-100 text-gray-800">DIBATALKAN</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Kanban Board Implementation
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (!orderId) return;

    let extraData: { courier?: string; trackingNumber?: string } = {};

    if (newStatus === 'SHIPPED') {
      const { value: formValues } = await Swal.fire({
        title: 'Kirim Pesanan',
        html: `
          <div class="text-left text-sm space-y-3">
            <div>
              <label class="font-bold text-gray-700 block mb-1">Pilih / Nama Kurir:</label>
              <input id="swal-courier" class="swal2-input !mt-0 !w-full" placeholder="Contoh: J&T Express / JNE" />
            </div>
            <div>
              <label class="font-bold text-gray-700 block mb-1">Nomor Resi (Tracking Number):</label>
              <input id="swal-tracking" class="swal2-input !mt-0 !w-full" placeholder="Contoh: JT123456789ID" />
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Kirim & Simpan Resi',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ea580c',
        preConfirm: () => {
          const courier = (document.getElementById('swal-courier') as HTMLInputElement)?.value;
          const trackingNumber = (document.getElementById('swal-tracking') as HTMLInputElement)?.value;
          return { courier, trackingNumber };
        }
      });

      if (!formValues) return;
      extraData = formValues;
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus as Order['status'], ...extraData } : order
    ));
    showToast(`Status pesanan ${orderId.slice(0, 8)}... diperbarui ke ${newStatus}`, 'success');

    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus, ...extraData });
    } catch (err: any) {
      console.warn('Could not sync status with backend:', err.message);
    }
  };

  // Selection & Bulk Action Handlers
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const clearSelection = () => {
    setSelectedOrderIds([]);
  };

  const handleBulkUpdateStatus = async (targetStatus: string) => {
    if (selectedOrderIds.length === 0) return;

    const targetLabel = STATUS_OPTIONS.find(s => s.value === targetStatus)?.label || targetStatus;

    const result = await Swal.fire({
      title: 'Konfirmasi Aksi Masal',
      text: `Apakah Anda yakin ingin mengubah status ${selectedOrderIds.length} pesanan menjadi "${targetLabel}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Ya, Ubah (${selectedOrderIds.length})`,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ea580c',
    });

    if (!result.isConfirmed) return;

    setIsBulkUpdating(true);
    try {
      await api.patch('/admin/orders/bulk-status', {
        orderIds: selectedOrderIds,
        status: targetStatus,
      }).catch(async () => {
        // Fallback to concurrent single updates if bulk endpoint is not yet mounted
        await Promise.all(
          selectedOrderIds.map(id => api.patch(`/admin/orders/${id}/status`, { status: targetStatus }))
        );
      });

      setOrders(prev => prev.map(order => 
        selectedOrderIds.includes(order.id) ? { ...order, status: targetStatus as Order['status'] } : order
      ));
      showToast(`Status ${selectedOrderIds.length} pesanan berhasil diperbarui ke "${targetLabel}"!`, 'success');
      setSelectedOrderIds([]);
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui status pesanan', 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const needsVerificationCount = orders.filter(o => 
    o.paymentData?.status === 'PENDING_VERIFICATION' || (o.status === 'PENDING_PAYMENT' && o.paymentData?.proofImage)
  ).length;

  const handleVerifyPayment = async (orderId: string) => {
    setIsVerifying(true);
    try {
      await api.post(`/orders/admin/orders/${orderId}/verify-payment`, {});
      showToast('Pembayaran berhasil diverifikasi & disetujui!', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: 'PAID',
        paymentData: { ...(o.paymentData || {}), status: 'VERIFIED' }
      } : o));
      setSelectedProofOrder(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal memverifikasi pembayaran', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Tolak Pembayaran?',
      input: 'text',
      inputLabel: 'Masukkan alasan penolakan untuk pelanggan:',
      inputPlaceholder: 'Contoh: Dana mutasi bank tidak ditemukan / Nominal kurang',
      showCancelButton: true,
      confirmButtonText: 'Tolak Pembayaran',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!value) {
          return 'Alasan penolakan wajib diisi!';
        }
      }
    });

    if (!reason) return;

    setIsVerifying(true);
    try {
      await api.post(`/orders/admin/orders/${orderId}/reject-payment`, { reason });
      showToast('Pembayaran telah ditolak.', 'info');
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: 'PENDING_PAYMENT',
        paymentData: { ...(o.paymentData || {}), status: 'REJECTED', rejectionReason: reason }
      } : o));
      setSelectedProofOrder(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak pembayaran', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Unified Filter & Search Logic
  const filteredOrders = orders.filter(o => {
    // 1. Status Filter
    if (statusFilter === 'needs_verification') {
      const isNeedsVerification = o.paymentData?.status === 'PENDING_VERIFICATION' || (o.status === 'PENDING_PAYMENT' && o.paymentData?.proofImage);
      if (!isNeedsVerification) return false;
    } else if (statusFilter !== 'all') {
      if (o.status !== statusFilter) return false;
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = o.id.toLowerCase().includes(q);
      const matchCustomer = o.customerName.toLowerCase().includes(q);
      const matchCourier = (o.courier || '').toLowerCase().includes(q);
      const matchTracking = (o.trackingNumber || '').toLowerCase().includes(q);
      if (!matchId && !matchCustomer && !matchCourier && !matchTracking) return false;
    }

    return true;
  });

  const renderKanbanBoard = () => {
    const columns = [
      { id: 'PENDING_PAYMENT', title: 'Menunggu Pembayaran', color: 'bg-yellow-50/70 border-yellow-200', countBadge: 'bg-yellow-100 text-yellow-800' },
      { id: 'PAID', title: 'Sudah Dibayar', color: 'bg-cyan-50/70 border-cyan-200', countBadge: 'bg-cyan-100 text-cyan-800' },
      { id: 'PROCESSING', title: 'Diproses', color: 'bg-blue-50/70 border-blue-200', countBadge: 'bg-blue-100 text-blue-800' },
      { id: 'SHIPPED', title: 'Dikirim', color: 'bg-purple-50/70 border-purple-200', countBadge: 'bg-purple-100 text-purple-800' },
      { id: 'DELIVERED', title: 'Selesai', color: 'bg-green-50/70 border-green-200', countBadge: 'bg-green-100 text-green-800' },
      { id: 'CANCELLED', title: 'Dibatalkan', color: 'bg-gray-50 border-gray-200', countBadge: 'bg-gray-200 text-gray-700' },
    ];

    return (
      <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[520px]">
        {columns.map(col => {
          const colOrders = filteredOrders.filter(o => o.status === col.id);
          const totalInCol = orders.filter(o => o.status === col.id).length;

          return (
            <div 
              key={col.id} 
              className={`flex-1 min-w-[290px] max-w-[340px] rounded-xl border ${col.color} p-4 flex flex-col`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/5">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  <span>{col.title}</span>
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold shadow-2xs ${col.countBadge}`}>
                  {colOrders.length}{colOrders.length !== totalInCol ? ` / ${totalInCol}` : ''}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                {colOrders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-300/80 rounded-lg">
                    Tidak ada pesanan
                  </div>
                ) : (
                  colOrders.map(order => {
                    const isSelected = selectedOrderIds.includes(order.id);
                    const hasProof = order.paymentData?.proofImage && order.status === 'PENDING_PAYMENT';

                    return (
                      <div 
                        key={order.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        className={`bg-white p-3.5 rounded-xl shadow-xs border cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${
                          isSelected
                            ? 'border-orange-500 ring-2 ring-orange-400 bg-orange-50/20'
                            : hasProof
                            ? 'border-amber-300 ring-1 ring-amber-300'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectOrder(order.id);
                              }}
                              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300 cursor-pointer"
                              title="Tandai pesanan ini"
                            />
                            <span className="text-xs font-bold text-gray-700 font-mono">
                              {order.id.startsWith('ORD-') ? order.id : `ORD-${order.id.slice(0, 8).toUpperCase()}`}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            {hasProof && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedProofOrder(order); }}
                                className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded flex items-center shadow-2xs"
                                title="Verifikasi Bukti Transfer"
                              >
                                <FileText size={12} className="mr-1" /> Bukti
                              </button>
                            )}
                            <Link 
                              to={`/admin/orders/${order.id}`} 
                              className="text-orange-500 hover:text-orange-600 p-1 hover:bg-orange-50 rounded transition-colors"
                              title="Detail Pesanan"
                            >
                              <Eye size={16} />
                            </Link>
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{order.customerName}</h4>

                        {hasProof && (
                          <div className="my-2 py-1 px-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-center justify-between">
                            <span>Bukti Struk Siap Diverifikasi</span>
                            <span className="text-[10px] text-gray-500">{order.paymentData?.senderBank || 'BCA'}</span>
                          </div>
                        )}

                        {order.courier && (
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mb-2">
                            <Truck size={12} className="text-gray-400" />
                            <span className="font-medium text-gray-700">{order.courier}</span>
                            {order.trackingNumber && (
                              <span className="text-gray-400">({order.trackingNumber})</span>
                            )}
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                          <span className="text-gray-400">{order.date}</span>
                          <span className="font-extrabold text-orange-600 text-sm">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTable = () => {
    const isAllSelected = filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 whitespace-nowrap">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300 cursor-pointer"
                  title={isAllSelected ? "Batalkan pilih semua" : "Pilih semua di tabel"}
                />
              </th>
              <th className="p-4">ID Pesanan</th>
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Kurir & Resi</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-500">
                  <Package size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-semibold text-gray-700">Tidak ada pesanan yang sesuai filter atau pencarian.</p>
                  <p className="text-xs text-gray-400 mt-1">Coba ubah kata kunci pencarian atau tab filter status di atas.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrderIds.includes(order.id);
                const hasProof = order.paymentData?.proofImage && order.status === 'PENDING_PAYMENT';

                return (
                  <tr 
                    key={order.id} 
                    className={`transition-colors ${isSelected ? 'bg-orange-50/70 hover:bg-orange-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300 cursor-pointer"
                        title="Tandai pesanan ini"
                      />
                    </td>
                    <td className="p-4 font-bold text-gray-900 font-mono text-xs">
                      {order.id.startsWith('ORD-') ? order.id : `ORD-${order.id.slice(0, 8).toUpperCase()}`}
                    </td>
                    <td className="p-4 font-medium text-gray-700">{order.customerName}</td>
                    <td className="p-4 text-gray-600 text-xs">{order.date}</td>
                    <td className="p-4 font-bold text-gray-900">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(order.status)}
                        {hasProof && (
                          <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            <AlertCircle size={11} className="mr-1" /> PERLU VERIFIKASI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {order.courier ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-gray-800">{order.courier}</span>
                          <span className="text-gray-500 font-mono">{order.trackingNumber || '-'}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center space-x-2">
                        {hasProof && (
                          <button
                            onClick={() => setSelectedProofOrder(order)}
                            className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg flex items-center transition shadow-2xs"
                          >
                            <FileText size={13} className="mr-1" /> Verifikasi
                          </button>
                        )}
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          className="p-1.5 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                          title="Detail Pesanan"
                        >
                          <Eye size={18} /> <span className="ml-1 text-xs font-semibold">Detail</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      {/* Header & View Switcher */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>Manajemen Pesanan</span>
            {isLoading && <Loader2 size={16} className="animate-spin text-orange-600" />}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Lacak dan kelola pesanan melalui mode Kanban interaktif atau Tabel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            disabled={isLoading}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition shadow-2xs"
            title="Muat Ulang Pesanan"
          >
            <RotateCw size={16} className={isLoading ? 'animate-spin text-orange-600' : ''} />
          </button>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={16} className="mr-2" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${
                viewMode === 'table' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={16} className="mr-2" /> Tabel
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-gray-50/60">
        <div className="relative flex-1 max-w-lg">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID pesanan, nama pelanggan, kurir, resi..."
            className="w-full pl-10 pr-9 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              title="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 font-medium self-end sm:self-auto">
          Menampilkan <b className="text-gray-900 font-bold">{filteredOrders.length}</b> dari {orders.length} pesanan
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Toolbar */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-orange-600 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md border-y border-orange-700 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-white text-orange-600 px-3 py-0.5 rounded-full text-xs font-black shadow-xs">
              {selectedOrderIds.length} Terpilih
            </span>
            <span className="text-xs font-semibold hidden sm:inline text-orange-50">
              Aksi masal untuk pesanan terpilih:
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-white underline hover:text-orange-100 font-medium"
            >
              {selectedOrderIds.length === filteredOrders.length ? 'Batal Pilih Semua' : `Pilih Semua (${filteredOrders.length})`}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-orange-100 hidden md:inline">Ubah Status ke:</span>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleBulkUpdateStatus(opt.value)}
                disabled={isBulkUpdating}
                className="px-2.5 py-1.5 bg-white/20 hover:bg-white text-white hover:text-orange-700 text-xs font-bold rounded-lg transition-all disabled:opacity-50 shadow-2xs"
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={clearSelection}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white ml-2 transition"
              title="Batalkan Pilihan"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-6 pt-4 border-b border-gray-100 flex flex-wrap gap-2 bg-white">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === 'all' 
              ? 'bg-orange-600 text-white shadow-sm' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semua ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter('needs_verification')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${
            statusFilter === 'needs_verification'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <AlertCircle size={13} className="mr-1" />
          Perlu Verifikasi ({needsVerificationCount})
        </button>
        {STATUS_OPTIONS.map(opt => {
          const count = orders.filter(o => o.status === opt.value).length;
          const isActive = statusFilter === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>
      
      <div className="p-6">
        {viewMode === 'kanban' ? renderKanbanBoard() : renderTable()}
      </div>

      {/* Verification Modal for Admin */}
      {selectedProofOrder && (
        <div 
          className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedProofOrder(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-amber-50/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-600 text-white rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Verifikasi Pembayaran Manual</h3>
                  <p className="text-xs text-gray-500">ID: {selectedProofOrder.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProofOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Order summary */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500">Pelanggan:</span>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedProofOrder.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Total Tagihan:</span>
                  <p className="font-extrabold text-orange-600 text-base mt-0.5">{formatCurrency(selectedProofOrder.total)}</p>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="text-xs space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama Pengirim Rekening:</span>
                  <span className="font-bold text-gray-900">{selectedProofOrder.paymentData?.senderName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Pengirim:</span>
                  <span className="font-bold text-gray-900">{selectedProofOrder.paymentData?.senderBank || 'BCA'}</span>
                </div>
                {selectedProofOrder.paymentData?.notes && (
                  <div className="flex justify-between pt-1 border-t border-blue-100">
                    <span className="text-gray-600">Catatan Pelanggan:</span>
                    <span className="font-medium text-gray-800 italic">{selectedProofOrder.paymentData.notes}</span>
                  </div>
                )}
                {selectedProofOrder.paymentData?.uploadedAt && (
                  <div className="flex justify-between pt-1 border-t border-blue-100">
                    <span className="text-gray-600">Waktu Upload:</span>
                    <span className="text-gray-700">{new Date(selectedProofOrder.paymentData.uploadedAt).toLocaleString('id-ID')} WIB</span>
                  </div>
                )}
              </div>

              {/* Receipt Image */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Foto Bukti Struk Transfer:
                </label>
                {selectedProofOrder.paymentData?.proofImage ? (
                  <div className="bg-gray-900 rounded-xl p-2 flex items-center justify-center border border-gray-300 overflow-hidden">
                    <img 
                      src={getImageUrl(selectedProofOrder.paymentData.proofImage)} 
                      alt="Struk Transfer" 
                      className="max-h-64 object-contain rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(getImageUrl(selectedProofOrder.paymentData.proofImage), '_blank')}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-400">
                    Foto bukti transfer belum tersedia
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1 text-center">Klik gambar untuk membuka ukuran penuh</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleRejectPayment(selectedProofOrder.id)}
                disabled={isVerifying}
                className="w-1/2 py-2.5 px-4 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition text-xs flex items-center justify-center disabled:opacity-50"
              >
                <X size={16} className="mr-1" /> Tolak Pembayaran
              </button>
              <button
                type="button"
                onClick={() => handleVerifyPayment(selectedProofOrder.id)}
                disabled={isVerifying}
                className="w-1/2 py-2.5 px-4 bg-emerald-600 text-white rounded-xl font-extrabold hover:bg-emerald-700 transition shadow-md text-xs flex items-center justify-center disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-1" /> Memproses...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1" /> Terima & Setujui
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
