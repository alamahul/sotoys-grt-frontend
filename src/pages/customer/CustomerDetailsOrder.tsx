import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, Package, MapPin, CheckCircle, ChevronLeft } from 'lucide-react';

export default function CustomerDetailsOrder() {
  const { id } = useParams();

  // Mock data for order details
  const orderData = {
    id: id || 'ORD-12345',
    date: '16 Jun 2026, 14:30 WIB',
    status: 'Sedang Dikirim',
    total: 350000,
    items: [
      { id: '1', name: 'Robot Mainan Canggih', qty: 1, price: 250000, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
      { id: '2', name: 'Puzzle Kayu Edukatif', qty: 2, price: 50000, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
    ],
    shipping: {
      courier: 'J&T Express',
      trackingNo: 'TRK-987654321',
      cost: 25000,
      address: {
        name: 'Budi Santoso',
        phone: '081234567890',
        detail: 'Jl. Merdeka No. 123, RT 01 RW 02, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40111'
      }
    },
    payment: {
      method: 'Transfer Bank (BCA)',
      status: 'Lunas'
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/customer/orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Kembali ke Daftar Pesanan
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Detail Pesanan</h1>
            <p className="text-sm text-gray-500 mt-1">{orderData.id} • {orderData.date}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
              {orderData.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center">
                  <Package className="mr-2 text-gray-400" size={20} /> Produk yang Dipesan
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-6">
                  {orderData.items.map((item, idx) => (
                    <li key={idx} className="flex flex-col sm:flex-row">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-0 mr-4">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.qty} x {formatCurrency(item.price)}</p>
                        </div>
                        <div className="mt-2 text-orange-600 font-bold">
                          {formatCurrency(item.qty * item.price)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tracking (Mini version) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900 flex items-center">
                  <Truck className="mr-2 text-gray-400" size={20} /> Informasi Pengiriman
                </h2>
                <Link to="/tracking" className="text-sm font-bold text-orange-600 hover:text-orange-700">Lacak Penuh</Link>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                  <div>
                    <p className="text-sm text-gray-500">Kurir</p>
                    <p className="font-bold text-gray-900">{orderData.shipping.courier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">No. Resi</p>
                    <p className="font-bold text-gray-900 tracking-wide">{orderData.shipping.trackingNo}</p>
                  </div>
                </div>
                <div className="relative border-l-2 border-orange-200 ml-3 pl-6 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-orange-100 text-orange-600 rounded-full p-1 border-2 border-white">
                      <Truck size={14} />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Paket sedang dalam perjalanan</p>
                    <p className="text-xs text-gray-500">26 Okt 2023, 19:40 WIB</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-green-100 text-green-600 rounded-full p-1 border-2 border-white">
                      <CheckCircle size={14} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 opacity-70">Paket diserahkan ke kurir</p>
                    <p className="text-xs text-gray-500">26 Okt 2023, 08:15 WIB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center">
                  <MapPin className="mr-2 text-gray-400" size={20} /> Alamat Pengiriman
                </h2>
              </div>
              <div className="p-6 text-sm">
                <p className="font-bold text-gray-900">{orderData.shipping.address.name}</p>
                <p className="text-gray-600 mb-2">{orderData.shipping.address.phone}</p>
                <p className="text-gray-600 leading-relaxed">{orderData.shipping.address.detail}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Ringkasan Pembayaran</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm mb-4 border-b border-gray-100 pb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Metode Pembayaran</span>
                    <span className="font-medium text-gray-900">{orderData.payment.method}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Status Pembayaran</span>
                    <span className="font-bold text-green-600">{orderData.payment.status}</span>
                  </div>
                </div>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Produk</span>
                    <span className="font-medium text-gray-900">{formatCurrency(350000)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span className="font-medium text-gray-900">{formatCurrency(orderData.shipping.cost)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total Belanja</span>
                  <span className="text-lg font-extrabold text-orange-600">{formatCurrency(orderData.total + orderData.shipping.cost)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
