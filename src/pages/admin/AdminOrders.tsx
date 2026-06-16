import React from 'react';
import AdminOrderManagement from '../../components/AdminOrderManagement';

export default function AdminOrders() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Kelola Pesanan</h1>
        <AdminOrderManagement />
      </div>
    </div>
  );
}
