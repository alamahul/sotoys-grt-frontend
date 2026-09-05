import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RefreshCcw, RotateCcw, ChevronLeft, Upload, X, Check, AlertCircle, ShieldCheck, Package, CreditCard, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../utils/api';
import { resolveProductImageUrl } from '../../utils/image';

interface OrderItemInfo {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string;
}

interface OrderInfo {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingCost?: number;
  items: OrderItemInfo[];
}

const REASON_PRESETS = [
  'Cacat Pabrik / Rusak',
  'Salah Kirim Barang / Varian',
  'Barang Berbeda Dari Foto / Deskripsi',
  'Kemasan Rusak & Komponen Hilang',
  'Aksesoris Tidak Lengkap',
  'Lainnya',
];

const BANK_PRESETS = [
  'BCA',
  'Mandiri',
  'BNI',
  'BRI',
  'BSI',
  'Bank Jago',
  'GoPay',
  'OVO',
  'DANA',
  'ShopeePay',
  'Lainnya',
];

export default function CustomerReturnProduct() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedProductName, setSelectedProductName] = useState<string>('Semua Produk Dalam Pesanan');

  // Re-submission & Limit States
  const [isReattempt, setIsReattempt] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [lastRejectionNotes, setLastRejectionNotes] = useState<string | null>(null);

  // Solution preference state: 'REPLACEMENT' (Utama) vs 'REFUND' (Alternatif)
  const [preferredSolution, setPreferredSolution] = useState<'REPLACEMENT' | 'REFUND'>('REPLACEMENT');

  // Form states
  const [reason, setReason] = useState(REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState('');
  const [details, setDetails] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [bankName, setBankName] = useState(BANK_PRESETS[0]);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  // Proof upload states
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real order data and check return eligibility
  useEffect(() => {
    if (!orderId) {
      setLoadingOrder(false);
      return;
    }

    Promise.all([
      api.get(`/orders/${orderId}`),
      api.get('/returns').catch(() => ({ returns: [] })),
    ])
      .then(([orderRes, returnRes]: [any, any]) => {
        const o = orderRes.order || orderRes;
        if (o) {
          const items: OrderItemInfo[] = (o.items || []).map((it: any) => ({
            id: it.id,
            productId: it.productId || it.product?.id,
            productName: it.product?.name || 'Produk Pesanan',
            quantity: it.quantity,
            unitPrice: Number(it.unitPrice || 0),
            subtotal: Number(it.subtotal || 0),
            image: resolveProductImageUrl(it.product?.images?.[0]),
          }));

          setOrder({
            id: o.id,
            createdAt: o.createdAt,
            status: o.status,
            totalAmount: Number(o.totalAmount || 0),
            shippingCost: Number(o.shippingCost || 0),
            items,
          });

          if (items.length === 1) {
            setSelectedProductId(items[0].productId);
            setSelectedProductName(items[0].productName);
          }
        }

        // Check existing returns for this order to enforce 1x re-submission limit
        const existingReturns = Array.isArray(returnRes?.returns)
          ? returnRes.returns
              .filter((r: any) => r.orderId === orderId)
              .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          : [];

        if (existingReturns.length >= 2) {
          setBlockedReason('Batas maksimal pengajuan pengembalian (maksimal 1x pengajuan ulang) untuk pesanan ini telah tercapai.');
        } else if (existingReturns.length === 1) {
          const prev = existingReturns[0];
          if (['PENDING', 'APPROVED', 'SHIPPED_BY_CUSTOMER', 'RECEIVED', 'REPLACEMENT_SHIPPED', 'REFUNDED', 'COMPLETED'].includes(prev.status)) {
            setBlockedReason('Permohonan pengembalian untuk pesanan ini sedang diproses atau sudah selesai.');
          } else if (prev.status === 'REJECTED') {
            setIsReattempt(true);
            setLastRejectionNotes(prev.adminNotes || null);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load order for return:', err);
        Swal.fire({
          icon: 'error',
          title: 'Pesanan Tidak Ditemukan',
          text: 'Tidak dapat memuat detail pesanan untuk pengembalian.',
          confirmButtonColor: '#ea580c',
        });
      })
      .finally(() => {
        setLoadingOrder(false);
      });
  }, [orderId]);

  // Handle image upload to Cloudinary via /upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (proofImages.length + files.length > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Batas Maksimal Foto',
        text: 'Anda dapat mengunggah maksimal 5 foto bukti.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);
        const res = await api.upload<{ url: string }>('/upload', formData);
        if (res?.url) {
          newUrls.push(res.url);
        }
      }

      setProofImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error('Failed to upload proof image:', err);
      Swal.fire({
        icon: 'error',
        title: 'Upload Gagal',
        text: err.message || 'Gagal mengunggah foto bukti ke server.',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProofImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID Pesanan tidak valid.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    const finalReason = reason === 'Lainnya' ? (customReason.trim() || 'Lainnya') : reason;

    if (!finalReason) {
      Swal.fire({
        icon: 'warning',
        title: 'Alasan Wajib Diisi',
        text: 'Silakan tentukan alasan pengembalian barang Anda.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    if (!contactInfo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Kontak Wajib Diisi',
        text: 'Harap masukkan nomor WhatsApp yang dapat dihubungi.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    // Rekening wajib jika pembeli memilih Refund 100% penuh
    if (preferredSolution === 'REFUND' && (!bankAccountNumber.trim() || !bankAccountHolder.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Rekening Diperlukan untuk Refund',
        text: 'Harap masukkan nomor rekening dan nama pemilik rekening untuk pencairan dana refund 100% penuh.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    if (proofImages.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Foto Bukti Diperlukan',
        text: 'Mohon unggah minimal 1 foto bukti kerusakan atau ketidaksesuaian produk.',
        confirmButtonColor: '#ea580c',
      });
      return;
    }

    setSubmitting(true);
    Swal.fire({
      title: 'Mengirim Pengajuan',
      text: 'Mohon tunggu, permohonan retur Anda sedang diproses...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Calculate 100% Full Refund (Item price + initial shipping fee)
      let refundAmount = order?.totalAmount || 0;
      const initialShipping = Number(order?.shippingCost || 0);

      if (selectedProductId !== 'all' && order?.items) {
        const item = order.items.find((it) => it.productId === selectedProductId);
        if (item) {
          refundAmount = item.subtotal + initialShipping;
        }
      }

      const payload = {
        orderId,
        productId: selectedProductId === 'all' ? null : selectedProductId,
        productName: selectedProductName,
        reason: finalReason,
        details: details.trim(),
        contactInfo: contactInfo.trim(),
        proofImages,
        videoUrl: videoUrl.trim() || null,
        faultType: 'SELLER_FAULT',
        preferredSolution,
        solutionType: preferredSolution,
        shippingFeeBearer: 'SELLER',
        refundAmount,
        refundMethod: 'Transfer Bank',
        bankName: bankName || null,
        bankAccountNumber: bankAccountNumber.trim() || null,
        bankAccountHolder: bankAccountHolder.trim() || null,
      };

      await api.post('/returns', payload);

      Swal.fire({
        icon: 'success',
        title: 'Pengajuan Berhasil!',
        text: 'Permohonan pengembalian produk Anda telah diterima dan akan segera ditinjau oleh tim kami.',
        confirmButtonColor: '#ea580c',
      }).then(() => {
        navigate('/customer/returns');
      });
    } catch (err: any) {
      console.error('Failed to submit return request:', err);
      Swal.fire({
        icon: 'error',
        title: 'Pengajuan Gagal',
        text: err.message || 'Terjadi kesalahan saat memproses permohonan pengembalian.',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOrder) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4 flex flex-col items-center justify-center">
        <RefreshCcw className="h-10 w-10 text-orange-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Memuat data pesanan...</p>
      </div>
    );
  }

  if (blockedReason) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Tidak Dapat Mengajukan Pengembalian</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">{blockedReason}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/customer/orders"
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
            >
              Daftar Pesanan
            </Link>
            <Link
              to={`/customer/returns?orderId=${orderId}`}
              className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition"
            >
              Lacak Pengembalian
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {isReattempt && (
          <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
            <div className="flex items-start space-x-3">
              <RotateCcw className="text-amber-600 flex-shrink-0 mt-0.5" size={22} />
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase tracking-wider mb-1">
                  Pengajuan Ulang (Kesempatan Terakhir - Maksimal 1x)
                </span>
                <h3 className="font-bold text-amber-950 text-sm">
                  Pengajuan Pertama Anda Sebelumnya Ditolak
                </h3>
                {lastRejectionNotes && (
                  <div className="text-xs text-amber-900 mt-1.5 bg-white/90 p-3 rounded-xl border border-amber-200 font-medium">
                    <span className="font-bold block text-[11px] text-amber-700 mb-0.5">Alasan Penolakan Admin:</span>
                    &ldquo;{lastRejectionNotes}&rdquo;
                  </div>
                )}
                <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                  Harap perbaiki dan sertakan foto bukti fisik atau video unboxing yang jelas agar permohonan pengajuan ulang ini dapat disetujui oleh admin.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/customer/orders"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" /> Kembali ke Daftar Pesanan
          </Link>
          <span className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
            {isReattempt ? 'Formulir Pengajuan Ulang' : 'Formulir Pengembalian'}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-6 text-white flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <RefreshCcw size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Ajukan Pengembalian Produk</h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-0.5">
                Pastikan data yang Anda isi lengkap dan sertakan foto bukti fisik barang.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Ringkasan Pesanan */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3 mb-3">
                <div>
                  <span className="text-xs text-gray-500">Nomor Pesanan:</span>
                  <p className="font-bold text-gray-900 text-sm sm:text-base font-mono">
                    #{orderId?.toUpperCase()}
                  </p>
                </div>
                {order && (
                  <div className="text-right sm:text-right">
                    <span className="text-xs text-gray-500">Total Transaksi:</span>
                    <p className="font-bold text-orange-600 text-sm sm:text-base">
                      Rp{order.totalAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>

              {/* Pilihan Produk yang Ingin Diretur */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Pilih Produk yang Ingin Dikembalikan
                </label>

                {order && order.items.length > 1 && (
                  <div className="mb-2">
                    <label className="flex items-center p-3 rounded-lg border border-gray-200 bg-white hover:border-orange-500 cursor-pointer transition">
                      <input
                        type="radio"
                        name="productSelect"
                        value="all"
                        checked={selectedProductId === 'all'}
                        onChange={() => {
                          setSelectedProductId('all');
                          setSelectedProductName('Semua Produk Dalam Pesanan');
                        }}
                        className="text-orange-600 focus:ring-orange-500 mr-3"
                      />
                      <span className="text-sm font-semibold text-gray-800">
                        Seluruh Pesanan ({order.items.length} Macam Produk)
                      </span>
                    </label>
                  </div>
                )}

                <div className="space-y-2">
                  {order?.items.map((item) => {
                    const isSelected = selectedProductId === item.productId;
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="productSelect"
                          value={item.productId}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedProductId(item.productId);
                            setSelectedProductName(item.productName);
                          }}
                          className="text-orange-600 focus:ring-orange-500 mr-3"
                        />
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-12 h-12 rounded-md object-cover border border-gray-100 mr-3 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/uploads/products/placeholder.svg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} barang x Rp{item.unitPrice.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 ml-2">
                          Rp{item.subtotal.toLocaleString('id-ID')}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Banner Garansi Skenario A (Kesalahan Toko) */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3.5 shadow-sm">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl flex-shrink-0 mt-0.5 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-700 text-white rounded-md tracking-wider">
                    Jaminan Toko SOTOYS - Skenario A
                  </span>
                  <span className="text-xs font-bold text-emerald-900">
                    Garansi Kesalahan Pihak Toko / Cacat Pabrik
                  </span>
                </div>
                <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
                  Jika produk mengalami cacat produksi, rusak karena kemasan tidak aman, salah kirim ukuran/warna, atau barang kurang:
                  <strong className="text-emerald-900 block mt-0.5">
                    ✨ Ongkos Kirim Pengembalian (Balik ke Gudang) 100% DITANGGUNG OLEH PENJUAL!
                  </strong>
                  Anda tidak akan dipotong biaya apapun. Pilih solusi penanganan di bawah ini:
                </p>
              </div>
            </div>

            {/* Pilihan Solusi Pengembalian (Opsi Utama vs Opsi Alternatif) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Pilih Solusi Pengembalian yang Anda Inginkan <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Pilih apakah Anda ingin barang diganti baru atau pengembalian dana penuh:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Opsi Utama: Ganti Barang Baru */}
                <div
                  onClick={() => setPreferredSolution('REPLACEMENT')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    preferredSolution === 'REPLACEMENT'
                      ? 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl ${preferredSolution === 'REPLACEMENT' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <Package size={22} />
                        </div>
                        <div>
                          <span className="inline-flex items-center text-[10px] font-black uppercase px-2 py-0.5 bg-orange-600 text-white rounded-full">
                            <Sparkles size={11} className="mr-1" /> Rekomendasi Utama
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 mt-1">Ganti Barang Baru (Replacement)</h4>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        preferredSolution === 'REPLACEMENT' ? 'border-orange-600 bg-orange-600' : 'border-gray-300'
                      }`}>
                        {preferredSolution === 'REPLACEMENT' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                      Unit yang cacat/rusak akan <strong>ditukar dengan unit baru yang normal & berfungsi sempurna</strong>.
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-orange-200/60 flex items-center text-[11px] font-bold text-orange-800">
                    <span>Ongkir balik ke gudang & ongkir kirim unit baru GRATIS ditanggung SOTOYS.</span>
                  </div>
                </div>

                {/* Opsi Alternatif: Refund 100% Penuh */}
                <div
                  onClick={() => setPreferredSolution('REFUND')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    preferredSolution === 'REFUND'
                      ? 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl ${preferredSolution === 'REFUND' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <CreditCard size={22} />
                        </div>
                        <div>
                          <span className="inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                            Opsi Alternatif
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 mt-1">Refund Dana 100% Penuh</h4>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        preferredSolution === 'REFUND' ? 'border-orange-600 bg-orange-600' : 'border-gray-300'
                      }`}>
                        {preferredSolution === 'REFUND' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                      Pengembalian dana <strong>100% penuh</strong> mencakup harga produk ditambah <strong>ongkir awal yang Anda bayarkan</strong> saat checkout.
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-orange-200/60 flex items-center text-[11px] font-bold text-orange-800">
                    <span>Direkomendasikan jika produk out-of-stock atau Anda tidak ingin barang pengganti.</span>
                  </div>
                </div>
              </div>

              {/* Rincian Transparan Nilai Refund 100% */}
              {order && (
                <div className="mt-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold block text-amber-900">
                      Rincian Nilai Pengembalian 100% Skenario A:
                    </span>
                    <span className="text-gray-600">
                      Harga Barang: <strong>Rp{(selectedProductId === 'all' ? (order.totalAmount - (order.shippingCost || 0)) : ((order.items.find(i => i.productId === selectedProductId)?.subtotal) || 0)).toLocaleString('id-ID')}</strong> + Ongkir Awal: <strong>Rp{Number(order.shippingCost || 0).toLocaleString('id-ID')}</strong>
                    </span>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Total Nilai 100% Penuh:</span>
                    <span className="font-black text-orange-600 text-base">
                      Rp{(selectedProductId === 'all' ? order.totalAmount : (((order.items.find(i => i.productId === selectedProductId)?.subtotal) || 0) + Number(order.shippingCost || 0))).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Alasan Pengembalian */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Alasan Pengembalian <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 text-sm bg-white"
              >
                {REASON_PRESETS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {reason === 'Lainnya' && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Tuliskan alasan pengembalian Anda secara spesifik..."
                  required
                  className="mt-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 text-sm"
                />
              )}
            </div>

            {/* Detail Penjelasan Masalah */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Keterangan Detail Kerusakan / Masalah
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Jelaskan secara rinci kondisi produk saat pertama kali dibuka atau kendala yang ditemukan..."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 text-sm"
              />
            </div>

            {/* Kontak WhatsApp */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Nomor WhatsApp Aktif <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Contoh: 081234567890"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tim admin akan menghubungi Anda melalui WhatsApp jika diperlukan klarifikasi lanjutan.
              </p>
            </div>

            {/* Upload Foto Bukti (Cloudinary) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-bold text-gray-800">
                  Foto Bukti Kerusakan / Label Paket (Maks. 5 Foto) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500 font-medium">
                  {proofImages.length} / 5 Foto
                </span>
              </div>

              {/* Grid Preview Foto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {proofImages.map((imgUrl, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                    <img
                      src={imgUrl}
                      alt={`Bukti ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow"
                      title="Hapus foto ini"
                    >
                      <X size={14} />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      Foto #{index + 1}
                    </span>
                  </div>
                ))}

                {proofImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50/20 rounded-xl transition cursor-pointer p-3 text-center disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <RefreshCcw size={22} className="text-orange-600 animate-spin mb-1" />
                    ) : (
                      <Upload size={22} className="text-gray-400 group-hover:text-orange-600 mb-1" />
                    )}
                    <span className="text-xs font-semibold text-gray-700">
                      {uploadingImage ? 'Mengunggah...' : '+ Tambah Foto'}
                    </span>
                    <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Video Bukti / URL Unboxing (Opsional) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Tautan Video Unboxing (Opsional)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Contoh: Link Google Drive, YouTube, atau TikTok video unboxing"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 text-sm"
              />
            </div>

            {/* Informasi Rekening Pengembalian Dana */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition ${
              preferredSolution === 'REFUND'
                ? 'bg-orange-50/60 border-orange-300 ring-1 ring-orange-400/30'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <AlertCircle size={16} className={`mr-1.5 ${preferredSolution === 'REFUND' ? 'text-orange-600' : 'text-gray-500'}`} />
                  {preferredSolution === 'REFUND'
                    ? 'Rekening Tujuan Pencairan Refund 100% (Wajib Diisi)'
                    : 'Rekening Cadangan Pengembalian Dana (Opsional)'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  preferredSolution === 'REFUND' ? 'bg-orange-200 text-orange-900 font-black' : 'bg-gray-200 text-gray-700'
                }`}>
                  {preferredSolution === 'REFUND' ? 'WAJIB' : 'OPSIONAL'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                {preferredSolution === 'REFUND'
                  ? 'Dana refund 100% penuh (harga produk + ongkir awal) akan ditransfer ke rekening ini setelah verifikasi lolos.'
                  : 'Sebagai antisipasi cadangan jika stok barang baru mendadak habis saat verifikasi fisik di gudang.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank / e-Wallet {preferredSolution === 'REFUND' && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 text-sm bg-white"
                  >
                    {BANK_PRESETS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nomor Rekening / No. HP {preferredSolution === 'REFUND' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Contoh: 1234567890"
                    required={preferredSolution === 'REFUND'}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Atas Nama Rekening {preferredSolution === 'REFUND' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required={preferredSolution === 'REFUND'}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <Link
                to="/customer/orders"
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition text-center text-sm"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {submitting ? (
                  <>
                    <RefreshCcw size={18} className="animate-spin mr-2" />
                    Mengirim Permohonan...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Kirim Permohonan Pengembalian
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}