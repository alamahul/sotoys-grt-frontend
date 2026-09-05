import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Truck, Package, MapPin, CheckCircle, ChevronLeft, Save, User, Calendar, CreditCard, FileText, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Swal from 'sweetalert2';
import api, { getImageUrl } from '../../utils/api';

// Mock data (same as in AdminOrderManagement)
const MOCK_ORDER = {
  id: 'ORD-12345',
  customerName: 'Budi Santoso',
  email: 'budi.santoso@example.com',
  phone: '081234567890',
  date: '25 Oktober 2023, 14:30 WIB',
  total: 450000,
  subtotal: 430000,
  shippingCost: 20000,
  status: 'PROCESSING',
  paymentMethod: 'BCA Virtual Account',
  shippingAddress: 'Jl. Merdeka No. 45, Kebayoran Baru, Jakarta Selatan, 12110',
  trackingNumber: '',
  courier: 'J&T Express',
  paymentData: null as any,
  items: [
    { id: '1', name: 'LEGO City Police Station', price: 350000, quantity: 1, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
    { id: '2', name: 'Hot Wheels 5-Car Pack', price: 80000, quantity: 1, image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
  ]
};

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'PAID', label: 'Sudah Dibayar' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'DELIVERED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

export default function AdminDetailsOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(MOCK_ORDER);
  const [editForm, setEditForm] = useState({
    status: MOCK_ORDER.status,
    trackingNumber: MOCK_ORDER.trackingNumber,
    courier: MOCK_ORDER.courier
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/orders/${id}`)
      .then(res => {
        if (res?.order) {
          const o = res.order;
          const total = typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : (Number(o.totalAmount) || 0);
          const shippingCost = typeof o.shippingCost === 'string' ? parseFloat(o.shippingCost) : (Number(o.shippingCost) || 0);
          const mapped = {
            id: o.id,
            customerName: o.user?.name || 'Pelanggan',
            email: o.user?.email || '-',
            phone: o.user?.phone || '-',
            date: new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            total,
            subtotal: total - shippingCost,
            shippingCost,
            status: o.status,
            paymentMethod: o.paymentMethod || o.payment?.paymentType || 'Transfer Bank',
            paymentData: o.payment?.paymentData || null,
            shippingAddress: o.shippingAddress || o.address?.details || '-',
            trackingNumber: o.trackingNumber || o.shipment?.trackingNumber || '',
            courier: o.courier || o.shipment?.courier || '-',
            items: (o.items || []).map((it: any) => ({
              id: it.id,
              name: it.product?.name || 'Produk',
              price: typeof it.unitPrice === 'string' ? parseFloat(it.unitPrice) : (Number(it.unitPrice) || 0),
              quantity: it.quantity || 1,
              image: it.product?.images?.[0] || '/assets/uploads/products/placeholder.svg',
            })),
          };
          setOrder(mapped);
          setEditForm({
            status: mapped.status,
            trackingNumber: mapped.trackingNumber,
            courier: mapped.courier,
          });
        }
      })
      .catch(err => {
        console.warn('Backend order fetch failed, using fallback:', err);
      });
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch(`/admin/orders/${id}/status`, { 
        status: editForm.status,
        trackingNumber: editForm.trackingNumber,
        courier: editForm.courier
      });
      setOrder(prev => ({
        ...prev,
        status: editForm.status,
        trackingNumber: editForm.trackingNumber,
        courier: editForm.courier
      }));
      showToast('Perubahan pesanan berhasil disimpan.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan perubahan pesanan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await api.post(`/orders/admin/orders/${id}/verify-payment`, {});
      showToast('Pembayaran berhasil diverifikasi & pesanan berstatus Diproses!', 'success');
      setOrder((prev: any) => ({
        ...prev,
        status: 'PROCESSING',
        paymentData: { ...(prev.paymentData || {}), status: 'VERIFIED' }
      }));
      setEditForm((prev: any) => ({ ...prev, status: 'PROCESSING' }));
    } catch (err: any) {
      showToast(err.message || 'Gagal memverifikasi pembayaran', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Tolak Bukti Pembayaran?',
      input: 'text',
      inputLabel: 'Masukkan alasan penolakan untuk pelanggan:',
      inputPlaceholder: 'Contoh: Mutasi bank tidak ditemukan / Nominal kurang',
      showCancelButton: true,
      confirmButtonText: 'Tolak Pembayaran',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!value) return 'Alasan penolakan wajib diisi!';
      }
    });

    if (!reason) return;

    setIsVerifying(true);
    try {
      await api.post(`/orders/admin/orders/${id}/reject-payment`, { reason });
      showToast('Pembayaran telah ditolak.', 'info');
      setOrder((prev: any) => ({
        ...prev,
        status: 'PENDING_PAYMENT',
        paymentData: { ...(prev.paymentData || {}), status: 'REJECTED', rejectionReason: reason }
      }));
      setEditForm((prev: any) => ({ ...prev, status: 'PENDING_PAYMENT' }));
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak pembayaran', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/orders')} className="mr-4 p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-orange-600 hover:border-orange-200 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center">
                Pesanan {id || order.id}
              </h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <Calendar size={14} className="mr-1" /> {order.date}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Cetak Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-4 mb-4">
                <Package className="mr-2 text-gray-400" size={20} /> Item Pesanan
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)} x {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-2 text-gray-600">
                  <span>Subtotal produk</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4 text-gray-600">
                  <span>Biaya Pengiriman</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-100">
                  <span>Total Keseluruhan</span>
                  <span className="text-orange-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-4 mb-4">
                <User className="mr-2 text-gray-400" size={20} /> Informasi Pelanggan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nama Pelanggan</p>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{order.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nomor Telepon</p>
                  <p className="font-medium text-gray-900">{order.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Metode Pembayaran</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <CreditCard size={16} className="mr-1 text-gray-400" /> {order.paymentMethod}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <MapPin size={16} className="mr-1" /> Alamat Pengiriman
                  </p>
                  <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Update Status Form */}
          <div className="space-y-6">
            {/* Payment Proof Card if exists */}
            {order.paymentData?.proofImage && (
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden p-6">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
                  <h2 className="text-base font-bold text-gray-900 flex items-center">
                    <FileText className="mr-2 text-amber-600" size={18} /> Bukti Pembayaran Manual
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    order.paymentData?.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                    order.paymentData?.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {order.paymentData?.status === 'VERIFIED' ? 'DIVERIFIKASI' :
                     order.paymentData?.status === 'REJECTED' ? 'DITOLAK' : 'PERLU TINDAKAN'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-gray-950 p-2 rounded-xl flex justify-center border border-gray-200">
                    <img
                      src={getImageUrl(order.paymentData.proofImage)}
                      alt="Struk Transfer"
                      className="max-h-48 object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(getImageUrl(order.paymentData.proofImage), '_blank')}
                      title="Klik untuk membuka ukuran penuh"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">Klik gambar untuk melihat resolusi penuh</p>

                  <div className="bg-gray-50 p-3 rounded-lg space-y-1.5 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama Pengirim:</span>
                      <span className="font-bold text-gray-800">{order.paymentData.senderName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank Pengirim:</span>
                      <span className="font-bold text-gray-800">{order.paymentData.senderBank || 'BCA'}</span>
                    </div>
                    {order.paymentData.notes && (
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="text-gray-500">Catatan:</span>
                        <span className="font-medium text-gray-700 italic">{order.paymentData.notes}</span>
                      </div>
                    )}
                    {order.paymentData.uploadedAt && (
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="text-gray-500">Waktu Kirim:</span>
                        <span className="text-gray-700">{new Date(order.paymentData.uploadedAt).toLocaleString('id-ID')} WIB</span>
                      </div>
                    )}
                    {order.paymentData.rejectionReason && (
                      <div className="pt-1 border-t border-gray-200 text-red-600">
                        <span className="font-bold">Alasan Ditolak:</span> {order.paymentData.rejectionReason}
                      </div>
                    )}
                  </div>

                  {order.status === 'PENDING_PAYMENT' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isVerifying}
                        className="w-1/2 py-2 px-3 border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 text-xs flex items-center justify-center disabled:opacity-50"
                      >
                        <X size={14} className="mr-1" /> Tolak
                      </button>
                      <button
                        type="button"
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="w-1/2 py-2 px-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 text-xs shadow-sm flex items-center justify-center disabled:opacity-50"
                      >
                        {isVerifying ? 'Memproses...' : <><Check size={14} className="mr-1" /> Terima (Lunas)</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-4 mb-4">
                <CheckCircle className="mr-2 text-gray-400" size={20} /> Update Status
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Pesanan</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Truck size={16} className="mr-1 text-gray-400" /> Kurir Pengiriman
                  </label>
                  <input
                    type="text"
                    value={editForm.courier}
                    onChange={(e) => setEditForm({ ...editForm, courier: e.target.value })}
                    placeholder="Contoh: JNE Reguler"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Resi</label>
                  <input
                    type="text"
                    value={editForm.trackingNumber}
                    onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                    placeholder="Masukkan No. Resi"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex justify-center items-center py-3 px-4 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors disabled:opacity-70"
                  >
                    {isSaving ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <><Save size={18} className="mr-2" /> Simpan Perubahan</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
