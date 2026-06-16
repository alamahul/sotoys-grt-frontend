import React from 'react';
import AdminDatabaseLogs from '../../components/AdminDatabaseLogs';

export default function AdminAnalysis() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Analisis & Laporan</h1>
        <AdminDatabaseLogs />
      </div>
    </div>
  );
}
