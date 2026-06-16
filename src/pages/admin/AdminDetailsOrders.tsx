import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Truck, Package, MapPin, CheckCircle, ChevronLeft, Save, User, Calendar, CreditCard } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

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
  items: [
    { id: '1', name: 'LEGO City Police Station', price: 350000, quantity: 1, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
    { id: '2', name: 'Hot Wheels 5-Car Pack', price: 80000, quantity: 1, image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
  ]
};

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'DELIVERED', label: 'Diterima' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

export default function AdminDetailsOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(MOCK_ORDER);
  const [editForm, setEditForm] = useState({
    status: MOCK_ORDER.status,
    trackingNumber: MOCK_ORDER.trackingNumber,
    courier: MOCK_ORDER.courier
  });
  const [isSaving, setIsSaving] = useState(false);

  // In a real app, you would fetch the order by ID here.

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setOrder(prev => ({
        ...prev,
        status: editForm.status,
        trackingNumber: editForm.trackingNumber,
        courier: editForm.courier
      }));
      setIsSaving(false);
      showToast('Perubahan pesanan berhasil disimpan.', 'success');
    }, 800);
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
