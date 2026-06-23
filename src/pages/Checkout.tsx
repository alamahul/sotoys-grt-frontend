import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
// TAMBAHAN: Menambahkan icon 'Tag' untuk UI Promo
import { MapPin, Truck, CreditCard, ChevronRight, Check, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const couriers = [
  { id: 'c1', name: 'SOTOYS Express', type: 'Reguler', price: 15000, est: '1-2 hari' },
  { id: 'c2', name: 'JNE', type: 'YES', price: 25000, est: '1 hari (Besok Sampai)' },
  { id: 'c3', name: 'SiCepat', type: 'HALU', price: 10000, est: '2-3 hari' }
];

// TAMBAHAN: Mock Data Promo yang disesuaikan dengan kode dari Promo.tsx
const AVAILABLE_PROMOS = [
  {
    code: 'NEW10SOTOYS',
    type: 'percent' as const,
    value: 10,
    maxDiscount: 50000,
    minSpend: 0
  },
  {
    code: 'FREESHIP20',
    type: 'shipping' as const,
    value: 20000,
    minSpend: 200000
  },
  {
    code: 'SOTOYSGARUT',
    type: 'flat' as const,
    value: 30000,
    minSpend: 150000
  }
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice: subtotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const userAddresses = user?.addresses || [];

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedCourier, setSelectedCourier] = useState(couriers[0].id);
  const [isProcessing, setIsProcessing] = useState(false);

  // Promo & Coupon States
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: 'percent' | 'shipping' | 'flat'; value: number; maxDiscount?: number; minSpend: number } | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    if (userAddresses.length > 0) {
      const primary = userAddresses.find(a => a.isPrimary);
      setSelectedAddress(primary ? primary.id : userAddresses[0].id);
    }
  }, [userAddresses]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const shippingCost = couriers.find(c => c.id === selectedCourier)?.price || 0;

  // Calculate Discount Amount (Logika bawaan Anda yang sudah sangat bagus)
  useEffect(() => {
    if (!appliedPromo) {
      setDiscountAmount(0);
      return;
    }

    if (subtotal < appliedPromo.minSpend) {
      showToast(`Minimal belanja untuk promo ini adalah ${formatCurrency(appliedPromo.minSpend)}`, 'error');
      setAppliedPromo(null);
      setDiscountAmount(0);
      return;
    }

    if (appliedPromo.type === 'percent') {
      let calcDiscount = subtotal * (appliedPromo.value / 100);
      if (appliedPromo.maxDiscount && calcDiscount > appliedPromo.maxDiscount) {
        calcDiscount = appliedPromo.maxDiscount;
      }
      setDiscountAmount(calcDiscount);
    } else if (appliedPromo.type === 'shipping') {
      let calcDiscount = Math.min(shippingCost, appliedPromo.value);
      setDiscountAmount(calcDiscount);
    } else if (appliedPromo.type === 'flat') {
      setDiscountAmount(appliedPromo.value);
    }
  }, [appliedPromo, subtotal, shippingCost]);

  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  // TAMBAHAN: Fungsi untuk memproses klaim/redeem kode promo
  const handleApplyPromo = () => {
    const cleanInput = promoInput.trim().toUpperCase();
    if (!cleanInput) return;

    // Cari keselarasan kode promo
    const promo = AVAILABLE_PROMOS.find(p => p.code === cleanInput);

    if (!promo) {
      Swal.fire({
        title: 'Kode Promo Tidak Valid',
        text: 'Kode promo tidak valid atau telah kedaluwarsa.',
        icon: 'error',
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    // Validasi syarat minimum belanja
    if (subtotal < promo.minSpend) {
      Swal.fire({
        title: 'Kode Promo Tidak Valid',
        text: `Gagal memasang kode. Minimal belanja untuk promo ini adalah ${formatCurrency(promo.minSpend)}`,
        icon: 'error',
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    setAppliedPromo(promo);
    Swal.fire({
      title: 'Promo Berhasil Diterapkan',
      text: `Kode promo ${promo.code} berhasil diterapkan!`,
      icon: 'success',
      confirmButtonColor: '#ea580c'
    });
  };

  // TAMBAHAN: Fungsi untuk menghapus promo yang sedang aktif
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    Swal.fire({
      title: 'Promo Dihapus',
      text: 'Promo berhasil dilepas.',
      icon: 'info',
      confirmButtonColor: '#ea580c'
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    clearCart();
    Swal.fire({
      title: 'Pembayaran Berhasil!',
      text: 'Pesanan Anda telah berhasil dibuat. Terima kasih sudah berbelanja di SOTOYS GARUT!',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Lihat Pesanan',
      cancelButtonText: 'Kembali ke Katalog',
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/customer/orders');
      } else {
        navigate('/catalog');
      }
    });
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h2>
          <p className="text-gray-500 mb-6">Tambahkan produk sebelum melanjutkan ke checkout.</p>
          <Link
            to="/"
            className="w-full inline-block px-4 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-gray-200" aria-hidden="true"></div>

            {/* Step 1 */}
            <div className={`relative flex flex-col items-center ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-white border-2 ${currentStep >= 1 ? 'border-orange-600' : 'border-gray-300'}`}>
                {currentStep > 1 ? <Check size={16} /> : '1'}
              </div>
              <span className="mt-2 text-xs font-semibold bg-gray-50 px-2">Alamat</span>
            </div>

            {/* Step 2 */}
            <div className={`relative flex flex-col items-center ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-white border-2 ${currentStep >= 2 ? 'border-orange-600' : 'border-gray-300'}`}>
                {currentStep > 2 ? <Check size={16} /> : '2'}
              </div>
              <span className="mt-2 text-xs font-semibold bg-gray-50 px-2">Pengiriman</span>
            </div>

            {/* Step 3 */}
            <div className={`relative flex flex-col items-center ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-white border-2 ${currentStep >= 3 ? 'border-orange-600' : 'border-gray-300'}`}>
                3
              </div>
              <span className="mt-2 text-xs font-semibold bg-gray-50 px-2">Konfirmasi</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Areas */}
          <div className="lg:w-2/3">

            {/* STEP 1: Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="text-orange-600" size={24} />
                  <h2 className="text-lg font-bold text-gray-900">Pilih Alamat Pengiriman</h2>
                </div>
                <div className="space-y-4">
                  {userAddresses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <p className="text-sm text-gray-500 mb-4">Anda belum menambahkan alamat pengiriman.</p>
                      <Link
                        to="/customer/profile"
                        className="inline-flex items-center px-4 py-2 border border-orange-600 text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition text-sm"
                      >
                        + Atur Alamat di Profil
                      </Link>
                    </div>
                  ) : (
                    <>
                      {userAddresses.map((address) => (
                        <label
                          key={address.id}
                          className={`block cursor-pointer rounded-lg border p-4 transition-colors ${selectedAddress === address.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="address"
                              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                              checked={selectedAddress === address.id}
                              onChange={() => setSelectedAddress(address.id)}
                            />
                            <div className="ml-3">
                              <span className="block text-sm font-medium text-gray-900">
                                {address.label} ({address.recipientName} - {address.phone})
                                {address.isPrimary && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Utama</span>}
                              </span>
                              <span className="block text-sm text-gray-500 mt-1">
                                {address.details}, {address.city}, {address.province}, {address.postalCode}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                      <Link to="/customer/profile" className="text-sm text-orange-600 font-semibold hover:text-orange-700 mt-2 inline-block">
                        + Kelola / Tambah Alamat Baru di Profil
                      </Link>
                    </>
                  )}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedAddress}
                    className="px-6 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lanjut Pilih Kurir
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Courier */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Truck className="text-orange-600" size={24} />
                  <h2 className="text-lg font-bold text-gray-900">Pilih Kurir</h2>
                </div>
                <div className="space-y-4">
                  {couriers.map((courier) => (
                    <label
                      key={courier.id}
                      className={`block cursor-pointer rounded-lg border p-4 transition-colors ${selectedCourier === courier.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="courier"
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                            checked={selectedCourier === courier.id}
                            onChange={() => setSelectedCourier(courier.id)}
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">{courier.name} - {courier.type}</span>
                            <span className="block text-sm text-gray-500 mt-0.5">Estimasi: {courier.est}</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(courier.price)}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded font-medium hover:bg-gray-50 transition focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Lanjut Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Detail Pesanan */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <Check className="text-orange-600 mr-2" size={20} /> Konfirmasi Detail Pesanan
                  </h2>
                  <p className="text-sm text-gray-500">
                    Mohon periksa kembali detail pesanan Anda sebelum melanjutkan ke proses pembayaran Midtrans.
                  </p>
                </div>

                {/* Shipping Address Detail */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <MapPin className="text-orange-600 mr-2" size={16} /> Alamat Pengiriman
                  </h3>
                  {(() => {
                    const addr = userAddresses.find(a => a.id === selectedAddress);
                    if (!addr) return <p className="text-sm text-red-500">Alamat belum dipilih.</p>;
                    return (
                      <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-gray-950">{addr.recipientName}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">{addr.phone}</span>
                          <span className="text-xs bg-orange-100 text-orange-800 font-medium px-2 py-0.5 rounded">{addr.label}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed mt-1">
                          {addr.details}, {addr.city}, {addr.province}, {addr.postalCode}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Shipping Courier Detail */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <Truck className="text-orange-600 mr-2" size={16} /> Kurir Pengiriman
                  </h3>
                  {(() => {
                    const courier = couriers.find(c => c.id === selectedCourier);
                    if (!courier) return <p className="text-sm text-red-500">Kurir belum dipilih.</p>;
                    return (
                      <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-950">{courier.name} ({courier.type})</p>
                          <p className="text-xs text-gray-500 mt-0.5">Estimasi Pengiriman: {courier.est}</p>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(courier.price)}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Items Detail */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Item Pesanan ({cartItems.length} produk)</h3>
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <div key={item.product.id} className="flex justify-between items-center text-sm bg-gray-50/50 p-3 rounded-lg border border-gray-100/50">
                        <div className="flex items-center space-x-3 truncate pr-4">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded-md bg-gray-100 flex-shrink-0" />
                          <div className="truncate">
                            <span className="block font-medium text-gray-900 truncate">{item.product.name}</span>
                            {item.selectedVariant && item.variantType && (
                              <span className="block text-xs text-orange-600 font-medium mt-0.5">
                                Varian: {item.variantType}: {item.selectedVariant}
                              </span>
                            )}
                            {item.selectedVariant && !item.variantType && (
                              <span className="block text-xs text-orange-600 font-medium mt-0.5">
                                Varian: {item.selectedVariant}
                              </span>
                            )}
                            <span className="block text-xs text-gray-500 mt-0.5">{formatCurrency(item.product.price)} x{item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 flex-shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded font-medium hover:bg-gray-50 transition focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    disabled={isProcessing}
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 transition focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center justify-center min-w-[170px]"
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Bayar Sekarang'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Global Summary */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Belanja</h2>

              {/* BARU: Input & Status Redeem Kode Promo */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Tag size={16} className="mr-1 text-orange-600" /> Punya Kode Promo?
                </label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                    <div className="flex flex-col text-emerald-800">
                      <span className="font-bold tracking-wider">{appliedPromo.code}</span>
                      <span className="text-xs text-emerald-600">Promo Berhasil Dipasang</span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-red-500 hover:text-red-700 font-semibold text-xs transition"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Contoh: SOTOYSGARUT"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-grow p-2 border border-gray-300 rounded-md text-sm uppercase placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-semibold hover:bg-gray-800 transition"
                    >
                      Pakai
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between">
                  <span>Total Harga ({cartItems.length} produk)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                {currentStep >= 2 && (
                  <div className="flex justify-between">
                    <span>Ongkos Kirim ({couriers.find(c => c.id === selectedCourier)?.name})</span>
                    <span className="font-medium text-gray-900">{formatCurrency(shippingCost)}</span>
                  </div>
                )}
                {/* BARU: Menampilkan Potongan Diskon secara Dinamis */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Diskon Promo ({appliedPromo?.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-6">
                <span>Total Tagihan</span>
                <span className="text-orange-600">{formatCurrency(total)}</span>
              </div>

              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center justify-center"
                >
                  Lanjut ke {currentStep === 1 ? 'Pengiriman' : 'Konfirmasi'}
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center justify-center disabled:opacity-75"
                >
                  {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}