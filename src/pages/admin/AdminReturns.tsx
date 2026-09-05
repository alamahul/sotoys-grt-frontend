import React from 'react';
import AdminReturnManagement from '../../components/AdminReturnManagement';

export default function AdminReturns() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Pengembalian Produk (Retur)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tinjau permohonan retur dari pelanggan, lacak nomor resi pengiriman balik, verifikasi barang di gudang, dan proses pengembalian dana (refund).
          </p>
        </div>
        <AdminReturnManagement />
      </div>
    </div>
  );
}

