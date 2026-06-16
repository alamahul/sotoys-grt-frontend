import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-full p-6 mb-6 inline-flex items-center justify-center">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang belanja kosong</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">Mulai cari mainan favoritmu sekarang dan penuhi keranjang ini!</p>
        <Link
          to="/"
          className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="lg:w-2/3 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <span className="font-semibold text-gray-800">
                  Total Produk ({cartItems.length})
                </span>
              </div>
              
              <ul className="space-y-6">
                {cartItems.map((item) => (
                  <li key={item.product.id} className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-md bg-gray-100 border border-gray-100 flex-shrink-0"
                    />
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="text-gray-900 font-medium line-clamp-2 hover:text-orange-600 transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <span className="font-bold text-gray-900 ml-4 whitespace-nowrap">
                          {formatCurrency(item.product.price)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-4">
                        Sisa Stok: <span className="font-medium text-gray-700">{item.product.stock}</span>
                      </div>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <button 
                          onClick={() => {
                            removeFromCart(item.product.id);
                            showToast('Item dihapus dari keranjang', 'info');
                          }}
                          className="flex items-center text-sm font-medium text-gray-500 hover:text-red-500 transition-colors py-1 focus:outline-none"
                        >
                          <Trash2 size={16} className="mr-1.5" />
                          Hapus
                        </button>
                        
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition focus:outline-none"
                            disabled={item.quantity <= 1}
                          >-</button>
                          <input 
                            type="number" 
                            className="w-10 sm:w-12 text-center text-sm border-x border-gray-300 py-1.5 text-gray-900 focus:outline-none bg-white"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, Math.max(1, Math.min(item.product.stock, parseInt(e.target.value) || 1)))}
                            min="1"
                            max={item.product.stock}
                          />
                          <button 
                            onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition focus:outline-none"
                            disabled={item.quantity >= item.product.stock}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>
              
              <div className="space-y-4 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Total Harga ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} barang)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              
              <hr className="border-gray-100 mb-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-gray-900">Total Tagihan</span>
                <span className="text-xl font-bold text-orange-600 truncate max-w-[60%] pl-2 text-right">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm"
              >
                Beli ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
