import React from 'react';
import { RefreshCcw, ClipboardCheck, Video, Ban, Truck, Wallet, MessageCircle, AlertTriangle } from 'lucide-react';

export default function Returns() {
  const lastUpdated = "16 Juni 2026";
  const [orderNumber, setOrderNumber] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [contactInfo, setContactInfo] = React.useState('');
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !reason || !contactInfo || !videoFile) {
      setMessage('Please fill all fields and upload a video.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('orderNumber', orderNumber);
      formData.append('reason', reason);
      formData.append('contactInfo', contactInfo);
      formData.append('video', videoFile);
      const response = await fetch('https://mockapi.example.com/returns', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setMessage('Permohonan retur berhasil dikirim.');
      } else {
        setMessage('Terjadi kesalahan, coba lagi.');
      }
    } catch (err) {
      setMessage('Network error, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
            <RefreshCcw className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Kebijakan Pengembalian & Penukaran
          </h1>
          <p className="text-md text-gray-500">
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-600 leading-relaxed">
            Kepuasan Anda berbelanja di <strong>SOTOYS GARUT</strong> adalah prioritas utama kami. Kami memahami bahwa terkadang barang yang Anda terima mungkin mengalami cacat pabrik atau tidak sesuai dengan pesanan. Oleh karena itu, kami menyediakan fasilitas pengembalian (retur) dengan syarat dan ketentuan yang jelas demi kenyamanan bersama.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">

          {/* 1. Syarat Utama Pengembalian */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <ClipboardCheck className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">1. Syarat Umum Pengembalian</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Klaim pengembalian hanya dapat dilakukan maksimal <strong>2x24 jam</strong> terhitung sejak barang dinyatakan "Diterima" berdasarkan sistem pelacakan resi ekspedisi.</li>
              <li>Produk harus dalam kondisi asli, belum pernah dimainkan, dirakit, atau digunakan.</li>
              <li>Segel pabrik (jika ada), label harga, dan tag produk masih menempel utuh.</li>
              <li>Kemasan kardus atau box mainan tidak boleh rusak, robek, atau dicoret-coret oleh pembeli.</li>
            </ul>
          </div>

          {/* 2. Ketentuan Wajib: Video Unboxing */}
          <div className="bg-orange-50 p-6 sm:p-8 rounded-2xl border border-orange-200">
            <div className="flex items-center mb-4">
              <Video className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">2. Kewajiban Video Unboxing</h2>
            </div>
            <p className="text-gray-700 mb-3">
              Untuk menghindari kesalahpahaman dan mempermudah proses investigasi, <strong>Video Unboxing adalah syarat mutlak</strong> untuk semua komplain kekurangan barang, barang rusak, atau salah kirim. Ketentuan video yang sah:
            </p>
            <ul className="list-decimal pl-5 text-gray-700 space-y-2 font-medium">
              <li>Video direkam sebelum paket dibuka sama sekali (perlihatkan label resi pengiriman dengan jelas).</li>
              <li>Proses membuka paket hingga barang dikeluarkan dan diperiksa harus terekam dalam satu video utuh <strong>tanpa jeda (no pause)</strong> dan <strong>tanpa potongan (no edit)</strong>.</li>
              <li>Perlihatkan dengan jelas bagian produk yang rusak atau cacat ke arah kamera.</li>
            </ul>
            <p className="text-sm text-red-600 mt-4 flex items-start mt-3">
              <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
              Komplain tanpa menyertakan video unboxing yang memenuhi kriteria di atas berhak kami tolak.
            </p>
          </div>

          {/* 3. Barang yang Tidak Bisa Diretur */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Ban className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">3. Pengecualian Retur</h2>
            </div>
            <p className="text-gray-600 mb-3">Pengembalian tidak berlaku untuk kondisi berikut:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Kerusakan yang disebabkan oleh kelalaian pembeli (jatuh, terbakar, salah perakitan, dsb).</li>
              <li>Produk yang dibeli pada kategori <em>Clearance Sale</em> atau diskon cuci gudang (kecuali dinyatakan lain).</li>
              <li>Ketidakcocokan selera (misal: "Saya kurang suka warnanya aslinya", "Ternyata ukurannya kurang besar"). Harap perhatikan deskripsi dan spesifikasi produk sebelum membeli.</li>
            </ul>
          </div>

          {/* 4. Alur Proses Pengembalian */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <RefreshCcw className="h-6 w-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">4. Alur Proses Retur</h2>
            </div>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mr-4">1</div>
                <div>
                  <h3 className="font-bold text-gray-900">Hubungi Customer Service</h3>
                  <p className="text-sm text-gray-600 mt-1">Chat CS kami menyertakan Nomor Pesanan, deskripsi masalah, dan lampirkan Video Unboxing maksimal 2x24 jam setelah barang diterima.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mr-4">2</div>
                <div>
                  <h3 className="font-bold text-gray-900">Evaluasi & Persetujuan</h3>
                  <p className="text-sm text-gray-600 mt-1">Tim kami akan mengevaluasi laporan Anda maksimal 1x24 jam kerja. Jika disetujui, kami akan memberikan alamat gudang retur.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mr-4">3</div>
                <div>
                  <h3 className="font-bold text-gray-900">Kirim Kembali Barang</h3>
                  <p className="text-sm text-gray-600 mt-1">Kemas barang dengan aman (gunakan bubble wrap tambahan) dan kirim ke alamat kami. Resi pengiriman retur harus diinfokan ke CS maksimal 2x24 jam setelah disetujui.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mr-4">4</div>
                <div>
                  <h3 className="font-bold text-gray-900">Pengecekan & Penyelesaian</h3>
                  <p className="text-sm text-gray-600 mt-1">Setelah barang tiba di gudang, kami akan melakukan pengecekan fisik (maksimal 2x24 jam kerja). Jika sesuai, proses penukaran barang baru atau refund akan segera diproses.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Biaya Pengiriman & Pengembalian Dana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <Truck className="h-6 w-6 text-orange-500 mr-3" />
                <h2 className="text-lg font-bold text-gray-900">Ongkos Kirim Retur</h2>
              </div>
              <p className="text-sm text-gray-600">
                Jika kesalahan berasal dari pihak SOTOYS GARUT (salah kirim barang / cacat pabrik), seluruh biaya ongkos kirim retur dan pengiriman ulang akan <strong>ditanggung sepenuhnya oleh kami</strong>.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <Wallet className="h-6 w-6 text-orange-500 mr-3" />
                <h2 className="text-lg font-bold text-gray-900">Pengembalian Dana (Refund)</h2>
              </div>
              <p className="text-sm text-gray-600">
                Refund akan diproses ke rekening awal yang Anda gunakan, atau dalam bentuk Store Credit (Voucher). Proses refund bank memakan waktu <strong>1-3 hari kerja</strong> sejak status retur disetujui.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}