import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Clock, ChevronRight, ShoppingBag, Copy, CheckCircle } from 'lucide-react';
import { mockProducts } from '../data/mock';
import { useCart } from '../context/CartContext';

export default function Promo() {
  const { addToCart } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter products that apply for promo (just a mock logic)
  const promoProducts = mockProducts.filter(p => p.price > 100000);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-orange-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Promo & Penawaran Spesial</h1>
        <p className="text-lg text-orange-100 max-w-2xl mx-auto">
          Dapatkan berbagai diskon menarik dan penawaran eksklusif hanya untuk Anda pelanggan setia SOTOYS GARUT.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Coupons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Coupon 1 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100 flex flex-col">
            <div className="bg-orange-100 p-6 flex flex-col items-center justify-center text-center border-b border-orange-200 border-dashed">
              <span className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-2">Diskon Pengguna Baru</span>
              <span className="text-4xl font-extrabold text-gray-900 mb-1">10% OFF</span>
              <span className="text-sm text-gray-500">Maksimal potongan Rp 50.000</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock size={16} className="mr-1" /> Berlaku s/d 31 Des 2023
              </div>
              <p className="text-sm text-gray-600 mb-6">Gunakan kode ini saat checkout untuk mendapatkan potongan harga pada pembelian pertama Anda.</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <span className="font-mono font-bold text-gray-800 tracking-wider">NEW10SOTOYS</span>
                  <button 
                    onClick={() => handleCopy('NEW10SOTOYS')}
                    className="text-orange-600 hover:text-orange-700 p-1"
                  >
                    {copiedCode === 'NEW10SOTOYS' ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon 2 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 flex flex-col">
            <div className="bg-blue-100 p-6 flex flex-col items-center justify-center text-center border-b border-blue-200 border-dashed">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">Gratis Ongkir</span>
              <span className="text-4xl font-extrabold text-gray-900 mb-1">Rp 0</span>
              <span className="text-sm text-gray-500">Min. belanja Rp 200.000</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock size={16} className="mr-1" /> Berlaku s/d 30 Nov 2023
              </div>
              <p className="text-sm text-gray-600 mb-6">Potongan ongkos kirim hingga Rp 20.000 ke seluruh Indonesia untuk kategori mainan edukasi.</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <span className="font-mono font-bold text-gray-800 tracking-wider">FREESHIP20</span>
                  <button 
                    onClick={() => handleCopy('FREESHIP20')}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    {copiedCode === 'FREESHIP20' ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon 3 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100 flex flex-col">
            <div className="bg-green-100 p-6 flex flex-col items-center justify-center text-center border-b border-green-200 border-dashed">
              <span className="text-green-600 font-bold uppercase tracking-widest text-sm mb-2">Potongan Belanja</span>
              <span className="text-4xl font-extrabold text-gray-900 mb-1">Rp 30.000</span>
              <span className="text-sm text-gray-500">Min. belanja Rp 150.000</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock size={16} className="mr-1" /> Berlaku s/d 31 Des 2026
              </div>
              <p className="text-sm text-gray-600 mb-6">Diskon potongan langsung Rp 30.000 untuk transaksi dengan produk mainan apa saja.</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <span className="font-mono font-bold text-gray-800 tracking-wider">SOTOYSGARUT</span>
                  <button 
                    onClick={() => handleCopy('SOTOYSGARUT')}
                    className="text-green-600 hover:text-green-700 p-1"
                  >
                    {copiedCode === 'SOTOYSGARUT' ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Products */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Tag className="mr-2 text-orange-600" /> Produk yang Berlaku
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promoProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group overflow-hidden border border-gray-100 flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Promo
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <Link to={`/product/${product.id}`} className="block flex-grow">
                  <h3 className="text-gray-900 font-medium text-sm leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-xs text-gray-400 line-through block">{formatCurrency(product.price * 1.2)}</span>
                    <span className="text-lg font-bold text-orange-600">{formatCurrency(product.price)}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="p-2 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors"
                  >
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
