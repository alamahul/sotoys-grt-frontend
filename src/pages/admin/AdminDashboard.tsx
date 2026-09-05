import React, { useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, ChevronDown, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminCloudinaryMetrics from '../../components/AdminCloudinaryMetrics';

const monthlyRevenue = [
  { name: 'Jan', revenue: 45000000 },
  { name: 'Feb', revenue: 52000000 },
  { name: 'Mar', revenue: 38000000 },
  { name: 'Apr', revenue: 65000000 },
  { name: 'Mei', revenue: 48000000 },
  { name: 'Jun', revenue: 71000000 },
  { name: 'Jul', revenue: 85000000 },
];

const salesTrends = [
  { name: 'Sen', sales: 120 },
  { name: 'Sel', sales: 156 },
  { name: 'Rab', sales: 98 },
  { name: 'Kam', sales: 145 },
  { name: 'Jum', sales: 210 },
  { name: 'Sab', sales: 315 },
  { name: 'Min', sales: 280 },
];

const popularCategories = [
  { name: 'Edukasi', value: 400 },
  { name: 'Robot', value: 300 },
  { name: 'Boneka', value: 300 },
  { name: 'Mainan Kayu', value: 200 },
  { name: 'Board Games', value: 150 },
];

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6'];

export default function AdminDashboard() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const exportToCSV = () => {
    setIsExportOpen(false);
    const headers = ['Bulan', 'Pendapatan (Rp)'];
    const rows = monthlyRevenue.map(data => [data.name, data.revenue.toString()]);

    let csvContent = 'data:text/csv;charset=utf-8,'
      + headers.join(',') + '\n'
      + rows.map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Laporan_Pendapatan_SOTOYS.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    setIsExportOpen(false);
    const doc = new jsPDF();
    doc.text('Laporan Pendapatan SOTOYS', 14, 15);

    autoTable(doc, {
      head: [['Bulan', 'Pendapatan (Rp)']],
      body: monthlyRevenue.map(data => [data.name, formatCurrency(data.revenue)]),
      startY: 20,
    });

    doc.save('Laporan_Pendapatan_SOTOYS.pdf');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    }
    return `Rp ${value}`;
  };

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Dashboard Admin</h1>
            <p className="mt-1 text-sm text-gray-500">Ringkasan performa toko SOTOYS bulan ini.</p>
          </div>
          <div className="mt-4 sm:mt-0 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition flex items-center shadow-sm"
            >
              Unduh Laporan
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={exportToCSV}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Format CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center border-t border-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Format PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-orange-100 p-3">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pendapatan</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">Rp 85Jt</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                        <span className="sr-only">Naik</span>
                        18%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-blue-100 p-3">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pesanan</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">1,324</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                        5%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-green-100 p-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pelanggan Aktif</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">8,542</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-purple-100 p-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Konversi Penjualan</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">3.8%</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        -1.2%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cloudinary Quota & Storage Details */}
        <AdminCloudinaryMetrics />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Monthly Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Pendapatan Bulanan</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatYAxis}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dx={-10}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Trends Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tren Penjualan Mingguan</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                  <RechartsTooltip
                    formatter={(value: number) => [value, 'Terjual']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Categories Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Kategori Produk Populer</h2>
            <div className="flex flex-col md:flex-row items-center justify-center">
              <div className="h-80 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={popularCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {popularCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => [value, 'Total Terjual']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 mt-8 md:mt-0 flex flex-col justify-center px-4 md:px-12">
                <ul className="space-y-4">
                  {popularCategories.map((category, index) => (
                    <li key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="text-gray-700 font-medium">{category.name}</span>
                      </div>
                      <span className="text-gray-900 font-bold">{category.value} <span className="text-gray-500 font-normal">terjual</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
