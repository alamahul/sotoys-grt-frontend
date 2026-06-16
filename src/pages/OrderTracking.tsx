import React, { useState } from 'react';
import { Search, MapPin, Truck, CheckCircle, Package, AlertCircle } from 'lucide-react';

interface TrackingEvent {
  id: number;
  date: string;
  status: string;
  location: string;
  isCompleted: boolean;
}

const mockTrackingHistory: TrackingEvent[] = [
  { id: 1, date: '25 Okt 2023, 14:30', status: 'Pesanan Diterima', location: 'Gudang SOTOYS, Jakarta', isCompleted: true },
  { id: 2, date: '25 Okt 2023, 16:00', status: 'Pesanan Diproses & Dikemas', location: 'Gudang SOTOYS, Jakarta', isCompleted: true },
  { id: 3, date: '26 Okt 2023, 08:15', status: 'Paket diserahkan ke kurir (J&T Express)', location: 'Hub Jakarta Selatan', isCompleted: true },
  { id: 4, date: '26 Okt 2023, 19:40', status: 'Paket sedang dalam perjalanan ke kota tujuan', location: 'Fasilitas Transit, Bandung', isCompleted: true },
  { id: 5, date: '27 Okt 2023, 07:12', status: 'Paket dibawa oleh kurir menuju alamat penerima', location: 'Kantor Pengantaran, Bandung', isCompleted: false },
  { id: 6, date: '-', status: 'Paket Berhasil Dikirim', location: 'Alamat Tujuan', isCompleted: false },
];

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsLoading(true);
    setError('');
    setTrackingResult(null);

    // Simulate API Call
    setTimeout(() => {
      if (orderId.toUpperCase().startsWith('ORD-') || orderId.toUpperCase().startsWith('TRK-')) {
        setTrackingResult({
          orderId: orderId.toUpperCase(),
          status: 'Sedang Diperjalanan',
          courier: 'J&T Express',
          recipient: 'Budi Santoso',
          history: [...mockTrackingHistory].reverse()
        });
      } else {
        setError('Nomor resi atau ID Pesanan tidak ditemukan. Pastikan nomor yang Anda masukkan benar.');
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col items-center">

        <div className="w-full text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 flex items-center justify-center">
            <Truck className="mr-3 text-orange-600" size={36} />
            Lacak Pesanan Anda
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Masukkan Nomor Resi atau ID Pesanan Anda untuk melihat status pengiriman secara real-time.
          </p>
        </div>

        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Contoh: ORD-12345 atau TRK-98765"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 bg-white shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !orderId.trim()}
              className="px-8 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0 flex justify-center items-center h-[50px] w-full sm:w-auto"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Lacak Sekarang'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start max-w-2xl mx-auto">
              <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {trackingResult && (
          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-orange-50 p-6 border-b border-orange-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-orange-800 mb-1">ID Pesanan / Resi</h2>
                  <p className="text-xl font-bold text-gray-900">{trackingResult.orderId}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <h2 className="text-sm font-semibold text-orange-800 mb-1">Status Pengiriman</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {trackingResult.status}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-orange-800 mb-1">Kurir</h2>
                    <p className="font-semibold text-gray-900 text-sm">{trackingResult.courier}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8">Riwayat Perjalanan Paket</h3>

              <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                {trackingResult.history.map((event: TrackingEvent, index: number) => {
                  const isLast = index === trackingResult.history.length - 1;
                  const isCurrent = !event.isCompleted && (index === 0 || trackingResult.history[index - 1].isCompleted);

                  let Icon = Package;
                  let colorClass = 'text-gray-400';
                  let bgClass = 'bg-gray-200';

                  if (event.status.includes('Diterima') || event.status.includes('Berhasil')) {
                    Icon = CheckCircle;
                    if (event.isCompleted) { colorClass = 'text-green-500'; bgClass = 'bg-green-100'; }
                  } else if (event.status.includes('Diproses')) {
                    Icon = Package;
                    if (event.isCompleted) { colorClass = 'text-blue-500'; bgClass = 'bg-blue-100'; }
                  } else if (event.status.includes('perjalanan') || event.status.includes('kurir')) {
                    Icon = Truck;
                    if (event.isCompleted) { colorClass = 'text-orange-500'; bgClass = 'bg-orange-100'; }
                  }

                  if (!event.isCompleted) {
                    colorClass = 'text-gray-300';
                    bgClass = 'bg-gray-100';
                  }

                  return (
                    <div key={event.id} className="relative pl-8">
                      <div className={`absolute -left-[21px] flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white z-10 ${bgClass}`}>
                        <Icon size={18} className={colorClass} />
                      </div>

                      <div className={`${!event.isCompleted ? 'opacity-50' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                          <h4 className={`text-base font-bold ${event.isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {event.status}
                          </h4>
                          <span className="text-sm font-medium text-gray-500 mt-1 sm:mt-0 whitespace-nowrap">
                            {event.date}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin size={16} className="mr-1.5 flex-shrink-0" />
                          <p>{event.location}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
