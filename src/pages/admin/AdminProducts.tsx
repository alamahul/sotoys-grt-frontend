import React from 'react';
import AdminProductManagement from '../../components/AdminProductManagement';

export default function AdminProducts() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Kelola Produk</h1>
        <AdminProductManagement />
      </div>
    </div>
  );
}
