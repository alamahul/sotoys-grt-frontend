import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RefreshCcw, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CustomerReturnProduct() {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock data order untuk keperluan demo frontend
  const mockOrders = [
    {
      id: 'ORD-12345',
      date: '16 Jun 2026, 14:30 WIB',
      status: 'Selesai',
      total: 350000,
      items: [
        { id: '1', name: 'Robot Mainan Canggih', qty: 1, price: 250000, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
        { id: '2', name: 'Puzzle Kayu Edukatif', qty: 2, price: 50000, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
      ]
    }
  ];

  // Mencari order berdasarkan ID di URL, jika tidak ada pakai data pertama sebagai fallback demo
  const order = mockOrders.find(o => o.id === orderId) || mockOrders[0];

  // State Manajemen Form
  const [orderNumber] = useState(orderId || order.id);
  const [reason, setReason] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle ketika user memilih file video lewat tombol/klik
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        Swal.fire({
          icon: 'error',
          title: 'Format File Salah',
          text: 'Format file harus berupa video!',
          confirmButtonColor: '#ea580c'
        });
        return;
      }
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle ketika user melakukan drag & drop file video
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        Swal.fire({
          icon: 'error',
          title: 'Format File Salah',
          text: 'Format file harus berupa video!',
          confirmButtonColor: '#ea580c'
        });
        return;
      }
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Simulasi submit Form (Frontend Only Demo dengan SweetAlert)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi tambahan di sisi frontend jika lolos dari HTML5 required
    if (!orderNumber || !reason || !contactInfo || !videoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Harap lengkapi semua data dan unggah video unboxing.',
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    setLoading(true);

    // Tampilkan Loading SweetAlert
    Swal.fire({
      title: 'Memproses Permohonan',
      text: 'Mohon tunggu sebentar...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Simulasi delay kirim data ke server selama 1.5 detik
    setTimeout(() => {
      setLoading(false);

      // Tutup loading dan tampilkan alert sukses berkala (Timer)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dikirim!',
        text: 'Permohonan retur produk Anda berhasil dikirim. Menuju halaman pesanan...',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false
      }).then(() => {
        // Reset form setelah animasi sukses selesai
        setReason('');
        setContactInfo('');
        setVideoFile(null);
        setPreviewUrl('');

        // Redirect ke halaman daftar pesanan
        navigate('/customer/returns');
      });

    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-orange-50 rounded-full">
            <RefreshCcw className={`h-8 w-8 text-orange-600 ${loading ? 'animate-spin' : ''}`} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-center text-gray-900 mb-2">
          Ajukan Pengembalian Produk
        </h1>


        <p className="text-sm text-gray-500 text-center mb-6">
          Silakan isi formulir di bawah ini untuk memproses retur barang Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Nomor Order (Read-Only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor Order</label>
            <input
              type="text"
              value={orderNumber}
              readOnly
              className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 shadow-sm text-gray-600 focus:border-orange-500 focus:ring-orange-500 p-2.5 cursor-not-allowed"
            />
          </div>

          {/* Input Alasan Pengembalian */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Alasan Pengembalian</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Barang cacat produksi, ukuran tidak sesuai, atau salah kirim barang..."
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5"
            />
          </div>

          {/* Input Kontak */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kontak yang Dapat Dihubungi (WhatsApp / Email)</label>
            <input
              type="text"
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
              placeholder="Contoh: 081234567890 atau email@kamu.com"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5"
            />
          </div>

          {/* Upload Video Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Video Bukti / Unboxing (Wajib)</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${previewUrl ? 'border-orange-500 bg-orange-50/20' : 'border-gray-300 hover:border-orange-500 bg-gray-50'
                }`}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="space-y-2">
                  <video src={previewUrl} controls className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm" />
                  <p className="text-xs text-orange-600 font-medium">Klik atau drop kembali untuk mengganti video</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-gray-600 font-medium">Tarik & lepas video di sini, atau <span className="text-orange-600 underline">cari file</span></p>
                  <p className="text-xs text-gray-400">Mendukung format .mp4, .mov, atau .avi</p>
                </div>
              )}
              <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses Permohonan...
              </span>
            ) : 'Kirim Permohonan Retur'}
          </button>

          <Link to="/customer/orders" className="w-70 mb-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center text-sm hover:bg-orange-500 hover:text-white">
            <ChevronLeft size={16} className="mr-1" /> Kembali ke Pesanan
          </Link>
        </form>
      </div>
    </div>
  );
}