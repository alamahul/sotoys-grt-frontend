import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Check, Heart } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl, handleImageError } from '../utils/api';
import VariantSelectionModal from './VariantSelectionModal';

interface ProductCardProps {
  product: Product;
  key?: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isNearScreen, setIsNearScreen] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearScreen(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = () => {
    if (product.variations && product.variations.length > 0) {
      setShowVariantModal(true);
    } else {
      addToCart(product, 1);
      setAdded(true);
      Swal.fire({
        title: 'Ditambahkan!',
        text: `${product.name} berhasil ditambahkan ke keranjang.`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
        timer: 2000,
        timerProgressBar: true,
      });
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product.variations && product.variations.length > 0) {
      setShowVariantModal(true);
    } else {
      addToCart(product, 1);
      navigate('/checkout');
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link click
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      Swal.fire({
        title: 'Dihapus!',
        text: `${product.name} dihapus dari wishlist.`,
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
        timer: 2000,
        timerProgressBar: true,
      });
    } else {
      addToWishlist(product.id);
      Swal.fire({
        title: 'Ditambahkan!',
        text: `${product.name} ditambahkan ke wishlist.`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  // Format to IDR
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(product.price);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col focus-within:ring-2 focus-within:ring-orange-500 relative min-h-[350px]"
    >
      {!isNearScreen ? (
        // Virtual Scrolling Placeholder (Lightweight Skeleton DOM Node)
        <div className="w-full h-full flex flex-col animate-pulse">
          <div className="aspect-square bg-gray-100 w-full"></div>
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-100 rounded w-1/2"></div>
            <div className="h-8 bg-gray-100 rounded w-full mt-4"></div>
          </div>
        </div>
      ) : (
        // Heavy actual content loaded lazily
        <>
          <Link to={`/product/${product.slug || product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={getImageUrl(product.images[0])}
              alt={`Gambar ${product.name}`}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={handleImageError}
            />
            {product.stock <= 0 ? (
              <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Stok Habis
              </span>
            ) : product.stock < 5 ? (
              <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Sisa {product.stock}
              </span>
            ) : null}
          </Link>
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm z-10 transition-colors"
            aria-label={isInWishlist(product.id) ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
          >
            <Heart size={18} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""} />
          </button>

          <div className="p-4 flex flex-col flex-grow">
            <Link to={`/product/${product.slug || product.id}`}>
              <h3 className="text-gray-800 font-medium text-sm line-clamp-2 hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-orange-600 font-bold mt-1 text-lg">{formattedPrice}</p>
            <div className="flex items-center mt-auto pt-2 space-x-1 text-xs text-gray-500">
              <Star className="text-yellow-400 fill-current" size={14} />
              <span>4.8</span>
              <span className="px-1">•</span>
              <span>Terjual 100+</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full mt-3 flex items-center justify-center space-x-2 font-medium py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 ${
                product.stock <= 0
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  : added
                  ? 'bg-green-500 text-white border border-green-500 hover:bg-green-600'
                  : 'bg-white text-orange-600 border border-orange-600 hover:bg-orange-50 cursor-pointer'
              }`}
              aria-label={`Tambah ${product.name} ke keranjang`}
            >
              {product.stock <= 0 ? (
                <>
                  <ShoppingCart size={18} />
                  <span>Stok Habis</span>
                </>
              ) : added ? (
                <>
                  <Check size={18} />
                  <span>Ditambahkan</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>Tambah</span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Variant Selection Modal */}
      <VariantSelectionModal
        product={product}
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        onAddToCart={(qty, variant) => {
          addToCart(product, qty, variant);
          setAdded(true);
          const variantText = variant ? ` (${variant.type}: ${variant.option})` : '';
          Swal.fire({
            title: 'Ditambahkan!',
            text: `${product.name}${variantText} berhasil ditambahkan ke keranjang.`,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ea580c',
            timer: 2000,
            timerProgressBar: true,
          });
          setTimeout(() => setAdded(false), 2000);
        }}
        onBuyNow={(qty, variant) => {
          addToCart(product, qty, variant);
          navigate('/checkout');
        }}
      />
    </div>
  );
}