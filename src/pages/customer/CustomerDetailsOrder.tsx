import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  CheckCircle,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CreditCard,
  Copy,
  Clock,
  QrCode,
  Building2,
  Wallet,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Upload,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink,
  RefreshCcw,
  RotateCcw
} from 'lucide-react';
import Swal from 'sweetalert2';
import api, { getImageUrl } from '../../utils/api';
import { mapBackendOrderStatus } from './CustomerOrders';

declare global {
  interface Window {
    snap: any;
  }
}

export default function CustomerDetailsOrder() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment modal & method states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'midtrans' | 'manual'>('midtrans');
  const [isPaying, setIsPaying] = useState(false);

  // Manual proof upload states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('BCA');
  const [notes, setNotes] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/orders/${id}`),
      api.get('/returns').catch(() => ({ returns: [] })),
    ])
      .then(([res, returnRes]) => {
        if (res?.order) {
          const o = res.order;
          const allReturns = [
            ...(Array.isArray(returnRes?.returns) ? returnRes.returns.filter((r: any) => r.orderId === o.id) : []),
            ...(Array.isArray(o.returns) ? o.returns : []),
          ];
          const sortedReturns = allReturns.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          const returnRecord = sortedReturns.length > 0 ? sortedReturns[0] : null;

          const total = typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : (Number(o.totalAmount) || 0);
          const shippingCost = typeof o.shippingCost === 'string' ? parseFloat(o.shippingCost) : (Number(o.shippingCost) || 0);
          const subtotal = total - shippingCost;

          const mapped = {
            id: o.id,
            displayId: o.id.startsWith('ORD-') ? o.id : `ORD-${o.id.slice(0, 8).toUpperCase()}`,
            date: new Date(o.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) + ' WIB',
            status: mapBackendOrderStatus(o.status, o.payment),
            rawStatus: o.status,
            total,
            subtotal,
            shippingCost,
            paymentData: o.payment?.paymentData || null,
            returnRecord,
            returnCount: sortedReturns.length,
            items: (o.items || []).map((it: any) => ({
              id: it.id,
              name: it.product?.name || 'Produk Mainan SOTOYS',
              qty: it.quantity || 1,
              price: typeof it.unitPrice === 'string' ? parseFloat(it.unitPrice) : (Number(it.unitPrice) || 0),
              image: it.product?.images?.[0] || '/assets/uploads/products/placeholder.svg',
            })),
            shipping: {
              courier: o.courier || o.shipment?.courier || 'J&T Express',
              trackingNo: o.trackingNumber || o.shipment?.trackingNumber || '-',
              cost: shippingCost,
              address: {
                name: o.address?.recipientName || o.user?.name || 'Pelanggan SOTOYS',
                phone: o.address?.phone || o.user?.phone || '-',
                detail: o.shippingAddress || o.address?.details || '-'
              }
            },
            payment: {
              method: o.paymentMethod || (o.payment?.paymentType ? `Transfer Bank (${o.payment.paymentType.toUpperCase()})` : 'Transfer Bank (BCA)'),
              status: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status) ? 'Lunas' : 'Menunggu Pembayaran'
            }
          };
          setOrder(mapped);

          // Auto open payment modal if ?pay=true query is present and order is pending
          if (searchParams.get('pay') === 'true' && o.status === 'PENDING_PAYMENT') {
            setIsPaymentModalOpen(true);
          }
        } else {
          setError('Data pesanan tidak ditemukan.');
        }
      })
      .catch(err => {
        console.warn('Failed to load order from backend:', err);
        setError('Gagal memuat detail pesanan dari server.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      icon: 'success',
      title: `${label} berhasil disalin!`
    });
  };

  const handleMidtransSnapPayment = async () => {
    setIsPaying(true);
    try {
      const res = await api.post('/payments', {
        orderId: order.id,
        grossAmount: order.total,
        paymentType: 'midtrans'
      });

      const token = res.snapToken || res.payment?.paymentData?.snapToken;

      if (!token) {
        throw new Error('Gagal mendapatkan Snap Token dari Midtrans.');
      }

      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: async (result: any) => {
            console.log('Midtrans Snap success:', result);
            try {
              await api.post(`/orders/${order.id}/pay`, {
                paymentType: result.payment_type || 'midtrans',
                result
              });
            } catch (_) {}

            Swal.fire({
              title: 'Pembayaran Berhasil!',
              text: 'Terima kasih, pembayaran via Midtrans telah diverifikasi.',
              icon: 'success',
              confirmButtonColor: '#ea580c',
              confirmButtonText: 'Selesai'
            });

            setIsPaymentModalOpen(false);
            setOrder((prev: any) => prev ? {
              ...prev,
              status: 'Diproses',
              rawStatus: 'PAID',
              payment: {
                ...prev.payment,
                status: 'Lunas',
                method: `Midtrans (${(result.payment_type || 'snap').toUpperCase()})`
              }
            } : prev);
          },
          onPending: (result: any) => {
            console.log('Midtrans Snap pending:', result);
            Swal.fire({
              title: 'Menunggu Pembayaran',
              text: 'Silakan selesaikan pembayaran sesuai petunjuk yang diberikan Midtrans.',
              icon: 'info',
              confirmButtonColor: '#ea580c'
            });
          },
          onError: (result: any) => {
            console.error('Midtrans Snap error:', result);
            Swal.fire({
              title: 'Pembayaran Gagal',
              text: 'Transaksi tidak berhasil diproses oleh Midtrans.',
              icon: 'error',
              confirmButtonColor: '#ea580c'
            });
          },
          onClose: () => {
            console.log('User closed Midtrans popup');
          }
        });
      } else if (res.redirectUrl) {
        window.open(res.redirectUrl, '_blank');
      } else {
        throw new Error('Midtrans Snap library belum termuat. Silakan refresh halaman.');
      }
    } catch (err: any) {
      console.error('Midtrans payment error:', err);
      Swal.fire({
        title: 'Kendala Midtrans',
        text: err.message || 'Gagal memuat Midtrans Snap.',
        icon: 'error',
        confirmButtonColor: '#ea580c'
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleMidtransRedirectPayment = async () => {
    setIsPaying(true);
    try {
      const res = await api.post('/payments', {
        orderId: order.id,
        grossAmount: order.total,
        paymentType: 'midtrans'
      });
      const redirectUrl = res.redirectUrl || res.payment?.paymentData?.redirectUrl;
      const token = res.snapToken || res.payment?.paymentData?.snapToken;
      const targetUrl = redirectUrl || (token ? `https://app.sandbox.midtrans.com/snap/v2/vtweb/${token}` : null);
      
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      } else {
        throw new Error('Gagal mendapatkan URL pembayaran dari Midtrans.');
      }
    } catch (err: any) {
      console.error('Midtrans redirect error:', err);
      Swal.fire({
        title: 'Kendala Midtrans',
        text: err.message || 'Gagal membuka halaman pembayaran Midtrans.',
        icon: 'error',
        confirmButtonColor: '#ea580c'
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 5MB', 'error');
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile && !proofPreview) {
      Swal.fire('Bukti Belum Dipilih', 'Silakan pilih atau ambil foto struk bukti transfer terlebih dahulu.', 'warning');
      return;
    }

    setIsUploadingProof(true);
    try {
      const formData = new FormData();
      if (proofFile) {
        formData.append('proof', proofFile);
      }
      formData.append('senderName', senderName || order?.shipping?.address?.name || 'Pelanggan SOTOYS');
      formData.append('senderBank', senderBank);
      formData.append('notes', notes);

      const token = localStorage.getItem('sotoys_token');
      const response = await fetch(`http://localhost:5000/api/orders/${order.id}/upload-proof`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || 'Gagal mengirim bukti transfer');
      }

      await Swal.fire({
        title: 'Bukti Berhasil Dikirim!',
        text: 'Terima kasih! Bukti transfer Anda telah kami terima dan segera diverifikasi oleh tim Admin SOTOYS (maksimal 1x24 jam).',
        icon: 'success',
        confirmButtonColor: '#ea580c',
        confirmButtonText: 'Selesai'
      });

      setIsPaymentModalOpen(false);
      setOrder((prev: any) => prev ? {
        ...prev,
        status: 'Menunggu Verifikasi',
        paymentData: res.order?.payment?.paymentData || {
          proofImage: proofPreview,
          senderName: senderName || prev.shipping.address.name,
          senderBank,
          notes,
          uploadedAt: new Date().toISOString(),
          status: 'PENDING_VERIFICATION'
        },
        payment: {
          ...prev.payment,
          method: `Transfer Bank Manual (${senderBank})`,
          status: 'Menunggu Verifikasi'
        }
      } : prev);
    } catch (err: any) {
      console.error('Upload proof error:', err);
      Swal.fire({
        title: 'Gagal Mengirim Bukti',
        text: err.message || 'Terjadi kesalahan jaringan saat mengirim bukti transfer.',
        icon: 'error',
        confirmButtonColor: '#ea580c'
      });
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsPaying(true);
    try {
      await api.post(`/orders/${order.id}/pay`, { paymentType: selectedMethod });

      Swal.fire({
        title: 'Pembayaran Berhasil Dikonfirmasi!',
        text: 'Terima kasih, pembayaran Anda telah diterima. Pesanan Anda kini sedang dipersiapkan dan akan segera dikirim.',
        icon: 'success',
        confirmButtonColor: '#ea580c',
        confirmButtonText: 'Selesai'
      });

      setIsPaymentModalOpen(false);
      setOrder((prev: any) => prev ? {
        ...prev,
        status: 'Diproses',
        rawStatus: 'PAID',
        payment: { ...prev.payment, status: 'Lunas' }
      } : prev);
    } catch (err: any) {
      Swal.fire({
        title: 'Gagal Konfirmasi Pembayaran',
        text: err.message || 'Terjadi kendala sistem saat memverifikasi pembayaran. Silakan coba kembali.',
        icon: 'error',
        confirmButtonColor: '#ea580c'
      });
    } finally {
      setIsPaying(false);
    }
  };

  const getVaNumber = (type: string) => {
    const rawNumber = order?.id ? order.id.replace(/\D/g, '').slice(0, 8) : '12345678';
    switch (type) {
      case 'bca_va': return `88012${rawNumber.padEnd(8, '0')}`;
      case 'mandiri_va': return `89012${rawNumber.padEnd(8, '0')}`;
      case 'briva': return `12890${rawNumber.padEnd(8, '0')}`;
      case 'manual_bca': return '148-092-8819';
      default: return `88012${rawNumber.padEnd(8, '0')}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-600 font-medium">Memuat rincian pesanan Anda...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm mb-6">{error || 'Pesanan yang Anda cari tidak tersedia atau belum terdaftar.'}</p>
          <Link
            to="/customer/orders"
            className="inline-flex items-center px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors text-sm"
          >
            <ChevronLeft size={16} className="mr-1" /> Kembali ke Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  const isWaitingVerification = order.status === 'Menunggu Verifikasi' || order.paymentData?.status === 'PENDING_VERIFICATION';
  const isRejected = order.status === 'Bukti Ditolak' || order.paymentData?.status === 'REJECTED';
  const isPendingPayment = !isWaitingVerification && !isRejected && (order.rawStatus === 'PENDING_PAYMENT' || order.status === 'Menunggu Pembayaran');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/customer/orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Kembali ke Daftar Pesanan
          </Link>
        </div>

        {/* Action Banners based on payment status */}
        {isWaitingVerification && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-blue-500/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="text-white" size={28} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-1">
                    Menunggu Verifikasi Admin
                  </span>
                  <h2 className="text-xl font-bold">Bukti Transfer Sedang Diverifikasi</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Bukti pembayaran Anda telah kami terima{order.paymentData?.uploadedAt ? ` pada ${new Date(order.paymentData.uploadedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB` : ''}. Tim Admin SOTOYS akan memverifikasi mutasi bank dalam 1x24 jam.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                {order.paymentData?.proofImage && (
                  <button
                    type="button"
                    onClick={() => setLightboxImage(order.paymentData.proofImage)}
                    className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all text-xs flex items-center backdrop-blur-sm"
                  >
                    <ImageIcon size={16} className="mr-1.5" /> Lihat Struk Saya
                  </button>
                )}
                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin SOTOYS, saya sudah transfer untuk pesanan ${order.displayId} sebesar ${formatCurrency(order.total)}. Mohon bantu verifikasi mutasi ya. Terima kasih!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-extrabold transition-all shadow-md text-xs flex items-center"
                >
                  <MessageCircle size={16} className="mr-1.5" /> Hubungi Admin via WA
                </a>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-red-500/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <AlertCircle className="text-white" size={28} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-1">
                    Pembayaran Ditolak
                  </span>
                  <h2 className="text-xl font-bold">Bukti Transfer Perlu Diunggah Ulang</h2>
                  <p className="text-red-100 text-sm mt-1">
                    Alasan: <span className="font-semibold underline">{order.paymentData?.rejectionReason || 'Bukti transfer tidak valid atau dana belum masuk ke rekening toko.'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={() => { setSelectedMethod('manual'); setIsPaymentModalOpen(true); }}
                  className="px-5 py-2.5 bg-white text-red-600 rounded-xl font-extrabold hover:bg-red-50 transition-all shadow-md text-sm flex items-center"
                >
                  <Upload size={16} className="mr-1.5" /> Unggah Ulang Bukti
                </button>
              </div>
            </div>
          </div>
        )}

        {isPendingPayment && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-orange-500/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="text-white" size={28} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-1">
                    Menunggu Pembayaran
                  </span>
                  <h2 className="text-xl font-bold">Selesaikan Pembayaran Pesanan Anda</h2>
                  <p className="text-orange-100 text-sm mt-1">
                    Silakan bayar sebesar <span className="font-extrabold text-white text-base">{formatCurrency(order.total)}</span> agar pesanan Anda dapat segera kami proses & kirim.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-6 py-3 bg-white text-orange-600 rounded-xl font-extrabold hover:bg-orange-50 transition-all shadow-md flex items-center text-sm"
                >
                  <CreditCard size={18} className="mr-2" /> Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return Status Banner */}
        {order.returnRecord && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-purple-500/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <RotateCcw className="text-white" size={28} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-1">
                    Status Pengembalian Produk
                  </span>
                  <h2 className="text-xl font-bold">
                    {order.returnRecord.status === 'REFUNDED' ? 'Dana Pengembalian Telah Ditransfer' :
                     order.returnRecord.status === 'REJECTED'
                      ? ((order.returnCount || 1) >= 2 ? 'Pengajuan Pengembalian Ditolak Permanen (Final)' : 'Pengajuan Ditolak (Tersisa 1x Kesempatan Ajukan Ulang)')
                      : order.returnRecord.status === 'APPROVED' ? 'Pengajuan Disetujui - Kirim Produk Segera' :
                     order.returnRecord.status === 'SHIPPED_BY_CUSTOMER' ? 'Barang Retur Sedang Dalam Pengiriman' :
                     order.returnRecord.status === 'RECEIVED' ? 'Barang Tiba di Gudang (Sedang Dicek QC)' :
                     'Pengajuan Pengembalian Sedang Ditinjau'}
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {order.returnRecord.status === 'REFUNDED'
                      ? `Dana sebesar Rp${Number(order.returnRecord.refundAmount || order.total).toLocaleString('id-ID')} telah berhasil dikembalikan.`
                      : order.returnRecord.status === 'REJECTED'
                      ? `${order.returnRecord.adminNotes || 'Permohonan tidak memenuhi kriteria pengembalian produk.'} ${(order.returnCount || 1) >= 2 ? 'Batas maksimal pengajuan (1x pengajuan ulang) untuk pesanan ini telah tercapai.' : 'Anda masih dapat mengajukan 1 kali lagi dengan melampirkan foto/video bukti fisik yang lebih jelas.'}`
                      : order.returnRecord.status === 'APPROVED'
                      ? 'Silakan kemas dan kirimkan barang ke alamat retur kami, kemudian masukkan nomor resi di menu Lacak Retur.'
                      : order.returnRecord.status === 'SHIPPED_BY_CUSTOMER'
                      ? `Nomor Resi: ${order.returnRecord.returnTrackingNumber || '-'} (${order.returnRecord.returnCourier || 'Kurir'})`
                      : order.returnRecord.status === 'RECEIVED'
                      ? 'Tim QC kami sedang memeriksa kelengkapan barang sebelum mencairkan pengembalian dana.'
                      : 'Permohonan retur Anda telah tercatat dan sedang menunggu verifikasi oleh tim admin.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                <Link
                  to={`/customer/returns?orderId=${order.id}${order.returnRecord.id ? `&returnId=${order.returnRecord.id}` : ''}`}
                  className="px-5 py-2.5 bg-white text-purple-700 hover:bg-purple-50 rounded-xl font-bold transition-all text-sm flex items-center shadow-md"
                >
                  <RotateCcw size={16} className="mr-2" /> Buka Lacak Retur
                </Link>
                {order.returnRecord.status === 'REJECTED' && (order.returnCount || 1) < 2 && (
                  <Link
                    to={`/customer/return/${order.id}`}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all text-sm flex items-center shadow-md"
                  >
                    <RotateCcw size={16} className="mr-2" /> Ajukan Ulang
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Detail Pesanan</h1>
            <p className="text-sm text-gray-500 mt-1">{order.displayId} • {order.date}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
            {order.rawStatus === 'DELIVERED' && (
              order.returnRecord ? (
                <>
                  <Link
                    to={`/customer/returns?orderId=${order.id}${order.returnRecord.id ? `&returnId=${order.returnRecord.id}` : ''}`}
                    className={`px-3.5 py-1.5 font-bold rounded-xl text-xs sm:text-sm flex items-center transition border shadow-sm ${
                      order.returnRecord.status === 'REFUNDED'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : order.returnRecord.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : order.returnRecord.status === 'APPROVED'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        : order.returnRecord.status === 'SHIPPED_BY_CUSTOMER'
                        ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        : order.returnRecord.status === 'RECEIVED'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                    }`}
                  >
                    <RotateCcw size={15} className="mr-1.5" />
                    {order.returnRecord.status === 'REFUNDED' ? 'Retur Selesai (Lacak)' :
                     order.returnRecord.status === 'REJECTED'
                      ? ((order.returnCount || 1) >= 2 ? 'Retur Ditolak (Final)' : 'Retur Ditolak (Lacak)')
                      : order.returnRecord.status === 'APPROVED' ? 'Retur Disetujui (Kirim Resi)' :
                     order.returnRecord.status === 'SHIPPED_BY_CUSTOMER' ? 'Barang Diretur (Lacak)' :
                     order.returnRecord.status === 'RECEIVED' ? 'Retur di Gudang (Lacak)' :
                     'Retur Diproses (Lacak)'}
                  </Link>
                  {order.returnRecord.status === 'REJECTED' && (order.returnCount || 1) < 2 && (
                    <Link
                      to={`/customer/return/${order.id}`}
                      className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-xs sm:text-sm flex items-center transition border border-amber-300 shadow-sm"
                    >
                      <RotateCcw size={15} className="mr-1.5" /> Ajukan Ulang
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to={`/customer/return/${order.id}`}
                  className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs sm:text-sm flex items-center transition border border-orange-200 shadow-sm"
                >
                  <RefreshCcw size={15} className="mr-1.5" /> Ajukan Pengembalian
                </Link>
              )
            )}
            <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-bold ${
              order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
              order.status === 'Dikirim' ? 'bg-blue-100 text-blue-800' :
              order.status === 'Diproses' ? 'bg-indigo-100 text-indigo-800' :
              order.status === 'Menunggu Verifikasi' ? 'bg-blue-100 text-blue-800' :
              order.status === 'Bukti Ditolak' ? 'bg-red-100 text-red-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center">
                  <Package className="mr-2 text-gray-400" size={20} /> Produk yang Dipesan
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-6">
                  {order.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex flex-col sm:flex-row">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-0 mr-4 border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.qty} x {formatCurrency(item.price)}</p>
                        </div>
                        <div className="mt-2 text-orange-600 font-bold">
                          {formatCurrency(item.qty * item.price)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tracking / Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900 flex items-center">
                  <Truck className="mr-2 text-gray-400" size={20} /> Informasi Pengiriman
                </h2>
                <Link to="/tracking" className="text-sm font-bold text-orange-600 hover:text-orange-700">Lacak Penuh</Link>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Kurir Pengiriman</p>
                    <p className="font-bold text-gray-900 text-sm">{order.shipping.courier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">Nomor Resi</p>
                    <p className="font-bold text-orange-600 font-mono text-sm">{order.shipping.trackingNo}</p>
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-orange-500 space-y-6">
                  <div>
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-4 border-white"></div>
                    <p className="text-xs text-orange-600 font-bold">Status Pesanan</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{order.status}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isPendingPayment
                        ? 'Menunggu pembayaran selesai untuk diproses gudang.'
                        : `Estimasi pengiriman sesuai jadwal kurir ${order.shipping.courier}.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center">
                  <MapPin className="mr-2 text-gray-400" size={20} /> Alamat Pengiriman
                </h2>
              </div>
              <div className="p-6 text-sm space-y-2">
                <p className="font-bold text-gray-900">{order.shipping.address.name}</p>
                <p className="text-gray-500">{order.shipping.address.phone}</p>
                <p className="text-gray-600 leading-relaxed pt-2 border-t border-gray-50">{order.shipping.address.detail}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Ringkasan Pembayaran</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm mb-4 border-b border-gray-100 pb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Metode Pembayaran</span>
                    <span className="font-medium text-gray-900">{order.payment.method}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Status Pembayaran</span>
                    <span className={`font-bold ${order.payment.status === 'Lunas' ? 'text-green-600' : 'text-orange-600'}`}>
                      {order.payment.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Produk</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.shippingCost)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total Belanja</span>
                  <span className="text-lg font-extrabold text-orange-600">{formatCurrency(order.total)}</span>
                </div>

                {isPendingPayment && (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full mt-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center text-sm"
                  >
                    <CreditCard size={18} className="mr-2" /> Bayar Pesanan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instruction & Checkout Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-orange-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-orange-600 text-white rounded-xl">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Pusat Pembayaran</h3>
                  <p className="text-xs text-gray-500">ID Pesanan: {order.displayId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Amount to pay */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Total Tagihan</span>
                  <p className="text-2xl font-extrabold text-orange-600 mt-0.5">{formatCurrency(order.total)}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(order.total.toString(), 'Nominal tagihan')}
                  className="px-3 py-1.5 bg-white text-orange-600 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-50 flex items-center"
                >
                  <Copy size={13} className="mr-1.5" /> Salin Nominal
                </button>
              </div>

              {/* 2 Payment Methods Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  Pilih Jalur Pembayaran:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('midtrans')}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedMethod === 'midtrans'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Sparkles size={20} className={selectedMethod === 'midtrans' ? 'text-orange-600' : 'text-gray-400'} />
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-orange-600 text-white uppercase">
                        Otomatis
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">Midtrans Snap Gateway</span>
                      <span className="text-[11px] text-gray-500 mt-1 block">VA Semua Bank, QRIS, GoPay, Kartu Kredit (Instan)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('manual')}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedMethod === 'manual'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Wallet size={20} className={selectedMethod === 'manual' ? 'text-orange-600' : 'text-gray-400'} />
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        Bebas Biaya Admin
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">Transfer Bank Manual</span>
                      <span className="text-[11px] text-gray-500 mt-1 block">Transfer ke Rekening SOTOYS + Unggah Struk</span>
                    </div>
                  </button>
                </div>
              </div>

              {selectedMethod === 'midtrans' ? (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-200 text-center space-y-4">
                  <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm text-orange-600">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-base">Gateway Resmi Midtrans Snap</h4>
                    <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                      Bayar dengan mudah menggunakan Virtual Account (BCA, Mandiri, BNI, BRI, Permata), QRIS / GoPay / ShopeePay, Kartu Kredit, atau Gerai Minimarket dengan verifikasi instan.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleMidtransSnapPayment}
                      disabled={isPaying}
                      className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-extrabold hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20 flex items-center justify-center text-sm disabled:opacity-60"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Membuka Midtrans Snap...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} className="mr-2" />
                          Buka Pop-up Midtrans Snap
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleMidtransRedirectPayment}
                      disabled={isPaying}
                      className="w-full py-2.5 bg-white border border-orange-300 text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all flex items-center justify-center text-xs"
                      title="Gunakan ini jika pop-up terblokir oleh CSP/adblocker browser"
                    >
                      <ExternalLink size={14} className="mr-1.5" />
                      Buka di Tab Baru (Jika Pop-up Terblokir / Kendala CSP)
                    </button>
                  </div>
                </div>
              ) : (
                /* Manual Bank Transfer Form */
                <form onSubmit={handleUploadPaymentProof} className="space-y-4">
                  {/* Rekening Tujuan */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Rekening Tujuan Transfer:
                    </span>

                    {/* BCA */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">BCA</span>
                          <span className="text-sm font-mono font-bold text-gray-900">148-092-8819</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">a.n. PT SOTOYS GARUT INDONESIA</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('1480928819', 'Nomor Rekening BCA')}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Salin nomor rekening"
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    {/* Mandiri */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Mandiri</span>
                          <span className="text-sm font-mono font-bold text-gray-900">177-001-9281</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">a.n. PT SOTOYS GARUT INDONESIA</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('1770019281', 'Nomor Rekening Mandiri')}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Salin nomor rekening"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Upload Struk Form */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Unggah Bukti Transfer (Struk / Tangkapan Layar): <span className="text-red-500">*</span>
                    </label>

                    {proofPreview ? (
                      <div className="relative border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <img
                            src={proofPreview}
                            alt="Preview Struk"
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {proofFile ? proofFile.name : 'Bukti Transfer'}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              ✓ Foto siap dikirimkan
                            </p>
                          </div>
                        </div>
                        <label className="cursor-pointer text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-1.5 bg-white border border-orange-200 rounded-lg shadow-sm">
                          Ganti
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-xl p-5 bg-gray-50/50 hover:bg-orange-50/20 cursor-pointer transition-all">
                        <Upload size={24} className="text-gray-400 mb-1.5" />
                        <span className="text-xs font-bold text-gray-700">Pilih Foto Struk / Screenshot Transfer</span>
                        <span className="text-[10px] text-gray-400 mt-1">Format: JPG, PNG, WebP (Maks. 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nama Pemilik Rekening Pengirim
                        </label>
                        <input
                          type="text"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder={order?.shipping?.address?.name || 'Contoh: Budi Santoso'}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Bank Pengirim
                        </label>
                        <select
                          value={senderBank}
                          onChange={(e) => setSenderBank(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none bg-white"
                        >
                          <option value="BCA">BCA</option>
                          <option value="Mandiri">Mandiri</option>
                          <option value="BRI">BRI</option>
                          <option value="BNI">BNI</option>
                          <option value="BSI">BSI</option>
                          <option value="Bank Lain">Bank Lain / E-Wallet</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Catatan Tambahan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Sudah transfer via m-BCA jam 11:30"
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUploadingProof || !proofPreview}
                      className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-extrabold hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center text-sm disabled:opacity-50"
                    >
                      {isUploadingProof ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Mengirim Bukti Transfer...
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="mr-2" />
                          Kirim Bukti Pembayaran
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="flex items-center text-xs text-gray-500 pt-1">
                <ShieldCheck size={16} className="text-green-600 mr-2 flex-shrink-0" />
                <span>Pembayaran Anda aman dan dilindungi oleh protokol keamanan SOTOYS GARUT.</span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-white text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Receipt Preview Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold text-gray-900 text-sm">Foto Bukti Transfer</h4>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-gray-950 flex justify-center max-h-[70vh] overflow-auto">
              <img
                src={getImageUrl(lightboxImage)}
                alt="Bukti Transfer"
                className="max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
