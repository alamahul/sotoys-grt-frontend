import React from 'react';
import { Heart, ShoppingCart, Trash2, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { mockProducts } from '../../data/mock';
import { getImageUrl, handleImageError } from '../../utils/api';

export default function CustomerWishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const wishlist = mockProducts.filter(p => wishlistItems.includes(p.id));

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      Swal.fire({
        title: 'Stok Habis!',
        text: `Maaf, stok untuk produk "${product.name}" saat ini sedang kosong.`,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
      });
      return;
    }
    addToCart(product);
    Swal.fire({
      title: 'Ditambahkan!',
      text: `${product.name} berhasil ditambahkan ke keranjang.`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ea580c',
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
          <Heart className="mr-3 text-pink-500 fill-current" />
          Daftar Keinginan (Wishlist)
        </h1>

        <Link to="/customer/dashboard" className="w-70 mb-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center text-sm hover:bg-orange-500 hover:text-white">
          <ChevronLeft size={16} className="mr-1" /> Kembali ke Dashboard
        </Link>
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Heart size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Wishlist Anda Kosong</h2>
            <p className="text-gray-500 mb-6">Anda belum menambahkan mainan apapun ke daftar keinginan.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group relative">
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm z-10 transition-colors"
                  title="Hapus dari Wishlist"
                >
                  <Trash2 size={16} />
                </button>
                <Link to={`/product/${item.slug || item.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={getImageUrl(item.images[0])} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    onError={handleImageError}
                  />
                </Link>
                <div className="p-4 flex flex-col flex-grow">
                  <Link to={`/product/${item.slug || item.id}`} className="font-bold text-gray-900 hover:text-orange-600 line-clamp-2 mb-1">
                    {item.name}
                  </Link>
                  <p className="text-lg font-bold text-orange-600 mb-4">{formatCurrency(item.price)}</p>
                  <div className="mt-auto">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`w-full flex justify-center items-center py-2 px-4 rounded-lg font-bold transition-colors cursor-pointer ${
                        item.stock <= 0
                          ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'
                      }`}
                    >
                      <ShoppingCart size={18} className="mr-2" /> {item.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
