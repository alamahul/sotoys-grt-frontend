import React from 'react';
import { FileText, UserCheck, ShoppingBag, CreditCard, RefreshCcw, Shield, Scale, AlertTriangle } from 'lucide-react';

export default function Terms() {
  const lastUpdated = "16 Juni 2026";

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Syarat dan Ketentuan Layanan
          </h1>
          <p className="text-md text-gray-500">
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-600 leading-relaxed">
            Selamat datang di <strong>SOTOYS GARUT</strong>. Syarat dan Ketentuan ini mengatur akses dan penggunaan Anda terhadap situs web, aplikasi, dan layanan kami. Dengan mengakses atau melakukan transaksi di platform kami, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui seluruh isi Syarat dan Ketentuan ini. Jika Anda tidak setuju, Anda tidak diperkenankan untuk menggunakan layanan kami.
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-6">

          {/* 1. Akun Pengguna */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">1. Akun Pengguna</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Pengguna harus berusia minimal 18 tahun atau mengakses situs di bawah pengawasan orang tua/wali yang sah.</li>
              <li>Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan keamanan akun Anda.</li>
              <li>SOTOYS GARUT berhak membatalkan akun, menolak akses, atau membatalkan pesanan secara sepihak jika ditemukan indikasi kecurangan, pelanggaran hukum, atau pelanggaran terhadap syarat ini.</li>
              <li>Segala informasi data diri yang Anda berikan harus akurat, terkini, dan lengkap.</li>
            </ul>
          </div>

          {/* 2. Informasi Produk & Harga */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <ShoppingBag className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">2. Informasi Produk & Harga</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Kami senantiasa berusaha menampilkan deskripsi produk dan warna seakurat mungkin. Namun, perbedaan warna dapat terjadi akibat pencahayaan foto atau pengaturan resolusi layar perangkat Anda.</li>
              <li>Semua harga yang tercantum adalah dalam mata uang Rupiah (IDR) dan <strong>belum termasuk biaya pengiriman</strong> atau asuransi (kecuali dinyatakan lain).</li>
              <li>Harga produk dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Harga yang mengikat adalah harga pada saat Anda menyelesaikan checkout.</li>
            </ul>
          </div>

          {/* 3. Pemesanan & Pembayaran */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">3. Pemesanan & Pembayaran</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Pesanan dianggap sah apabila pembayaran telah dikonfirmasi dan diverifikasi oleh sistem keuangan kami.</li>
              <li>Batas waktu pembayaran adalah <strong>24 jam</strong> sejak pesanan dibuat. Jika melewati batas waktu tersebut, sistem akan membatalkan pesanan secara otomatis.</li>
              <li>SOTOYS GARUT tidak bertanggung jawab atas kesalahan transfer, jumlah nominal yang tidak sesuai, atau transfer ke nomor rekening yang salah.</li>
              <li>Kami berhak membatalkan pesanan apabila stok fisik barang tiba-tiba habis akibat kesalahan sistem sinkronisasi (dalam hal ini, dana akan di-refund 100%).</li>
            </ul>
          </div>

          {/* 4. Pengembalian & Penukaran (Refunds & Returns) */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <RefreshCcw className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">4. Kebijakan Pengembalian (Retur)</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Permohonan retur barang hanya berlaku maksimal <strong>2x24 jam</strong> sejak status resi pengiriman dinyatakan "Diterima".</li>
              <li>Syarat mutlak untuk komplain kekurangan/kerusakan produk adalah melampirkan <strong>Video Unboxing</strong> tanpa jeda dari paket utuh hingga terlihat kendalanya.</li>
              <li>Produk yang dikembalikan harus dalam kondisi aslinya (tag masih menempel, belum dirakit, dan tidak rusak karena kelalaian pembeli).</li>
              <li>Pengembalian dana (refund) akan diproses maksimal 3x24 jam kerja setelah barang retur kami terima dan kami periksa.</li>
            </ul>
          </div>

          {/* 5. Hak Kekayaan Intelektual */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">5. Hak Kekayaan Intelektual</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3">
              Seluruh konten yang terdapat di website SOTOYS GARUT, termasuk namun tidak terbatas pada teks, grafik, logo, gambar, klip audio, dan perangkat lunak, adalah properti milik SOTOYS GARUT atau penyedia konten kami dan dilindungi oleh undang-undang hak cipta Republik Indonesia.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Anda tidak diperkenankan untuk menyalin, mereproduksi, mendistribusikan, atau membuat karya turunan dari konten kami tanpa izin tertulis dari pihak SOTOYS GARUT.
            </p>
          </div>

          {/* 6. Penyangkalan & Batasan Tanggung Jawab */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">6. Batasan Tanggung Jawab</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              SOTOYS GARUT tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul akibat penggunaan atau ketidakmampuan menggunakan layanan kami. Segala risiko yang berkaitan dengan keterlambatan atau kerusakan yang disebabkan oleh pihak ketiga (jasa ekspedisi) tunduk pada kebijakan masing-masing pihak ketiga tersebut.
            </p>
          </div>

          {/* 7. Hukum yang Berlaku */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Scale className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">7. Hukum yang Berlaku & Sengketa</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Syarat dan Ketentuan ini tunduk pada dan ditafsirkan sesuai dengan hukum Republik Indonesia. Segala perselisihan yang timbul dari Syarat dan Ketentuan ini akan diselesaikan secara musyawarah mufakat. Apabila tidak tercapai kesepakatan, maka akan diselesaikan melalui yurisdiksi pengadilan negeri di wilayah hukum Garut.
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Dengan menggunakan platform SOTOYS GARUT, Anda dianggap telah membaca, mengerti, dan menyetujui seluruh Syarat dan Ketentuan di atas. SOTOYS GARUT berhak merubah ketentuan ini kapan saja.
          </p>
        </div>
      </div>
    </div>
  );
}