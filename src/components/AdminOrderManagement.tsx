import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Package, Truck, CheckCircle, Edit3, Save, X, LayoutGrid, List, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  courier?: string;
}

const mockOrders: Order[] = [
  { id: 'ORD-12345', customerName: 'Budi Santoso', date: '2023-10-25', total: 450000, status: 'PROCESSING', courier: 'J&T Express' },
  { id: 'ORD-12346', customerName: 'Siti Aminah', date: '2023-10-24', total: 275000, status: 'SHIPPED', trackingNumber: 'JT987654321', courier: 'JNE Reguler' },
  { id: 'ORD-12347', customerName: 'Arif Setiawan', date: '2023-10-20', total: 1200000, status: 'DELIVERED', trackingNumber: 'SICEPAT123T', courier: 'SiCepat BEST' },
  { id: 'ORD-12348', customerName: 'Dewi Lestari', date: '2023-10-26', total: 850000, status: 'PENDING_PAYMENT' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'DELIVERED', label: 'Diterima' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const { showToast } = useToast();

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
      case 'PROCESSING': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-blue-100 text-blue-800">DIPROSES</span>;
      case 'SHIPPED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-purple-100 text-purple-800">DIKIRIM</span>;
      case 'DELIVERED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-green-100 text-green-800">SELESAI</span>;
      case 'CANCELLED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-gray-100 text-gray-800">DIBATALKAN</span>;
      default: return null;
    }
  };

  // Kanban Board Implementation
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ));
      showToast(`Status pesanan ${orderId} diperbarui`, 'success');
    }
  };

  const renderKanbanBoard = () => {
    const columns = [
      { id: 'PENDING_PAYMENT', title: 'Menunggu', color: 'bg-yellow-50 border-yellow-200' },
      { id: 'PROCESSING', title: 'Diproses', color: 'bg-blue-50 border-blue-200' },
      { id: 'SHIPPED', title: 'Dikirim', color: 'bg-purple-50 border-purple-200' },
      { id: 'DELIVERED', title: 'Selesai', color: 'bg-green-50 border-green-200' },
    ];

    return (
      <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
        {columns.map(col => (
          <div 
            key={col.id} 
            className={`flex-1 min-w-[280px] rounded-xl border ${col.color} p-4 flex flex-col`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
              {col.title}
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                {orders.filter(o => o.status === col.id).length}
              </span>
            </h3>
            <div className="flex flex-col gap-3 flex-1">
              {orders.filter(o => o.status === col.id).map(order => (
                <div 
                  key={order.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">{order.id}</span>
                    <Link to={`/admin/orders/${order.id}`} className="text-orange-500 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={16} />
                    </Link>
                  </div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">{order.customerName}</h4>
                  <div className="mt-3 flex justify-between items-end">
                    <div className="text-xs text-gray-500">
                      {order.date}
                    </div>
                    <div className="font-bold text-orange-600 text-sm">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-sm whitespace-nowrap">
            <th className="p-4 font-semibold text-gray-700">ID Pesanan</th>
            <th className="p-4 font-semibold text-gray-700">Pelanggan</th>
            <th className="p-4 font-semibold text-gray-700">Tanggal</th>
            <th className="p-4 font-semibold text-gray-700">Total</th>
            <th className="p-4 font-semibold text-gray-700">Status</th>
            <th className="p-4 font-semibold text-gray-700">Kurir & Resi</th>
            <th className="p-4 font-semibold text-gray-700 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {orders.map(order => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-bold text-gray-900">{order.id}</td>
              <td className="p-4 font-medium text-gray-700">{order.customerName}</td>
              <td className="p-4 text-gray-600">{order.date}</td>
              <td className="p-4 font-medium text-gray-900">{formatCurrency(order.total)}</td>
              <td className="p-4">{getStatusBadge(order.status)}</td>
              <td className="p-4 text-gray-600">
                {order.courier ? (
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{order.courier}</span>
                    <span className="text-xs text-gray-500">{order.trackingNumber || '-'}</span>
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td className="p-4 text-right">
                <Link 
                  to={`/admin/orders/${order.id}`}
                  className="p-1.5 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                  title="Detail Pesanan"
                >
                  <Eye size={18} /> <span className="ml-1 text-xs font-semibold">Detail</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen Pesanan</h2>
          <p className="text-sm text-gray-500 mt-1">Lacak dan kelola pesanan melalui mode Kanban yang interaktif atau Tabel.</p>
        </div>
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
      
      <div className="p-6">
        {viewMode === 'kanban' ? renderKanbanBoard() : renderTable()}
      </div>
    </div>
  );
}
