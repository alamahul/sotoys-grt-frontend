import React from 'react';
import { ShieldCheck, Database, Eye, Share2, Lock, UserCog, Cookie, Mail } from 'lucide-react';

export default function Privacy() {
  const lastUpdated = "16 Juni 2026";

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-md text-gray-500">
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-600 leading-relaxed">
            SOTOYS GARUT sangat menghargai privasi dan keamanan data Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan mengungkapkan informasi pribadi Anda saat Anda menggunakan situs web dan layanan kami. Dengan mengakses dan berbelanja di platform kami, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">

          {/* 1. Pengumpulan Data */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">1. Informasi yang Kami Kumpulkan</h2>
            </div>
            <p className="text-gray-600 mb-3">Kami mengumpulkan beberapa jenis informasi untuk memberikan dan meningkatkan layanan kami:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li><strong>Data Pribadi:</strong> Nama lengkap, alamat email, nomor telepon, dan alamat pengiriman/penagihan yang Anda berikan saat mendaftar atau checkout.</li>
              <li><strong>Data Transaksi:</strong> Rincian pesanan, riwayat pembelian, dan metode pembayaran yang digunakan (kami tidak menyimpan nomor kartu kredit/debit secara penuh).</li>
              <li><strong>Data Teknis & Perangkat:</strong> Alamat IP, jenis browser, zona waktu, sistem operasi, dan informasi log standar saat Anda mengakses situs kami.</li>
            </ul>
          </div>

          {/* 2. Penggunaan Data */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">2. Penggunaan Informasi</h2>
            </div>
            <p className="text-gray-600 mb-3">Informasi yang kami kumpulkan digunakan untuk tujuan berikut:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Memproses pesanan, memverifikasi pembayaran, dan mengatur pengiriman produk.</li>
              <li>Mengirimkan pembaruan status pesanan, faktur, dan notifikasi terkait transaksi.</li>
              <li>Menyediakan layanan dukungan pelanggan (Customer Service) dan menangani keluhan atau proses retur.</li>
              <li>Meningkatkan pengalaman pengguna, tata letak website, dan penawaran produk kami.</li>
              <li>Mencegah aktivitas penipuan, penyalahgunaan, atau pelanggaran keamanan.</li>
            </ul>
          </div>

          {/* 3. Berbagi Informasi */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Share2 className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">3. Pembagian & Pengungkapan Data</h2>
            </div>
            <p className="text-gray-600 mb-3">
              <strong className="text-gray-900">Kami tidak akan pernah menjual, menyewakan, atau memperdagangkan informasi pribadi Anda kepada pihak ketiga.</strong> Namun, kami perlu membagikan data Anda kepada pihak-pihak berikut semata-mata untuk operasional:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li><strong>Mitra Logistik/Ekspedisi:</strong> (JNE, J&T, SiCepat, Gojek, dll.) untuk keperluan pengiriman pesanan Anda.</li>
              <li><strong>Payment Gateway:</strong> Penyedia layanan pembayaran pihak ketiga untuk memproses transaksi Anda secara aman.</li>
              <li><strong>Kewajiban Hukum:</strong> Kami dapat mengungkapkan informasi Anda jika diwajibkan oleh hukum, panggilan pengadilan, atau perintah pengadilan pemerintah Republik Indonesia.</li>
            </ul>
          </div>

          {/* 4. Keamanan Data */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">4. Keamanan Informasi</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Kami menerapkan standar keamanan industri untuk melindungi data Anda dari akses, pengubahan, pengungkapan, atau perusakan yang tidak sah. Data sensitif seperti kata sandi dienkripsi, dan semua komunikasi data antara browser Anda dan server kami dilindungi menggunakan teknologi <em>Secure Socket Layer</em> (SSL). Namun, perlu diingat bahwa tidak ada metode transmisi di internet yang 100% aman.
            </p>
          </div>

          {/* 5. Hak Pengguna */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <UserCog className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">5. Hak & Kendali Anda</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Anda berhak melihat, memperbarui, atau memperbaiki informasi pribadi Anda kapan saja melalui dashboard akun Anda.</li>
              <li>Anda dapat memilih untuk berhenti berlangganan <em>(unsubscribe)</em> dari email promosi kami melalui tautan yang tersedia di bagian bawah setiap email.</li>
              <li>Anda dapat meminta penghapusan akun dan data pribadi Anda dari sistem kami dengan menghubungi layanan pelanggan.</li>
            </ul>
          </div>

          {/* 6. Kebijakan Cookies */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Cookie className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">6. Penggunaan Cookies</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Situs web kami menggunakan "cookies" (berkas teks kecil yang disimpan di perangkat Anda) untuk mengenali Anda saat Anda kembali, menyimpan isi keranjang belanja Anda, dan menganalisis lalu lintas situs untuk meningkatkan performa website. Anda dapat mengatur browser Anda untuk menolak cookies, namun beberapa fitur situs web kami mungkin tidak berfungsi dengan maksimal.
            </p>
          </div>

        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-orange-50 p-6 sm:p-8 rounded-2xl border border-orange-100 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
            <Mail className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Punya Pertanyaan Terkait Privasi?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Jika Anda memiliki pertanyaan, kekhawatiran, atau keluhan mengenai Kebijakan Privasi ini atau cara kami menangani data Anda, jangan ragu untuk menghubungi Tim Dukungan kami.
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition shadow-sm">
            Hubungi Privacy Officer Kami
          </button>
        </div>
      </div>
    </div>
  );
}