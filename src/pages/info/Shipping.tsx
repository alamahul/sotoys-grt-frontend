import React from 'react';
import { Clock, Truck, Package, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

export default function Shipping() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Informasi & Kebijakan Pengiriman
          </h1>
          <p className="text-lg text-gray-600">
            SOTOYS GARUT berkomitmen untuk memastikan mainan pesanan Anda sampai dengan cepat, aman, dan dalam kondisi terbaik.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">

          {/* Jadwal Pengiriman */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Jadwal Operasional & Pengiriman</h2>
            </div>
            <ul className="list-none space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span><strong>Senin - Sabtu:</strong> Pesanan yang pembayarannya dikonfirmasi sebelum pukul <strong>15.00 WIB</strong> akan diproses dan dikirim pada hari yang sama.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Pesanan yang masuk setelah pukul 15.00 WIB akan diproses pada hari kerja berikutnya.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span><strong>Minggu & Hari Libur Nasional:</strong> Tidak ada pengiriman. Pesanan akan diproses pada hari kerja berikutnya.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span><strong>Pengiriman Instan:</strong> Batas maksimal request pickup adalah pukul 16.00 WIB (menyesuaikan ketentuan dari Gojek/Grab).</span>
              </li>
            </ul>
          </div>

          {/* Kurir yang Tersedia */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Truck className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Mitra Ekspedisi & Kurir</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Kami menjangkau pengiriman ke seluruh Indonesia. Berikut adalah opsi pengiriman yang dapat Anda pilih saat checkout:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Reguler & Kargo</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>- JNE (Reguler, YES, JTR/Kargo)</li>
                  <li>- J&T Express</li>
                  <li>- SiCepat (Reguler, HALU, BEST, GOKIL)</li>
                  <li>- AnterAja</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Instan & Same Day</h3>
                <p className="text-sm text-gray-600 mb-2">Khusus area Garut Kota dan sekitarnya:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>- GoSend (Instant)</li>
                  <li>- GrabExpress (Instant)</li>
                  <li>- Kurir Toko SOTOYS (Area tertentu)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Standar Pengemasan */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Standar Pengemasan (Packing)</h2>
            </div>
            <p className="text-gray-600 mb-3">
              Mengingat produk kami adalah mainan yang membutuhkan perlakuan khusus, kami menerapkan standar packing yang ketat:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Semua barang akan dilapisi dengan <strong>Bubble Wrap tebal</strong> (gratis).</li>
              <li>Untuk mainan berukuran besar atau rentan pecah, akan dilapisi dengan kardus pelindung tambahan.</li>
              <li>Dilengkapi dengan stiker "Fragile / Jangan Dibanting" pada kemasan luar.</li>
            </ul>
          </div>

          {/* Asuransi & Lacak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <ShieldCheck className="h-6 w-6 text-orange-500 mr-3" />
                <h2 className="text-lg font-bold text-gray-900">Asuransi Pengiriman</h2>
              </div>
              <p className="text-sm text-gray-600">
                Kami sangat menyarankan Anda untuk mengaktifkan <strong>Asuransi Pengiriman</strong> saat checkout, terutama untuk pembelian di atas Rp 500.000. Kerusakan atau kehilangan paket yang disebabkan oleh pihak ekspedisi di luar tanggung jawab SOTOYS GARUT jika tidak menggunakan asuransi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <MapPin className="h-6 w-6 text-orange-500 mr-3" />
                <h2 className="text-lg font-bold text-gray-900">Lacak Pesanan</h2>
              </div>
              <p className="text-sm text-gray-600">
                Nomor Resi akan diinput secara otomatis ke sistem maksimal <strong>1x24 jam</strong> setelah paket diserahkan ke kurir. Anda dapat melacak status pengiriman langsung melalui menu "Pesanan Saya" atau memasukkan resi di website masing-masing ekspedisi.
              </p>
            </div>
          </div>

          {/* Kendala & Komplain */}
          <div className="bg-orange-50 p-6 sm:p-8 rounded-2xl border border-orange-200">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Kendala & Komplain Pengiriman</h2>
            </div>
            <div className="text-gray-700 space-y-3">
              <p>
                Jika paket Anda mengalami keterlambatan yang tidak wajar atau tiba dalam keadaan rusak, silakan hubungi Customer Service kami. Kami akan membantu proses eskalasi ke pihak ekspedisi.
              </p>
              <p className="font-semibold text-red-600">
                PENTING: Komplain kekurangan/kerusakan barang WAJIB menyertakan Video Unboxing tanpa jeda, mulai dari paket belum dibuka hingga terlihat jelas kondisi barang.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}