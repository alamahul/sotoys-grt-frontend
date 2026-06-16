import React from 'react';
import AdminUserManagement from '../../components/AdminUserManagement';

export default function AdminSetting() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Pengaturan Toko & Pengguna</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Dasar Toko</h2>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
              <input type="text" defaultValue="SOTOYS GARUT" className="w-full border-gray-300 rounded-md border p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Toko</label>
              <select className="w-full border-gray-300 rounded-md border p-2 focus:ring-orange-500 focus:border-orange-500">
                <option>Buka (Menerima Pesanan)</option>
                <option>Tutup Sementara</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-md font-bold hover:bg-orange-700 transition">Simpan Pengaturan</button>
          </div>
        </div>

        <AdminUserManagement />
      </div>
    </div>
  );
}
